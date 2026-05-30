import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

type EssayRouteProps = {
  params: Promise<{ id: string }>;
};

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function DELETE(_request: Request, { params }: EssayRouteProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (claimsError || !userId) {
    return errorResponse("请先登录后再删除作文。", 401);
  }

  const { error } = await supabase
    .from("essays")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    return errorResponse("作文删除失败，请稍后重试。", 500);
  }

  return NextResponse.json({ essayId: id });
}
