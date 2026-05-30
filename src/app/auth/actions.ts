"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getUserProfile } from "@/lib/auth";
import { ensureUserProfile } from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function redirectWithMessage(path: string, message: string, type = "error"): never {
  const params = new URLSearchParams({ message, type });
  redirect(`${path}?${params.toString()}`);
}

function normalizeNext(next: string | null) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/write";
  }

  return next;
}

function isLocalhost(origin: string) {
  try {
    const { hostname } = new URL(origin);
    return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
  } catch {
    return false;
  }
}

async function getEmailRedirectTo() {
  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "");
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const proto = requestHeaders.get("x-forwarded-proto") ?? "http";
  const requestOrigin = host ? `${proto}://${host}` : null;

  const siteOrigin =
    configuredSiteUrl && !isLocalhost(configuredSiteUrl)
      ? configuredSiteUrl
      : requestOrigin && !isLocalhost(requestOrigin)
        ? requestOrigin
        : (configuredSiteUrl ?? requestOrigin ?? "http://localhost:3000");

  return `${siteOrigin}/auth/confirm`;
}

export async function login(formData: FormData) {
  const email = getString(formData, "email");
  const password = getString(formData, "password");
  const next = normalizeNext(getString(formData, "next"));

  if (!email || !password) {
    redirectWithMessage("/auth/login", "请输入邮箱和密码。");
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    redirectWithMessage("/auth/login", "登录失败，请检查邮箱和密码。");
  }

  const profile = await getUserProfile(data.user.id);
  if (!profile) {
    await ensureUserProfile(data.user.id);
  }

  revalidatePath("/", "layout");

  if (!profile?.onboarding_completed) {
    redirect(`/onboarding?next=${encodeURIComponent(next)}`);
  }

  redirect(next);
}

export async function signup(formData: FormData) {
  const email = getString(formData, "email");
  const password = getString(formData, "password");
  const confirmPassword = getString(formData, "confirmPassword");

  if (!email || !password || !confirmPassword) {
    redirectWithMessage("/auth/signup", "请完整填写邮箱、密码和确认密码。");
  }

  if (password.length < 8) {
    redirectWithMessage("/auth/signup", "密码至少需要 8 位。");
  }

  if (password !== confirmPassword) {
    redirectWithMessage("/auth/signup", "两次输入的密码不一致。");
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: await getEmailRedirectTo(),
    },
  });

  if (error) {
    redirectWithMessage("/auth/signup", "注册失败，请稍后重试或更换邮箱。");
  }

  if (data.session && data.user) {
    await ensureUserProfile(data.user.id);
    revalidatePath("/", "layout");
    redirect("/onboarding");
  }

  redirectWithMessage(
    "/auth/login",
    "注册已提交。请先查收确认邮件，再返回登录。",
    "success",
  );
}
