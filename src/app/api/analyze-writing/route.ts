import { NextResponse } from "next/server";

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

export const dynamic = "force-dynamic";

function errorResponse(message: string, status: number, details?: Record<string, unknown>) {
  return NextResponse.json({ error: message, ...details }, { status });
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

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (claimsError || !userId) {
    return errorResponse("请先登录后再提交作文。", 401);
  }

  const profile = await getUserProfile(userId);

  if (!profile?.onboarding_completed) {
    return errorResponse("请先完成学习档案设置。", 403);
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return errorResponse("请求格式不正确。", 400);
  }

  const payload = body as {
    questionPrompt?: unknown;
    essayText?: unknown;
    targetBand?: unknown;
    topicType?: unknown;
  };

  const validation = validateWritingSubmission({
    essayText: typeof payload.essayText === "string" ? payload.essayText : "",
    questionPrompt:
      typeof payload.questionPrompt === "string" ? payload.questionPrompt : "",
    targetBand: Number(payload.targetBand),
  });

  if (!validation.ok) {
    return errorResponse(validation.error, 400);
  }

  const { questionPrompt, essayText, targetBand, wordCount } = validation.data;
  const topicType =
    typeof payload.topicType === "string" && payload.topicType.trim()
      ? payload.topicType.trim()
      : "Task 2 写作练习";
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
    return errorResponse("作文保存失败，请稍后重试。", 500);
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
    const isParseError = error instanceof WritingReportParseError;
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
              : isParseError
                ? "parse"
                : "mimo",
        reportId,
        route: "api",
      },
    );

    if (isRateLimited) {
      return errorResponse("当前生成请求较多，请稍后再试。", 429, {
        essayId,
        reportId,
      });
    }

    return errorResponse(
      isParseError ? "报告格式不完整，可重新生成。" : "教练暂时不可用，可重试。",
      500,
      { essayId, reportId },
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
      route: "api",
    });

    return errorResponse("报告保存失败，请稍后重试。", 500, { essayId, reportId });
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
      route: "api",
    });

    return errorResponse("报告保存失败，请稍后重试。", 500, { essayId, reportId });
  }

  recordReportEvent("report_generation_completed", {
    durationMs: Date.now() - generationStartedAt,
    reportId,
    route: "api",
  });

  return NextResponse.json({ essayId, reportId });
}
