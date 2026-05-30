import Link from "next/link";
import { ArrowUpRight, CalendarDays, FileText, Lightbulb, PieChart } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { BandTrendChart, CriteriaRadarChart } from "@/components/charts";
import { IconPill } from "@/components/icon-pill";
import { PageHeading } from "@/components/page-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireOnboardedUser } from "@/lib/auth";
import { getDashboardData } from "@/lib/learning-data";

const metricIcons = {
  currentBand: ArrowUpRight,
  drillCompletion: PieChart,
  totalEssays: FileText,
  biggestGap: Lightbulb,
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { profile, userId } = await requireOnboardedUser("/dashboard");
  const dashboardData = await getDashboardData({ profile, userId });

  return (
    <AppShell>
      <PageHeading
        description="追踪你的进步，聚焦最重要的提升。"
        title="成长看板"
      />

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {dashboardData.metricCards.map((metric) => {
          const Icon = metricIcons[metric.key as keyof typeof metricIcons];

          return (
            <Card key={metric.title}>
              <CardContent className="p-6">
                <IconPill>
                  <Icon size={20} />
                </IconPill>
                <p className="mt-4 text-sm font-medium text-[#5F6B61]">
                  {metric.title}
                </p>
                <p className="mt-2 text-4xl font-semibold text-[#102014]">
                  {metric.value}
                </p>
                <p className="mt-2 text-sm leading-6 text-[#5F6B61]">
                  {metric.detail}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[1.2fr_0.8fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>分数趋势</CardTitle>
          </CardHeader>
          <CardContent>
            <BandTrendChart data={dashboardData.bandTrend} />
            <p className="rounded-2xl bg-[#E8F1E7] px-4 py-3 text-sm text-[#5F6B61]">
              {dashboardData.trendInsight}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>四维均值</CardTitle>
          </CardHeader>
          <CardContent>
            <CriteriaRadarChart data={dashboardData.criteriaAverage} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>短板聚焦</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {dashboardData.criteriaAverage.map((item) => (
              <div key={item.name}>
                <div className="flex justify-between text-sm">
                  <span>{item.name}</span>
                  <span>{item.score}/9</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-[#E9EEE8]">
                  <div
                    className="h-2 rounded-full bg-[#2F6B45]"
                    style={{ width: `${(item.score / 9) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            <div className="rounded-2xl bg-[#E8F1E7] p-4 text-sm leading-6 text-[#5F6B61]">
              {dashboardData.weaknessInsight}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>最近作文</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {dashboardData.recentEssays.slice(0, 5).map((essay) => (
              <div
                className="flex items-center justify-between gap-4"
                key={essay.id}
              >
                <div className="min-w-0">
                  <p className="font-medium">{essay.title}</p>
                  <p className="text-sm text-[#5F6B61]">
                    {essay.taskType} · {essay.createdAt}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge>{essay.diagnosticBand}</Badge>
                  {essay.reportId ? (
                    <Link href={`/report/${essay.reportId}`}>
                      <Button size="sm" variant="outline">
                        查看
                      </Button>
                    </Link>
                  ) : null}
                </div>
              </div>
            ))}
            {dashboardData.recentEssays.length === 0 ? (
              <p className="text-sm leading-6 text-[#5F6B61]">
                暂无作文记录。提交第一篇 Task 2 后，这里会显示最近练习。
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>考试倒计时</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-4">
              <IconPill>
                <CalendarDays size={20} />
              </IconPill>
              <div>
                <p className="text-sm text-[#5F6B61]">目标考试日期</p>
                <p className="mt-1 text-xl font-semibold">
                  {dashboardData.examCountdown.targetDate}
                </p>
              </div>
            </div>
            <div className="mt-6 rounded-2xl bg-[#FAFBF7] p-5 text-center">
              <p className="text-5xl font-semibold text-[#123D24]">
                {dashboardData.examCountdown.days ?? "-"}
              </p>
              <p className="mt-1 text-sm text-[#5F6B61]">天</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>本周建议</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboardData.weeklySuggestions.map((suggestion) => (
              <div
                className="rounded-2xl border border-[#E9EEE8] p-4"
                key={suggestion.title}
              >
                <p className="font-medium">{suggestion.title}</p>
                <p className="mt-1 text-sm text-[#5F6B61]">
                  {suggestion.description}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}
