import type { SupabaseClient } from "@supabase/supabase-js";

type DrillStatusRow = {
  status: "pending" | "completed";
};

type ReflectionStatusRow = {
  completed: boolean;
};

export async function syncEssayStatusForReport({
  reportId,
  supabase,
  userId,
}: {
  reportId: string;
  supabase: SupabaseClient;
  userId: string;
}) {
  const [{ data: report }, { data: reflection }, { data: drills }] =
    await Promise.all([
      supabase
        .from("writing_reports")
        .select("essay_id")
        .eq("id", reportId)
        .eq("user_id", userId)
        .maybeSingle(),
      supabase
        .from("reflection_notes")
        .select("completed")
        .eq("report_id", reportId)
        .eq("user_id", userId)
        .maybeSingle(),
      supabase
        .from("drill_tasks")
        .select("status")
        .eq("report_id", reportId)
        .eq("user_id", userId),
    ]);

  const essayId = (report as { essay_id?: string } | null)?.essay_id;

  if (!essayId) {
    return;
  }

  const reflectionCompleted =
    Boolean((reflection as ReflectionStatusRow | null)?.completed);
  const drillRows = (drills ?? []) as DrillStatusRow[];
  const hasCompletedDrill = drillRows.some((drill) => drill.status === "completed");
  const allDrillsCompleted =
    drillRows.length > 0 &&
    drillRows.every((drill) => drill.status === "completed");
  const status =
    reflectionCompleted && allDrillsCompleted
      ? "completed"
      : reflectionCompleted || hasCompletedDrill
        ? "in_progress"
        : "pending_reflection";

  await supabase
    .from("essays")
    .update({ status })
    .eq("id", essayId)
    .eq("user_id", userId);
}
