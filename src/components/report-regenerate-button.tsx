"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { StatusMessage } from "@/components/status-message";

export function ReportRegenerateButton({ reportId }: { reportId: string }) {
  const router = useRouter();
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [message, setMessage] = useState("");

  async function regenerateReport() {
    setMessage("");
    setIsRegenerating(true);

    try {
      const response = await fetch(`/api/reports/${reportId}/regenerate`, {
        method: "POST",
      });
      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
        reportId?: string;
      };

      if (!response.ok || !payload.reportId) {
        setMessage(payload.error ?? "报告重新生成失败，请稍后重试。");
        return;
      }

      router.refresh();
    } finally {
      setIsRegenerating(false);
    }
  }

  return (
    <div className="space-y-3">
      <Button
        disabled={isRegenerating}
        onClick={regenerateReport}
        type="button"
      >
        <RotateCcw size={16} />
        {isRegenerating ? "重新生成中..." : "重新生成报告"}
      </Button>
      <StatusMessage message={message} />
    </div>
  );
}
