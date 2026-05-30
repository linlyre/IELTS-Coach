import Link from "next/link";

import { login } from "@/app/auth/actions";
import { AppShell } from "@/components/app-shell";
import { PageHeading } from "@/components/page-heading";
import { StatusMessage } from "@/components/status-message";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getCurrentUserId, getUserProfile } from "@/lib/auth";
import { redirect } from "next/navigation";

type LoginPageProps = {
  searchParams?: Promise<{
    message?: string;
    next?: string;
    type?: string;
  }>;
};

export const dynamic = "force-dynamic";

function getStatusType(type?: string) {
  return type === "success" ? "success" : "error";
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const userId = await getCurrentUserId();
  const next =
    params?.next?.startsWith("/") && !params.next.startsWith("//")
      ? params.next
      : "/write";

  if (userId) {
    const profile = await getUserProfile(userId);
    redirect(profile?.onboarding_completed ? next : "/onboarding");
  }

  return (
    <AppShell>
      <PageHeading
        description="登录后可以保存作文档案、反思笔记和成长看板数据。"
        title="登录"
      />
      <Card className="mx-auto max-w-xl">
        <CardHeader>
          <CardTitle>邮箱密码登录</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={login} className="space-y-4">
            <StatusMessage
              message={params?.message}
              type={getStatusType(params?.type)}
            />
            <input name="next" type="hidden" value={next} />
            <Input name="email" placeholder="邮箱" required type="email" />
            <Input name="password" placeholder="密码" required type="password" />
            <Button className="w-full" type="submit">
              登录并继续训练
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-[#5F6B61]">
            还没有账号？{" "}
            <Link className="font-medium text-[#123D24]" href="/auth/signup">
              创建账号
            </Link>
          </p>
          <p className="mt-3 text-center text-sm text-[#5F6B61]">
            只想看样例？{" "}
            <Link className="font-medium text-[#123D24]" href="/report/demo">
              查看示例教练报告
            </Link>
          </p>
        </CardContent>
      </Card>
    </AppShell>
  );
}
