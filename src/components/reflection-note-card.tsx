"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusMessage } from "@/components/status-message";
import { Textarea } from "@/components/ui/textarea";

export function ReflectionNoteCard({
  disabled,
  initialNote,
  questions,
  reflectionId,
}: {
  disabled: boolean;
  initialNote: string;
  questions: string[];
  reflectionId: string | null;
}) {
  const router = useRouter();
  const [note, setNote] = useState(initialNote);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");

  async function saveReflection() {
    if (!reflectionId) {
      return;
    }

    setIsSaving(true);
    setMessage("");

    try {
      const response = await fetch(`/api/reflections/${reflectionId}`, {
        body: JSON.stringify({ note }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "PATCH",
      });
      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!response.ok) {
        setMessageType("error");
        setMessage(payload.error ?? "反思保存失败，请稍后重试。");
        return;
      }

      setMessageType("success");
      setMessage("反思已保存。");
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>反思</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {questions.map((question, index) => (
          <div className="flex gap-3" key={question}>
            <Badge>{index + 1}</Badge>
            <p className="text-sm leading-6 text-[#5F6B61]">{question}</p>
          </div>
        ))}
        <Textarea
          disabled={disabled || isSaving}
          onChange={(event) => setNote(event.target.value)}
          placeholder={
            disabled
              ? "示例报告不支持保存个人反思。"
              : "在此输入你的反思笔记..."
          }
          rows={4}
          value={note}
        />
        <Button
          disabled={disabled || isSaving || !reflectionId}
          onClick={saveReflection}
          type="button"
        >
          {isSaving ? "保存中..." : "保存反思"}
        </Button>
        <StatusMessage message={message} type={messageType} />
      </CardContent>
    </Card>
  );
}
