import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type UserProfile = {
  id: string;
  user_id: string;
  target_band: number;
  current_level: string;
  exam_date: string | null;
  main_goal: string;
  onboarding_completed: boolean;
};

export async function getCurrentUserId() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims?.sub) {
    return null;
  }

  return data.claims.sub;
}

export async function requireUserId(next = "/write") {
  const userId = await getCurrentUserId();

  if (!userId) {
    redirect(`/auth/login?next=${encodeURIComponent(next)}`);
  }

  return userId;
}

export async function getUserProfile(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_profiles")
    .select(
      "id,user_id,target_band,current_level,exam_date,main_goal,onboarding_completed",
    )
    .eq("user_id", userId)
    .maybeSingle();

  return (data as UserProfile | null) ?? null;
}

export async function requireOnboardedUser(next = "/write") {
  const userId = await requireUserId(next);
  const profile = await getUserProfile(userId);

  if (!profile?.onboarding_completed) {
    redirect(`/onboarding?next=${encodeURIComponent(next)}`);
  }

  return { userId, profile };
}
