"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

export function DeleteEssayButton({ essayId }: { essayId: string }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function deleteEssay() {
    const confirmed = window.confirm("确定删除这篇作文及其关联报告和训练记录吗？");

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/essays/${essayId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        window.alert("删除失败，请稍后重试。");
        return;
      }

      router.refresh();
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Button
      aria-label={isDeleting ? "正在删除" : "删除作文"}
      className="h-8 w-8 px-0"
      disabled={isDeleting}
      onClick={deleteEssay}
      size="sm"
      title={isDeleting ? "正在删除" : "删除作文"}
      type="button"
      variant="outline"
    >
      <Trash2 size={15} />
    </Button>
  );
}
