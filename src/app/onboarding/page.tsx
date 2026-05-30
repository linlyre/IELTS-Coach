import { saveOnboarding } from "@/app/onboarding/actions";
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

type OnboardingPageProps = {
  searchParams?: Promise<{
    message?: string;
    next?: string;
    type?: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function OnboardingPage({
  searchParams,
}: OnboardingPageProps) {
  const params = await searchParams;
  const userId = await requireUserId("/onboarding");
  const profile = await getUserProfile(userId);

  return (
    <AppShell>
      <PageHeading
        description="告诉教练你的目标分、当前水平和考试日期，后续报告会围绕这些信息给出训练建议。"
        title="学习目标设置"
      />
      <Card>
        <CardHeader>
          <CardTitle>你的训练画像</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={saveOnboarding} className="grid gap-5 md:grid-cols-2">
            <input name="next" type="hidden" value={params?.next ?? "/write"} />
            <div className="md:col-span-2">
              <StatusMessage message={params?.message} type={params?.type} />
            </div>
            <label className="space-y-2 text-sm font-medium text-[#102014]">
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
            <label className="space-y-2 text-sm font-medium text-[#102014]">
              当前写作水平
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
            <label className="space-y-2 text-sm font-medium text-[#102014]">
              目标考试日期
              <Input
                defaultValue={profile?.exam_date ?? userProfile.examDate}
                name="examDate"
                type="date"
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-[#102014]">
              主要学习目标
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
              <Button type="submit">保存并开始训练</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </AppShell>
  );
}
