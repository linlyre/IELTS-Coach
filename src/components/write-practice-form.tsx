"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { ArrowRight, CalendarDays, CheckCircle2, ShieldCheck } from "lucide-react";

import { IconPill } from "@/components/icon-pill";
import { PageHeading } from "@/components/page-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { StatusMessage } from "@/components/status-message";
import { Textarea } from "@/components/ui/textarea";
import { futureActionProps } from "@/lib/future-actions";
import { sampleEssay, samplePrompts, writingTips } from "@/lib/mock-data";
import { validateWritingSubmission } from "@/lib/writing-validation";

const draftStorageKey = "ielts-coach.write-draft.v1";

type WriteDraft = {
  essayText: string;
  promptText: string;
  topicType: string;
  selectedTargetBand: string;
  updatedAt: string;
};

export function WritePracticeForm({
  examDate,
  initialStatusMessage,
  initialStatusType,
  submitAction,
  targetBand,
}: {
  examDate: string;
  initialStatusMessage?: string;
  initialStatusType?: "error" | "success";
  submitAction: (formData: FormData) => void | Promise<void>;
  targetBand: string;
}) {
  const [topicType, setTopicType] = useState("");
  const [promptText, setPromptText] = useState("");
  const [essayText, setEssayText] = useState("");
  const [selectedTargetBand, setSelectedTargetBand] = useState(targetBand);
  const [statusMessage, setStatusMessage] = useState(initialStatusMessage ?? "");
  const [statusType, setStatusType] = useState<"error" | "success">(
    initialStatusType ?? "error",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false);
  const isSubmittingRef = useRef(false);

  const topicTypeOptions = useMemo(
    () => [...new Set(samplePrompts.map((prompt) => prompt.category))],
    [],
  );

  useEffect(() => {
    const restoreDraft = window.setTimeout(() => {
      const savedDraft = window.localStorage.getItem(draftStorageKey);

      if (savedDraft) {
        try {
          const draft = JSON.parse(savedDraft) as Partial<WriteDraft>;
          setPromptText(typeof draft.promptText === "string" ? draft.promptText : "");
          setEssayText(typeof draft.essayText === "string" ? draft.essayText : "");
          setTopicType(typeof draft.topicType === "string" ? draft.topicType : "");
          setSelectedTargetBand(
            typeof draft.selectedTargetBand === "string"
              ? draft.selectedTargetBand
              : targetBand,
          );
        } catch {
          window.localStorage.removeItem(draftStorageKey);
        }
      }

      setHasRestoredDraft(true);
    }, 0);

    return () => window.clearTimeout(restoreDraft);
  }, [targetBand]);

  useEffect(() => {
    if (!hasRestoredDraft || isSubmitting) {
      return;
    }

    const hasDraft =
      promptText.trim() || essayText.trim() || topicType.trim() || selectedTargetBand !== targetBand;

    if (!hasDraft) {
      window.localStorage.removeItem(draftStorageKey);
      return;
    }

    const draft: WriteDraft = {
      essayText,
      promptText,
      topicType,
      selectedTargetBand,
      updatedAt: new Date().toISOString(),
    };

    window.localStorage.setItem(draftStorageKey, JSON.stringify(draft));
  }, [
    essayText,
    hasRestoredDraft,
    isSubmitting,
    promptText,
    selectedTargetBand,
    targetBand,
    topicType,
  ]);

  useEffect(() => {
    if (!essayText.trim() && !promptText.trim()) {
      return;
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isSubmittingRef.current) {
        return;
      }

      event.preventDefault();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [essayText, promptText]);

  function loadSampleEssay() {
    setTopicType((currentTopicType) => currentTopicType || sampleEssay.category);
    setPromptText((currentPrompt) => currentPrompt || sampleEssay.prompt);
    setEssayText(sampleEssay.text);
    setStatusType("success");
    setStatusMessage("已填入示例题目和作文，可直接提交分析。");
  }

  function submitEssay(event: FormEvent<HTMLFormElement>) {
    if (isSubmitting) {
      event.preventDefault();
      return;
    }

    const validation = validateWritingSubmission({
      essayText,
      questionPrompt: promptText,
      targetBand: Number(selectedTargetBand),
    });

    if (!validation.ok) {
      event.preventDefault();
      setStatusType("error");
      setStatusMessage(validation.error);
      return;
    }

    setStatusType("success");
    setStatusMessage("已收到作文，教练正在生成报告，通常需要 20-40 秒，请勿关闭页面。");
    isSubmittingRef.current = true;
    setIsSubmitting(true);
  }

  return (
    <>
      <PageHeading
        description="提交一篇 IELTS Writing Task 2，获得教练式反馈与个性化复训建议。"
        title="开始一次写作训练"
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle>Task 2 作文提交</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              action={submitAction}
              className="space-y-5"
              onSubmit={submitEssay}
            >
              <label className="space-y-2 text-sm font-medium text-[#102014]">
                题目类型
                <Input
                  list="topic-type-options"
                  name="topicType"
                  onChange={(event) => setTopicType(event.target.value)}
                  placeholder="例如：教育 / 科技"
                  value={topicType}
                />
                <datalist id="topic-type-options">
                  {topicTypeOptions.map((option) => (
                    <option key={option} value={option} />
                  ))}
                </datalist>
              </label>
              <label className="space-y-2 text-sm font-medium text-[#102014]">
                题目内容
                <Textarea
                  name="questionPrompt"
                  onChange={(event) => setPromptText(event.target.value)}
                  placeholder="The question prompt will appear here..."
                  rows={4}
                  value={promptText}
                />
              </label>
              <label className="space-y-2 text-sm font-medium text-[#102014]">
                你的作文
                <Textarea
                  className="min-h-48"
                  name="essayText"
                  onChange={(event) => setEssayText(event.target.value)}
                  placeholder="Start writing your essay here..."
                  rows={8}
                  value={essayText}
                />
              </label>
              <label className="space-y-2 text-sm font-medium text-[#102014]">
                目标分数
                <Select
                  name="targetBand"
                  onChange={(event) => setSelectedTargetBand(event.target.value)}
                  value={selectedTargetBand}
                >
                  <option>6.0</option>
                  <option>6.5</option>
                  <option>7.0</option>
                  <option>7.5</option>
                </Select>
              </label>
              <Button
                onClick={loadSampleEssay}
                type="button"
                variant="soft"
                {...futureActionProps("loadSampleEssay")}
              >
                填入示例作文
              </Button>
              <div className="rounded-2xl bg-[#FAFBF7] px-4 py-3 text-sm text-[#5F6B61]">
                小贴士：Task 2 最低允许 150 words，推荐 250+ words；建议写作时间 40 分钟，预留 5 分钟检查与修改。
              </div>
              <StatusMessage message={statusMessage} type={statusType} />
              {hasRestoredDraft ? (
                <p className="text-xs text-[#8A938B]">草稿已自动保存在本机。</p>
              ) : null}
              <Button
                className="w-full"
                disabled={isSubmitting}
                size="lg"
                type="submit"
              >
                {isSubmitting ? "教练分析中..." : "交给教练分析"}
                <ArrowRight size={18} />
              </Button>
            </form>
          </CardContent>
        </Card>

        <aside className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>写作建议</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {writingTips.map((tip) => (
                <div className="flex items-start gap-3" key={tip}>
                  <CheckCircle2 className="mt-0.5 text-[#2F6B45]" size={18} />
                  <p className="text-sm leading-6 text-[#5F6B61]">{tip}</p>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="grid grid-cols-2 gap-4 p-6 text-center">
              <div>
                <p className="text-sm text-[#5F6B61]">最低</p>
                <p className="mt-2 text-3xl font-semibold">150</p>
                <p className="text-sm text-[#5F6B61]">词</p>
              </div>
              <div className="border-l border-[#DDE5DC]">
                <p className="text-sm text-[#5F6B61]">推荐</p>
                <p className="mt-2 text-3xl font-semibold">250+</p>
                <p className="text-sm text-[#5F6B61]">词</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-start gap-4 p-6">
              <IconPill>
                <CalendarDays size={20} />
              </IconPill>
              <div>
                <p className="font-semibold">考试倒计时</p>
                <p className="mt-2 text-3xl font-semibold">56 天</p>
                <p className="mt-1 text-sm text-[#5F6B61]">
                  目标考试日期：{examDate}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#E8F1E7]">
            <CardContent className="flex items-start gap-4 p-6">
              <IconPill>
                <ShieldCheck size={20} />
              </IconPill>
              <p className="text-sm leading-6 text-[#5F6B61]">
                教练指导，非官方分数。反馈用于帮助你提升写作能力，不等同于 IELTS 成绩或评分。
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>

      <section className="mt-8">
        <h2 className="mb-4 text-xl font-semibold text-[#102014]">
          需要灵感？试试这些范文题目
        </h2>
        <div className="grid gap-4 lg:grid-cols-3">
          {samplePrompts.map((prompt, index) => (
            <Card key={prompt.id}>
              <CardContent className="p-5">
                <Badge>{index + 1}</Badge>
                <p className="mt-4 text-sm leading-6 text-[#102014]">
                  {prompt.prompt}
                </p>
                <Badge className="mt-4" variant="outline">
                  {prompt.category}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
