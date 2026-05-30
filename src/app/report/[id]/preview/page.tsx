import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Highlighter,
  Lightbulb,
} from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { PageHeading } from "@/components/page-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireOnboardedUser } from "@/lib/auth";
import { futureActionProps } from "@/lib/future-actions";
import { getWritingReportView } from "@/lib/report-data";

type Annotation = {
  text: string;
  type: "red" | "yellow";
};

function renderHighlightedParagraph(paragraph: string, annotations: Annotation[]) {
  const matches = annotations
    .map((annotation) => ({
      ...annotation,
      start: paragraph.indexOf(annotation.text),
      end: paragraph.indexOf(annotation.text) + annotation.text.length,
    }))
    .filter((annotation) => annotation.start >= 0)
    .sort((a, b) => a.start - b.start);

  if (matches.length === 0) {
    return paragraph;
  }

  const parts = [];
  let cursor = 0;

  for (const match of matches) {
    if (match.start > cursor) {
      parts.push(paragraph.slice(cursor, match.start));
    }

    parts.push(
      <mark
        className={
          match.type === "red"
            ? "rounded-md bg-[#FCE7E2] px-1 py-0.5 text-[#8F3125]"
            : "rounded-md bg-[#FFF3BF] px-1 py-0.5 text-[#6F4A00]"
        }
        key={`${match.type}-${match.start}`}
      >
        {paragraph.slice(match.start, match.end)}
      </mark>,
    );
    cursor = match.end;
  }

  if (cursor < paragraph.length) {
    parts.push(paragraph.slice(cursor));
  }

  return parts;
}

type ImprovementPreviewPageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export default async function ImprovementPreviewPage({
  params,
}: ImprovementPreviewPageProps) {
  const { id } = await params;
  if (id !== "demo") {
    await requireOnboardedUser(`/report/${id}/preview`);
  }

  const writingReport = await getWritingReportView(id);

  if (!writingReport) {
    notFound();
  }

  if (writingReport.status !== "completed") {
    return (
      <AppShell>
        <PageHeading
          action={
            <Link href={`/report/${writingReport.reportId}`}>
              <Button variant="outline">
                <ArrowLeft size={16} />
                返回报告
              </Button>
            </Link>
          }
          description="本次报告没有可展示的提升预览。"
          title="提升预览不可用"
        />
        <Card>
          <CardContent className="p-6 text-sm leading-6 text-[#5F6B61]">
            报告生成失败或尚未完成，请重新提交作文后再查看提升预览。
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  const annotations = [
    ...writingReport.improvementPreview.redSentences.map((item) => ({
      text: item.original,
      type: "red" as const,
    })),
    ...writingReport.improvementPreview.yellowSentences.map((item) => ({
      text: item.original,
      type: "yellow" as const,
    })),
  ];

  return (
    <AppShell>
      <PageHeading
        action={
          <Link href={`/report/${writingReport.reportId}`}>
            <Button variant="outline" {...futureActionProps("viewReport")}>
              <ArrowLeft size={16} />
              返回报告
            </Button>
          </Link>
        }
        description={`${writingReport.taskType} · 诊断分 ${writingReport.diagnosticBand} · 目标分 ${writingReport.targetBand}`}
        title="提升预览"
      />

      <section className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>原始作文提升预览</CardTitle>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-[#FCE7E2] text-[#8F3125]">
                  标红：错误句 / 错误词
                </Badge>
                <Badge className="bg-[#FFF3BF] text-[#6F4A00]">
                  标黄：可改进句
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-[20px] border border-[#E9EEE8] bg-[#FAFBF7] p-5">
              {writingReport.originalEssay.map((paragraph) => (
                <p
                  className="mb-5 text-sm leading-8 text-[#102014] last:mb-0"
                  key={paragraph}
                >
                  {renderHighlightedParagraph(paragraph, annotations)}
                </p>
              ))}
            </div>
            <p className="flex items-start gap-2 rounded-2xl bg-[#E8F1E7] px-4 py-3 text-sm leading-6 text-[#5F6B61]">
              <CheckCircle2 className="mt-0.5 shrink-0 text-[#2F6B45]" size={18} />
              红色关注准确性，黄色关注提分空间。先理解标注，再看右侧 AI 解答与 AI 改进。
            </p>
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="text-[#A33F31]" size={20} />
                标红句：AI 解答
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {writingReport.improvementPreview.redSentences.map((item, index) => (
                <div
                  className="rounded-2xl border border-[#F1C8C1] bg-[#FFF8F6] p-4"
                  key={item.original}
                >
                  <div className="flex items-center justify-between gap-3">
                    <Badge className="bg-[#FCE7E2] text-[#8F3125]">
                      红 {index + 1}
                    </Badge>
                    <Badge variant="outline">{item.category}</Badge>
                  </div>
                  <p className="mt-4 text-xs text-[#8A938B]">原句</p>
                  <p className="mt-2 text-sm leading-6 text-[#102014]">
                    {item.original}
                  </p>
                  <p className="mt-4 text-xs text-[#8A938B]">AI 解答</p>
                  <p className="mt-2 text-sm leading-6 font-medium text-[#102014]">
                    {item.aiAnswer}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-[#5F6B61]">
                    <span className="font-medium text-[#A33F31]">
                      {item.issue}：
                    </span>
                    {item.explanation}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Highlighter className="text-[#8A5A00]" size={20} />
                标黄句：AI 改进
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {writingReport.improvementPreview.yellowSentences.map(
                (item, index) => (
                  <div
                    className="rounded-2xl border border-[#E8D69A] bg-[#FFFDF4] p-4"
                    key={item.original}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <Badge className="bg-[#FFF3BF] text-[#6F4A00]">
                        黄 {index + 1}
                      </Badge>
                      <Badge variant="outline">{item.category}</Badge>
                    </div>
                    <div className="mt-4 grid gap-4 md:grid-cols-[1fr_28px_1fr]">
                      <div>
                        <p className="text-xs text-[#8A938B]">修改前</p>
                        <p className="mt-2 text-sm leading-6">{item.original}</p>
                      </div>
                      <ArrowRight className="hidden self-center text-[#2F6B45] md:block" />
                      <div>
                        <p className="text-xs text-[#8A938B]">AI 改进</p>
                        <p className="mt-2 text-sm leading-6 font-medium">
                          {item.aiImprovement}
                        </p>
                      </div>
                    </div>
                    <p className="mt-4 text-sm leading-6 text-[#5F6B61]">
                      <span className="font-medium text-[#6F4A00]">
                        {item.issue}：
                      </span>
                      {item.whyItWorks}
                    </p>
                    <p className="mt-3 rounded-xl bg-[#FAFBF7] p-3 text-sm leading-6 text-[#5F6B61]">
                      <span className="font-medium text-[#123D24]">
                        练习提示：
                      </span>
                      {item.practiceTip}
                    </p>
                  </div>
                ),
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardHeader>
            <CardTitle>本次句子实验室</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {writingReport.sentenceCoachingLab.map((item, index) => (
              <div
                className="grid gap-4 rounded-2xl border border-[#E9EEE8] bg-[#FAFBF7] p-4 md:grid-cols-[40px_1fr_28px_1fr]"
                key={item.original}
              >
                <Badge>{index + 1}</Badge>
                <div>
                  <p className="text-xs text-[#8A938B]">修改前</p>
                  <p className="mt-2 text-sm leading-6">{item.original}</p>
                </div>
                <ArrowRight className="hidden self-center text-[#2F6B45] md:block" />
                <div>
                  <p className="text-xs text-[#8A938B]">修改后</p>
                  <p className="mt-2 text-sm leading-6 font-medium">
                    {item.improved}
                  </p>
                  <Badge className="mt-2" variant="outline">
                    {item.issue}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="text-[#123D24]" size={20} />
              四维分析后的具体评价和建议
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {writingReport.improvementPreview.criteriaAdvice.map((item) => (
              <div
                className="rounded-2xl border border-[#E9EEE8] bg-white p-4"
                key={item.english}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold">{item.category}</p>
                  <Badge variant="outline">{item.english}</Badge>
                </div>
                <p className="mt-3 text-sm leading-6 text-[#5F6B61]">
                  {item.evaluation}
                </p>
                <p className="mt-3 rounded-xl bg-[#FAFBF7] p-3 text-sm leading-6 text-[#102014]">
                  Evidence: {item.evidence}
                </p>
                <p className="mt-3 text-sm leading-6 text-[#5F6B61]">
                  <span className="font-medium text-[#123D24]">下一步：</span>
                  {item.nextStep}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}
