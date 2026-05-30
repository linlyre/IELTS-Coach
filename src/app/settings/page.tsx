import { saveSettings } from "@/app/settings/actions";
import { AppShell } from "@/components/app-shell";
import { PageHeading } from "@/components/page-heading";
import { StatusMessage } from "@/components/status-message";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { getUserProfile, requireUserId } from "@/lib/auth";
import { userProfile } from "@/lib/mock-data";
import { formatBandValue } from "@/lib/profile";

type SettingsPageProps = {
  searchParams?: Promise<{
    message?: string;
    type?: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const params = await searchParams;
  const userId = await requireUserId("/settings");
  const profile = await getUserProfile(userId);

  return (
    <AppShell>
      <PageHeading
        description="管理目标分、考试日期和隐私说明。"
        title="设置"
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle>训练档案与隐私</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={saveSettings} className="grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <StatusMessage message={params?.message} type={params?.type} />
              </div>
              <label className="space-y-2 text-sm font-medium">
                目标写作分数
                <Select
                  defaultValue={formatBandValue(
                    profile?.target_band ?? userProfile.targetBandLabel,
                  )}
                  name="targetBand"
                  required
                >
                  <option>6.0</option>
                  <option>6.5</option>
                  <option>7.0</option>
                  <option>7.5</option>
                </Select>
              </label>
              <label className="space-y-2 text-sm font-medium">
                当前水平
                <Select
                  defaultValue={profile?.current_level ?? userProfile.currentLevel}
                  name="currentLevel"
                >
                  <option>5.0</option>
                  <option>5.5</option>
                  <option>6.0</option>
                  <option>不确定</option>
                </Select>
              </label>
              <label className="space-y-2 text-sm font-medium">
                考试日期
                <Input
                  defaultValue={profile?.exam_date ?? userProfile.examDate}
                  name="examDate"
                  type="date"
                />
              </label>
              <label className="space-y-2 text-sm font-medium">
                学习目标
                <Select
                  defaultValue={profile?.main_goal ?? userProfile.mainGoal}
                  name="mainGoal"
                >
                  <option>提分</option>
                  <option>纠错</option>
                  <option>积累表达</option>
                  <option>稳定发挥</option>
                  <option>稳定冲击 7.0</option>
                </Select>
              </label>
              <div className="md:col-span-2">
                <Button type="submit">保存设置</Button>
              </div>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>隐私说明</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-6 text-[#5F6B61]">
            <p>
              你的作文内容仅用于生成个人训练反馈、保存作文档案和展示成长追踪。
            </p>
            <p>
              当前阶段已接入账号系统。个人作文和训练记录会受 Supabase RLS 保护。
            </p>
            <form action="/auth/logout" method="post">
              <Button type="submit" variant="outline">
                退出登录
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
