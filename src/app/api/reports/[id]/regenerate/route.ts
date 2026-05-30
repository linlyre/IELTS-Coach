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

export const maxDuration = 180;

type RegenerateRouteProps = {
  params: Promise<{ id: string }>;
};

type EssayForRegenerate = {
  id: string;
  prompt: string;
  essay_text: string;
  word_count: number;
};

type ReportForRegenerate = {
  id: string;
  target_band: number | null;
  essays: EssayForRegenerate | EssayForRegenerate[] | null;
};

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function getEssay(row: ReportForRegenerate) {
  return Array.isArray(row.essays) ? row.essays[0] : row.essays;
}

async function getPreviousWeaknessSummary(userId: string, reportId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("weakness_tags")
    .select("category,tag,severity")
    .eq("user_id", userId)
    .neq("report_id", reportId)
    .order("created_at", { ascending: false })
    .limit(8);

  if (!data?.length) {
    return undefined;
  }

  return data
    .map((item) => `${item.category}: ${item.tag} (${item.severity})`)
    .join("; ");
}

export async function POST(_request: Request, { params }: RegenerateRouteProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (claimsError || !userId) {
    return errorResponse("请先登录后再重新生成报告。", 401);
  }

  const profile = await getUserProfile(userId);

  if (!profile?.onboarding_completed) {
    return errorResponse("请先完成学习档案设置。", 403);
  }

  const { data: report } = await supabase
    .from("writing_reports")
    .select("id,target_band,essays(id,prompt,essay_text,word_count)")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  if (!report) {
    return errorResponse("没有找到可重新生成的报告。", 404);
  }

  const reportRow = report as unknown as ReportForRegenerate;
  const essay = getEssay(reportRow);

  if (!essay) {
    return errorResponse("没有找到关联作文。", 404);
  }

  const targetBand = reportRow.target_band ?? Number(profile.target_band);
  const previousWeaknessSummary = await getPreviousWeaknessSummary(userId, id);
  const generationStartedAt = Date.now();

  try {
    const generatedReport = await runReportGenerationWithGuard({
      generate: () =>
        generateWritingReport({
          essayText: essay.essay_text,
          previousWeaknessSummary,
          questionPrompt: essay.prompt,
          targetBand,
          userProfile: profile,
        }),
      userId,
    });
    const reportJson = normalizeReportJson({
      essayText: essay.essay_text,
      reportJson: generatedReport,
      targetBand,
      wordCount: essay.word_count,
    });

    await deleteReportArtifacts({ reportId: id, supabase });

    const { error: updateError } = await supabase
      .from("writing_reports")
      .update({
        ai_json: reportJson,
        biggest_gap: reportJson.biggest_gap,
        coach_summary: reportJson.coach_summary,
        criteria: reportJson.criteria,
        diagnostic_band: reportJson.diagnostic_band,
        error_message: null,
        next_practice_suggestion: reportJson.next_practice_suggestion,
        priority_fix: reportJson.priority_fix,
        status: "completed",
        target_band: reportJson.target_band,
        word_count: reportJson.word_count,
      })
      .eq("id", id)
      .eq("user_id", userId);

    if (updateError) {
      throw updateError;
    }

    const writeError = await insertReportArtifacts({
      reportId: id,
      reportJson,
      supabase,
      userId,
    });

    if (writeError) {
      await deleteReportArtifacts({ reportId: id, supabase });
      await supabase
        .from("writing_reports")
        .update({
          error_message: sanitizeErrorMessage(writeError, "report artifact write failed"),
          status: "failed",
        })
        .eq("id", id)
        .eq("user_id", userId);
      recordReportEvent("report_generation_failed", {
        durationMs: Date.now() - generationStartedAt,
        reason: "storage",
        reportId: id,
        route: "regenerate",
      });

      return errorResponse("报告保存失败，请稍后重试。", 500);
    }

    recordReportEvent("report_generation_completed", {
      durationMs: Date.now() - generationStartedAt,
      reportId: id,
      route: "regenerate",
    });

    return NextResponse.json({ reportId: id });
  } catch (error) {
    const isRateLimited =
      error instanceof ReportRateLimitError || error instanceof ReportQueueError;
    await supabase
      .from("writing_reports")
      .update({
        error_message: sanitizeErrorMessage(error, "regeneration failed"),
        status: "failed",
      })
      .eq("id", id)
      .eq("user_id", userId);

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
        reportId: id,
        route: "regenerate",
      },
    );

    if (isRateLimited) {
      return errorResponse("当前生成请求较多，请稍后再试。", 429);
    }

    return errorResponse(
      error instanceof WritingReportParseError
        ? "报告格式不完整，可重新生成。"
        : "教练暂时不可用，可重试。",
      500,
    );
  }
}
