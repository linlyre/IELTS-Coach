import type { EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";

import { ensureUserProfile } from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const code = searchParams.get("code");
  const type = searchParams.get("type") as EmailOtpType | null;
  const redirectTo = request.nextUrl.clone();
  redirectTo.pathname = "/onboarding";
  redirectTo.search = "";

  if (tokenHash && type) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });

    if (!error && data.user) {
      await ensureUserProfile(data.user.id);
      return NextResponse.redirect(redirectTo);
    }
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const { data } = await supabase.auth.getClaims();
      if (data?.claims?.sub) {
        await ensureUserProfile(data.claims.sub);
        return NextResponse.redirect(redirectTo);
      }
    }
  }

  redirectTo.pathname = "/auth/login";
  redirectTo.searchParams.set("message", "邮箱确认失败，请重新登录或再次注册。");
  return NextResponse.redirect(redirectTo);
}
