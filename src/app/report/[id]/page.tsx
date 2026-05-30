import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, CheckCircle2, Highlighter, Lightbulb } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { PageHeading } from "@/components/page-heading";
import { ReflectionNoteCard } from "@/components/reflection-note-card";
import { ReportRegenerateButton } from "@/components/report-regenerate-button";
import { TrainingPlanCard } from "@/components/training-plan-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireOnboardedUser } from "@/lib/auth";
import { futureActionProps } from "@/lib/future-actions";
import { getWritingReportView } from "@/lib/report-data";

type ReportPageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export default async function ReportPage({ params }: ReportPageProps) {
  const { id } = await params;
  if (id !== "demo") {
    await requireOnboardedUser(`/report/${id}`);
  }

  const writingReport = await getWritingReportView(id);

  if (!writingReport) {
    notFound();
  }

  if (writingReport.status !== "completed") {
    return (
      <AppShell>
        <PageHeading
          description="本次报告尚未生成完整内容。"
          title="报告生成失败"
        />
        <Card>
          <CardHeader>
            <CardTitle>教练暂时不可用</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-6 text-[#5F6B61]">
              报告生成或保存时出现问题。你可以重新生成报告，或回到写作页重新提交。
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
              <ReportRegenerateButton reportId={writingReport.reportId} />
              <Link href="/write">
                <Button variant="outline">重新提交作文</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  const redCount = writingReport.improvementPreview.redSentences.length;
  const yellowCount = writingReport.improvementPreview.yellowSentences.length;
  const criteriaCount = writingReport.improvementPreview.criteriaAdvice.length;

  return (
    <AppShell>
      <PageHeading
        description={`${writingReport.taskType} · 提交时间：${writingReport.createdAt} · 字数：${writingReport.wordCount} 词`}
        title="你的写作教练报告"
      />

      <section className="grid gap-5 lg:grid-cols-4">
        <Card className="bg-[#2F6B45] text-white lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-white">教练总结</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-7 text-white/90">
              {writingReport.coachSummary}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>诊断分数（非官方）</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-semibold text-[#123D24]">
              {writingReport.diagnosticBand}
            </p>
            <p className="mt-2 text-sm text-[#5F6B61]">
              目标分 {writingReport.targetBand}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>最大短板</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-[#102014]">
              {writingReport.biggestGap}
            </p>
            <Link href={`/report/${writingReport.reportId}/preview`}>
              <Button
                className="mt-4"
                size="sm"
                variant="outline"
                {...futureActionProps("viewPreview")}
              >
                查看详情
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>优先改进项</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-6 text-[#5F6B61]">
              {writingReport.priorityFix}
            </p>
            <Button
              className="mt-4"
              size="sm"
              type="button"
              variant="soft"
              {...futureActionProps("startTraining")}
            >
              开始专项训练
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-4">
        {writingReport.criteria.map((item) => (
          <Card key={item.key}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-xs text-[#8A938B]">{item.english}</p>
                </div>
                <p className="text-2xl font-semibold text-[#123D24]">{item.score}</p>
              </div>
              <div className="mt-4 h-2 rounded-full bg-[#E9EEE8]">
                <div
                  className="h-2 rounded-full bg-[#2F6B45]"
                  style={{ width: `${(item.score / 9) * 100}%` }}
                />
              </div>
              <p className="mt-4 text-sm leading-6 text-[#5F6B61]">{item.comment}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <div className="mt-5 flex flex-wrap gap-2">
        <Badge variant="outline">薄弱点标签</Badge>
        {writingReport.weaknessTags.map((tag) => (
          <Badge key={tag}>{tag}</Badge>
        ))}
      </div>

      <section className="mt-5 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>提升预览</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="max-w-2xl text-sm leading-6 text-[#5F6B61]">
              AI 已经根据原始作文完成逐句标注，并把问题分成错误修正、表达改进和四维具体建议。进入后可查看标红句、标黄句以及本次句子实验室。
            </p>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-[#F1C8C1] bg-[#FFF4F2] p-4">
                <div className="flex items-center gap-2 text-[#A33F31]">
                  <AlertTriangle size={18} />
                  <p className="font-semibold">标红句</p>
                </div>
                <p className="mt-3 text-3xl font-semibold text-[#102014]">
                  {redCount}
                </p>
                <p className="mt-1 text-sm leading-6 text-[#5F6B61]">
                  包含 AI 解答，解释错误类型和修正原因。
                </p>
              </div>
              <div className="rounded-2xl border border-[#E8D69A] bg-[#FFF9E8] p-4">
                <div className="flex items-center gap-2 text-[#8A5A00]">
                  <Highlighter size={18} />
                  <p className="font-semibold">标黄句</p>
                </div>
                <p className="mt-3 text-3xl font-semibold text-[#102014]">
                  {yellowCount}
                </p>
                <p className="mt-1 text-sm leading-6 text-[#5F6B61]">
                  包含 AI 改进，并沉淀为本次句子实验室。
                </p>
              </div>
              <div className="rounded-2xl border border-[#DDE5DC] bg-[#FAFBF7] p-4">
                <div className="flex items-center gap-2 text-[#123D24]">
                  <Lightbulb size={18} />
                  <p className="font-semibold">四维具体建议</p>
                </div>
                <p className="mt-3 text-3xl font-semibold text-[#102014]">
                  {criteriaCount}
                </p>
                <p className="mt-1 text-sm leading-6 text-[#5F6B61]">
                  是上方评分卡的具体版本，给出证据和下一步。
                </p>
              </div>
            </div>
            <div className="mt-5 flex flex-col gap-3 rounded-2xl bg-[#E8F1E7] p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-[#123D24]">
                  先看标注，再进入句子实验室
                </p>
                <p className="mt-1 text-sm text-[#5F6B61]">
                  查看原始作文中的红黄标注，并理解每一处修改背后的评分逻辑。
                </p>
              </div>
              <Link href={`/report/${writingReport.reportId}/preview`}>
                <Button {...futureActionProps("viewPreview")}>查看提升预览</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-5">
          <ReflectionNoteCard
            disabled={writingReport.isDemo}
            initialNote={writingReport.reflectionNote}
            questions={writingReport.reflectionQuestions}
            reflectionId={writingReport.reflectionNoteId}
          />
          <TrainingPlanCard
            disabled={writingReport.isDemo}
            tasks={writingReport.trainingPlan}
          />
        </div>
      </section>

      <p className="mt-6 flex items-start gap-2 rounded-2xl bg-[#E8F1E7] px-5 py-4 text-sm leading-6 text-[#5F6B61]">
        <CheckCircle2 className="mt-0.5 shrink-0 text-[#2F6B45]" size={18} />
        This is AI-generated training feedback, not an official IELTS score.
      </p>
    </AppShell>
  );
}
