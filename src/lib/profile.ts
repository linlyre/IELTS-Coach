import { createClient } from "@/lib/supabase/server";

export type ProfileInput = {
  targetBand: number;
  currentLevel: string;
  examDate: string | null;
  mainGoal: string;
  onboardingCompleted: boolean;
};

export const defaultProfileInput: ProfileInput = {
  targetBand: 7.0,
  currentLevel: "不确定",
  examDate: null,
  mainGoal: "提分",
  onboardingCompleted: false,
};

export function formatBandValue(value: number | string | null | undefined) {
  if (typeof value === "number") {
    return value.toFixed(1);
  }

  return value ?? "7.0";
}

export async function ensureUserProfile(
  userId: string,
  input: Partial<ProfileInput> = {},
) {
  const supabase = await createClient();
  const profile = { ...defaultProfileInput, ...input };
  const profileData = {
    current_level: profile.currentLevel,
    exam_date: profile.examDate,
    main_goal: profile.mainGoal,
    onboarding_completed: profile.onboardingCompleted,
    target_band: profile.targetBand,
    user_id: userId,
  };

  const { data: existingProfile, error: readError } = await supabase
    .from("user_profiles")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (readError) {
    return readError;
  }

  if (existingProfile?.id) {
    const { error } = await supabase
      .from("user_profiles")
      .update(profileData)
      .eq("id", existingProfile.id)
      .eq("user_id", userId);

    return error;
  }

  const { error } = await supabase.from("user_profiles").insert(profileData);

  return error;
}
