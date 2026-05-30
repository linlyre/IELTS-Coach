import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { WritingReportJson } from "@/lib/ai/writing-report-schema";

function buildPreviewRows({
  reportId,
  reportJson,
  userId,
}: {
  reportId: string;
  reportJson: WritingReportJson;
  userId: string;
}) {
  return [
    ...reportJson.improvement_preview.red_sentences.map((item, index) => ({
      ai_response: item.ai_answer,
      category: item.category,
      explanation: item.explanation,
      is_demo: false,
      issue: item.issue_type,
      item_type: "red_sentence",
      original_text: item.original,
      report_id: reportId,
      sort_order: index,
      user_id: userId,
    })),
    ...reportJson.improvement_preview.yellow_sentences.map((item, index) => ({
      ai_response: item.ai_improvement,
      category: item.category,
      is_demo: false,
      issue: item.issue_type,
      item_type: "yellow_sentence",
      original_text: item.original,
      practice_tip: item.practice_tip,
      report_id: reportId,
      sort_order: index,
      user_id: userId,
      why_it_works: item.why_it_works,
    })),
    ...reportJson.improvement_preview.criteria_advice.map((item, index) => ({
      category: item.category,
      evaluation: item.evaluation,
      evidence: item.evidence,
      is_demo: false,
      item_type: "criteria_advice",
      next_step: item.next_step,
      report_id: reportId,
      sort_order: index,
      user_id: userId,
    })),
  ];
}

export async function deleteReportArtifacts({
  reportId,
  supabase,
}: {
  reportId: string;
  supabase: SupabaseClient;
}) {
  await Promise.all([
    supabase.from("weakness_tags").delete().eq("report_id", reportId),
    supabase.from("improvement_preview_items").delete().eq("report_id", reportId),
    supabase.from("reflection_notes").delete().eq("report_id", reportId),
    supabase.from("drill_tasks").delete().eq("report_id", reportId),
  ]);
}

export async function insertReportArtifacts({
  reportId,
  reportJson,
  supabase,
  userId,
}: {
  reportId: string;
  reportJson: WritingReportJson;
  supabase: SupabaseClient;
  userId: string;
}) {
  const writeOperations = await Promise.all([
    supabase.from("weakness_tags").insert(
      reportJson.weakness_tags.map((item) => ({
        category: item.category,
        evidence: item.evidence,
        explanation: item.explanation,
        is_demo: false,
        report_id: reportId,
        severity: item.severity,
        tag: item.tag,
        user_id: userId,
      })),
    ),
    supabase.from("improvement_preview_items").insert(
      buildPreviewRows({ reportId, reportJson, userId }),
    ),
    supabase.from("reflection_notes").insert({
      is_demo: false,
      questions: reportJson.reflection_questions,
      report_id: reportId,
      user_id: userId,
    }),
    supabase.from("drill_tasks").insert(
      reportJson.training_plan.map((item) => ({
        description: item.description,
        estimated_minutes: item.estimated_minutes,
        focus_area: item.focus_area,
        is_demo: false,
        report_id: reportId,
        status: "pending",
        title: item.title,
        user_id: userId,
      })),
    ),
  ]);

  return writeOperations.find((result) => result.error)?.error ?? null;
}

export function normalizeReportJson({
  essayText,
  reportJson,
  targetBand,
  wordCount,
}: {
  essayText: string;
  reportJson: WritingReportJson;
  targetBand: number;
  wordCount: number;
}) {
  return {
    ...reportJson,
    improvement_preview: {
      ...reportJson.improvement_preview,
      original_essay: essayText,
    },
    target_band: targetBand,
    word_count: wordCount,
  };
}
