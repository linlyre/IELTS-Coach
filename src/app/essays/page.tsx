import Link from "next/link";
import { FileText, Filter, Search } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { BandTrendChart } from "@/components/charts";
import { DeleteEssayButton } from "@/components/delete-essay-button";
import { PageHeading } from "@/components/page-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { requireOnboardedUser } from "@/lib/auth";
import { futureActionProps } from "@/lib/future-actions";
import { getEssayLibraryData } from "@/lib/learning-data";

type EssaysPageProps = {
  searchParams?: Promise<{
    q?: string;
    status?: string;
  }>;
};

const filterItems = [
  { label: "全部", value: "all" },
  { label: "待反思", value: "pending_reflection" },
  { label: "进行中", value: "in_progress" },
  { label: "已完成", value: "completed" },
];

export const dynamic = "force-dynamic";

export default async function EssaysPage({ searchParams }: EssaysPageProps) {
  const params = await searchParams;
  const { userId } = await requireOnboardedUser("/essays");
  const essayLibraryData = await getEssayLibraryData({
    search: params?.q,
    status: params?.status,
    userId,
  });
  const progressByStatus = {
    all: essayLibraryData.progress.total,
    completed: essayLibraryData.progress.completed,
    in_progress: essayLibraryData.progress.inProgress,
    pending_reflection: essayLibraryData.progress.pendingReflection,
  };
  const getFilterHref = (value: string) => {
    const nextParams = new URLSearchParams();

    if (value !== "all") {
      nextParams.set("status", value);
    }

    if (essayLibraryData.filters.search) {
      nextParams.set("q", essayLibraryData.filters.search);
    }

    const query = nextParams.toString();

    return query ? `/essays?${query}` : "/essays";
  };

  return (
    <AppShell>
      <PageHeading
        description="集中管理你的作文，追踪反馈、发现短板，稳步提升写作成绩。"
        title="作文档案"
      />

      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>当前专注</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-semibold">{essayLibraryData.focusTitle}</p>
              <p className="mt-2 text-sm leading-6 text-[#5F6B61]">
                {essayLibraryData.focusDescription}
              </p>
              <Button
                className="mt-5"
                type="button"
                variant="soft"
                {...futureActionProps("startTraining")}
              >
                查看专注计划
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>我的进度</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-5xl font-semibold text-[#123D24]">
                {essayLibraryData.progress.total}
              </p>
              <p className="mt-1 text-sm text-[#5F6B61]">总作文数</p>
              <div className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>已完成</span>
                  <span>{essayLibraryData.progress.completed}</span>
                </div>
                <div className="flex justify-between">
                  <span>进行中</span>
                  <span>{essayLibraryData.progress.inProgress}</span>
                </div>
                <div className="flex justify-between">
                  <span>待反思</span>
                  <span>{essayLibraryData.progress.pendingReflection}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>最近提升</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-semibold text-[#123D24]">
                {essayLibraryData.improvementDelta >= 0 ? "+" : ""}
                {essayLibraryData.improvementDelta.toFixed(1)}
              </p>
              <p className="text-sm text-[#5F6B61]">诊断分提升</p>
              <BandTrendChart data={essayLibraryData.bandTrend} />
            </CardContent>
          </Card>
        </aside>

        <Card>
          <CardContent className="p-5">
            <div className="mb-5 flex flex-col gap-4 xl:flex-row lg:items-center xl:justify-between">
              <div className="flex flex-wrap gap-2">
                {filterItems.map((item) => (
                  <Link
                    href={getFilterHref(item.value)}
                    key={item.value}
                  >
                    <Badge
                      variant={
                        essayLibraryData.filters.status === item.value
                          ? "default"
                          : "soft"
                      }
                    >
                      {item.label}{" "}
                      {progressByStatus[item.value as keyof typeof progressByStatus]}
                    </Badge>
                  </Link>
                ))}
              </div>
              <form action="/essays" className="grid gap-3 sm:grid-cols-[1fr_auto]">
                {essayLibraryData.filters.status !== "all" ? (
                  <input
                    name="status"
                    type="hidden"
                    value={essayLibraryData.filters.status}
                  />
                ) : null}
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A938B]"
                    size={18}
                  />
                  <Input
                    className="pl-10"
                    defaultValue={essayLibraryData.filters.search}
                    name="q"
                    placeholder="搜索作文或题目"
                  />
                </div>
                <Button
                  type="submit"
                  variant="outline"
                  {...futureActionProps("filterEssays")}
                >
                  <Filter size={16} />
                  筛选
                </Button>
              </form>
            </div>

            <div className="overflow-hidden rounded-2xl border border-[#E9EEE8]">
              <table className="w-full table-fixed border-collapse text-left text-sm">
                <thead className="bg-[#FAFBF7] text-xs font-medium text-[#5F6B61]">
                  <tr>
                    <th className="w-[22%] px-4 py-4 font-medium">作文</th>
                    <th className="w-[17%] px-3 py-4 font-medium">日期</th>
                    <th className="w-[8%] px-3 py-4 font-medium">诊断分</th>
                    <th className="w-[16%] px-3 py-4 font-medium">最大短板</th>
                    <th className="w-[13%] px-3 py-4 font-medium">训练进度</th>
                    <th className="w-[13%] px-3 py-4 font-medium">反思状态</th>
                    <th className="w-[11%] px-3 py-4 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {essayLibraryData.records.map((essay) => (
                    <tr className="border-t border-[#E9EEE8]" key={essay.id}>
                      <td className="min-w-0 px-4 py-4 align-middle">
                        <p className="truncate font-medium text-[#102014]">
                          {essay.title}
                        </p>
                        <p className="mt-1 truncate text-xs text-[#8A938B]">
                          {essay.taskType} · {essay.wordCount} words
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 align-middle text-xs leading-5 text-[#5F6B61]">
                        {essay.createdAt}
                      </td>
                      <td className="px-3 py-4 align-middle">
                        <Badge>{essay.diagnosticBand}</Badge>
                      </td>
                      <td className="truncate px-3 py-4 align-middle text-xs leading-5 text-[#102014]">
                        {essay.biggestGap}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 align-middle text-xs text-[#102014]">
                        {essay.drillCompleted}/{essay.drillTotal} 练习
                      </td>
                      <td className="px-3 py-4 align-middle">
                        <Badge
                          variant={
                            essay.reflectionStatus === "待反思"
                              ? "danger"
                              : essay.reflectionStatus === "进行中"
                                ? "warning"
                                : "soft"
                          }
                        >
                          {essay.reflectionStatus}
                        </Badge>
                      </td>
                      <td className="px-3 py-4 align-middle">
                        <div className="flex items-center gap-2 whitespace-nowrap">
                          {essay.reportId ? (
                            <Link href={`/report/${essay.reportId}`}>
                              <Button
                                aria-label="查看报告"
                                className="h-8 w-8 px-0"
                                size="sm"
                                variant="outline"
                                {...futureActionProps("viewReport")}
                              >
                                <FileText size={15} />
                              </Button>
                            </Link>
                          ) : (
                            <Button
                              aria-label="报告待生成"
                              className="h-8 w-8 px-0"
                              disabled
                              size="sm"
                              title="报告待生成"
                              variant="outline"
                            >
                              <FileText size={15} />
                            </Button>
                          )}
                          <DeleteEssayButton essayId={essay.id} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {essayLibraryData.records.length === 0 ? (
              <div className="rounded-b-2xl border-x border-b border-[#E9EEE8] px-5 py-10 text-center text-sm text-[#5F6B61]">
                暂无匹配作文。提交一篇 Task 2 后，这里会显示你的作文档案。
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
