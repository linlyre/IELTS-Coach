import Link from "next/link";

import { signup } from "@/app/auth/actions";
import { AppShell } from "@/components/app-shell";
import { PageHeading } from "@/components/page-heading";
import { StatusMessage } from "@/components/status-message";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getCurrentUserId, getUserProfile } from "@/lib/auth";
import { redirect } from "next/navigation";

type SignupPageProps = {
  searchParams?: Promise<{
    message?: string;
    type?: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = await searchParams;
  const userId = await getCurrentUserId();

  if (userId) {
    const profile = await getUserProfile(userId);
    redirect(profile?.onboarding_completed ? "/write" : "/onboarding");
  }

  return (
    <AppShell>
      <PageHeading
        description="创建账号后进入学习目标设置，后续可保存作文、反思和训练状态。"
        title="注册"
      />
      <Card className="mx-auto max-w-xl">
        <CardHeader>
          <CardTitle>创建你的写作训练档案</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={signup} className="space-y-4">
            <StatusMessage message={params?.message} type={params?.type} />
            <Input name="email" placeholder="邮箱" required type="email" />
            <Input
              minLength={8}
              name="password"
              placeholder="密码，至少 8 位"
              required
              type="password"
            />
            <Input
              minLength={8}
              name="confirmPassword"
              placeholder="确认密码"
              required
              type="password"
            />
            <Button className="w-full" type="submit">
              注册并设置目标
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-[#5F6B61]">
            已有账号？{" "}
            <Link className="font-medium text-[#123D24]" href="/auth/login">
              返回登录
            </Link>
          </p>
        </CardContent>
      </Card>
    </AppShell>
  );
}
