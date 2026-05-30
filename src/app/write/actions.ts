"use server";

import { redirect } from "next/navigation";

import { getUserProfile } from "@/lib/auth";
import { generateWritingReport, WritingReportParseError } from "@/lib/ai/writing-report-generator";
import {
  ReportQueueError,
  ReportRateLimitError,
  runReportGenerationWithGuard,
} from "@/lib/ai/report-generation-guard";
import {
  deleteReportArtifacts,
  insertReportArtifacts,
  normalizeReportJson,
} from "@/lib/report-persistence";
import { recordReportEvent } from "@/lib/monitoring";
import { sanitizeErrorMessage } from "@/lib/safe-error";
import { createClient } from "@/lib/supabase/server";
import { validateWritingSubmission } from "@/lib/writing-validation";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function redirectToWriteWithMessage(message: string): never {
  redirect(`/write?message=${encodeURIComponent(message)}`);
}

function normalizeTopicType(value: string) {
  return value || "Task 2 写作练习";
}

async function createFailedReport({
  essayId,
  userId,
  targetBand,
  wordCount,
  errorMessage,
}: {
  essayId: string;
  userId: string;
  targetBand: number;
  wordCount: number;
  errorMessage: string;
}) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("writing_reports")
    .insert({
      ai_json: {},
      error_message: errorMessage,
      essay_id: essayId,
      status: "failed",
      target_band: targetBand,
      user_id: userId,
      word_count: wordCount,
    })
    .select("id")
    .single();

  return data?.id as string | undefined;
}

async function getPreviousWeaknessSummary(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("weakness_tags")
    .select("category,tag,severity")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(8);

  if (!data?.length) {
    return undefined;
  }

  return data
    .map((item) => `${item.category}: ${item.tag} (${item.severity})`)
    .join("; ");
}

export async function submitWritingPractice(formData: FormData) {
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (claimsError || !userId) {
    redirect(`/auth/login?next=${encodeURIComponent("/write")}`);
  }

  const profile = await getUserProfile(userId);

  if (!profile?.onboarding_completed) {
    redirect(`/onboarding?next=${encodeURIComponent("/write")}`);
  }

  const validation = validateWritingSubmission({
    essayText: getString(formData, "essayText"),
    questionPrompt: getString(formData, "questionPrompt"),
    targetBand: Number(getString(formData, "targetBand")),
  });

  if (!validation.ok) {
    redirectToWriteWithMessage(validation.error);
  }

  const { questionPrompt, essayText, targetBand, wordCount } = validation.data;
  const topicType = normalizeTopicType(getString(formData, "topicType"));
  const { data: essay, error: essayError } = await supabase
    .from("essays")
    .insert({
      essay_text: essayText,
      profile_id: profile.id,
      prompt: questionPrompt,
      source: "user_submission",
      task_type: "task_2",
      topic_type: topicType,
      user_id: userId,
      word_count: wordCount,
    })
    .select("id")
    .single();

  if (essayError || !essay?.id) {
    redirectToWriteWithMessage("作文保存失败，请稍后重试。");
  }

  const essayId = essay.id as string;
  const previousWeaknessSummary = await getPreviousWeaknessSummary(userId);
  const generationStartedAt = Date.now();
  let reportJson;

  try {
    reportJson = await runReportGenerationWithGuard({
      generate: () =>
        generateWritingReport({
          essayText,
          previousWeaknessSummary,
          questionPrompt,
          targetBand,
          userProfile: profile,
        }),
      userId,
    });
    reportJson = normalizeReportJson({
      essayText,
      reportJson,
      targetBand,
      wordCount,
    });
  } catch (error) {
    const isRateLimited =
      error instanceof ReportRateLimitError || error instanceof ReportQueueError;
    const reportId = await createFailedReport({
      essayId,
      errorMessage: sanitizeErrorMessage(error, "report generation failed"),
      targetBand,
      userId,
      wordCount,
    });
    recordReportEvent(
      isRateLimited ? "report_generation_rate_limited" : "report_generation_failed",
      {
        durationMs: Date.now() - generationStartedAt,
        reason:
          error instanceof ReportRateLimitError
            ? "rate_limit"
            : error instanceof ReportQueueError
              ? "queue"
              : error instanceof WritingReportParseError
                ? "parse"
                : "mimo",
        reportId,
        route: "server_action",
      },
    );

    if (reportId) {
      redirect(`/report/${reportId}`);
    }

    redirectToWriteWithMessage(
      error instanceof ReportRateLimitError || error instanceof ReportQueueError
        ? "当前生成请求较多，请稍后再试。"
        : error instanceof WritingReportParseError
        ? "报告格式不完整，可重新提交。"
        : "教练暂时不可用，可重试。",
    );
  }

  const { data: report, error: reportError } = await supabase
    .from("writing_reports")
    .insert({
      ai_json: reportJson,
      biggest_gap: reportJson.biggest_gap,
      coach_summary: reportJson.coach_summary,
      criteria: reportJson.criteria,
      diagnostic_band: reportJson.diagnostic_band,
      essay_id: essayId,
      next_practice_suggestion: reportJson.next_practice_suggestion,
      priority_fix: reportJson.priority_fix,
      status: "completed",
      target_band: reportJson.target_band,
      user_id: userId,
      word_count: reportJson.word_count,
    })
    .select("id")
    .single();

  if (reportError || !report?.id) {
    const reportId = await createFailedReport({
      essayId,
      errorMessage: sanitizeErrorMessage(reportError, "writing report insert failed"),
      targetBand,
      userId,
      wordCount,
    });
    recordReportEvent("report_generation_failed", {
      durationMs: Date.now() - generationStartedAt,
      reason: "storage",
      reportId,
      route: "server_action",
    });

    if (reportId) {
      redirect(`/report/${reportId}`);
    }

    redirectToWriteWithMessage("报告保存失败，请稍后重试。");
  }

  const reportId = report.id as string;
  const writeError = await insertReportArtifacts({
    reportId,
    reportJson,
    supabase,
    userId,
  });

  if (writeError) {
    await deleteReportArtifacts({ reportId, supabase });
    await supabase
      .from("writing_reports")
      .update({
        error_message: sanitizeErrorMessage(writeError, "report artifact write failed"),
        status: "failed",
      })
      .eq("id", reportId);
    recordReportEvent("report_generation_failed", {
      durationMs: Date.now() - generationStartedAt,
      reason: "storage",
      reportId,
      route: "server_action",
    });
  } else {
    recordReportEvent("report_generation_completed", {
      durationMs: Date.now() - generationStartedAt,
      reportId,
      route: "server_action",
    });
  }

  redirect(`/report/${reportId}`);
}
