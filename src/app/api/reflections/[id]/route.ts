import { NextResponse } from "next/server";

import { syncEssayStatusForReport } from "@/lib/essay-progress";
import { createClient } from "@/lib/supabase/server";

type ReflectionRouteProps = {
  params: Promise<{ id: string }>;
};

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function PATCH(request: Request, { params }: ReflectionRouteProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (claimsError || !userId) {
    return errorResponse("请先登录后再保存反思。", 401);
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return errorResponse("请求格式不正确。", 400);
  }

  const note =
    typeof (body as { note?: unknown }).note === "string"
      ? (body as { note: string }).note.trim()
      : "";

  const { data: reflection, error } = await supabase
    .from("reflection_notes")
    .update({
      completed: note.length > 0,
      note: note || null,
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select("id,report_id,note,completed")
    .maybeSingle();

  if (error || !reflection) {
    return errorResponse("反思保存失败，请稍后重试。", 500);
  }

  await syncEssayStatusForReport({
    reportId: (reflection as { report_id: string }).report_id,
    supabase,
    userId,
  });

  return NextResponse.json({
    completed: (reflection as { completed: boolean }).completed,
    note: (reflection as { note: string | null }).note,
    reflectionId: (reflection as { id: string }).id,
  });
}
