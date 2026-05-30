"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUserId } from "@/lib/auth";
import { ensureUserProfile } from "@/lib/profile";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function normalizeNext(next: string | null) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/write";
  }

  return next;
}

export async function saveOnboarding(formData: FormData) {
  const userId = await requireUserId("/onboarding");
  const targetBand = Number(getString(formData, "targetBand"));
  const currentLevel = getString(formData, "currentLevel") || "不确定";
  const examDate = getString(formData, "examDate") || null;
  const mainGoal = getString(formData, "mainGoal") || "提分";
  const next = normalizeNext(getString(formData, "next"));

  if (![6.0, 6.5, 7.0, 7.5].includes(targetBand)) {
    redirect("/onboarding?message=请选择有效的目标分数。");
  }

  const error = await ensureUserProfile(userId, {
    targetBand,
    currentLevel,
    examDate,
    mainGoal,
    onboardingCompleted: true,
  });

  if (error) {
    redirect("/onboarding?message=保存失败，请稍后重试。");
  }

  revalidatePath("/", "layout");
  redirect(next);
}
