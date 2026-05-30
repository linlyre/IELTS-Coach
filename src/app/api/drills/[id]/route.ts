import { NextResponse } from "next/server";

import { syncEssayStatusForReport } from "@/lib/essay-progress";
import { createClient } from "@/lib/supabase/server";

type DrillRouteProps = {
  params: Promise<{ id: string }>;
};

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function PATCH(request: Request, { params }: DrillRouteProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (claimsError || !userId) {
    return errorResponse("请先登录后再更新训练任务。", 401);
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return errorResponse("请求格式不正确。", 400);
  }

  const status = (body as { status?: unknown }).status;

  if (status !== "pending" && status !== "completed") {
    return errorResponse("训练任务状态不正确。", 400);
  }

  const { data: drill, error } = await supabase
    .from("drill_tasks")
    .update({ status })
    .eq("id", id)
    .eq("user_id", userId)
    .select("id,report_id,status")
    .maybeSingle();

  if (error || !drill) {
    return errorResponse("训练任务更新失败，请稍后重试。", 500);
  }

  await syncEssayStatusForReport({
    reportId: (drill as { report_id: string }).report_id,
    supabase,
    userId,
  });

  return NextResponse.json({
    drillId: (drill as { id: string }).id,
    status: (drill as { status: "pending" | "completed" }).status,
  });
}
