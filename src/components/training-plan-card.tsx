"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusMessage } from "@/components/status-message";

type TrainingTask = {
  id: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  focusArea: string;
  status: string;
};

export function TrainingPlanCard({
  disabled,
  tasks,
}: {
  disabled: boolean;
  tasks: TrainingTask[];
}) {
  const router = useRouter();
  const [pendingTaskId, setPendingTaskId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  async function markAsDone(taskId: string) {
    setPendingTaskId(taskId);
    setMessage("");

    try {
      const response = await fetch(`/api/drills/${taskId}`, {
        body: JSON.stringify({ status: "completed" }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "PATCH",
      });
      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!response.ok) {
        setMessage(payload.error ?? "训练任务更新失败，请稍后重试。");
        return;
      }

      router.refresh();
    } finally {
      setPendingTaskId(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>训练计划</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {tasks.map((task) => (
          <div
            className="flex items-center justify-between gap-4 rounded-2xl border border-[#E9EEE8] p-4"
            key={task.id}
          >
            <div>
              <p className="font-medium">{task.title}</p>
              <p className="text-sm text-[#5F6B61]">{task.description}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant="outline">{task.focusArea}</Badge>
                <Badge variant="outline">{task.estimatedMinutes} 分钟</Badge>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Badge variant={task.status === "已完成" ? "soft" : "outline"}>
                {task.status}
              </Badge>
              <Button
                disabled={
                  disabled ||
                  task.status === "已完成" ||
                  pendingTaskId === task.id
                }
                onClick={() => markAsDone(task.id)}
                size="sm"
                type="button"
                variant="outline"
              >
                {pendingTaskId === task.id ? "更新中..." : "标记完成"}
              </Button>
            </div>
          </div>
        ))}
        <StatusMessage message={message} />
      </CardContent>
    </Card>
  );
}
