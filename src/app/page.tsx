import Link from "next/link";
import { BarChart3, MessageSquareText, Target } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { IconPill } from "@/components/icon-pill";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { futureActionProps } from "@/lib/future-actions";
import { landingPageContent } from "@/lib/mock-data";

const capabilityIcons = [Target, MessageSquareText, BarChart3];

export default function HomePage() {
  return (
    <AppShell>
      <section className="mx-auto max-w-5xl text-center">
        <p className="mb-4 text-sm font-semibold text-[#2F6B45]">
          IELTS Writing Growth Coach
        </p>
        <h1 className="font-serif text-5xl font-semibold leading-tight text-[#123D24] sm:text-6xl">
          你的雅思写作私人教练
        </h1>
        <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-[#5F6B61]">
          管理每一篇作文，获得教练级反馈，精准发现问题，一步步提升写作能力，稳步冲击理想分数。
        </p>
        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <Link href="/write">
            <Button size="lg" {...futureActionProps("startPractice")}>
              开始写作训练
            </Button>
          </Link>
          <Link href="/report/demo">
            <Button size="lg" variant="outline" {...futureActionProps("viewReport")}>
              查看示例报告
            </Button>
          </Link>
        </div>
      </section>

      <section className="mt-10 rounded-[24px] border border-[#DDE5DC] bg-[#17351F] p-5 shadow-[0_18px_40px_rgba(18,61,36,0.18)]">
        <div className="grid gap-6 rounded-[18px] border border-white/10 bg-[radial-gradient(circle_at_25%_20%,rgba(255,255,255,0.12),transparent_20rem),#15341e] p-6 text-[#F4F1DD] lg:grid-cols-[1fr_0.9fr] lg:p-10">
          <div className="space-y-5 font-serif">
            <p className="text-4xl">IELTS learning</p>
            <p className="text-3xl">Task 2</p>
            <ul className="space-y-3 text-xl">
              <li>✓ Ideas</li>
              <li>✓ Coherence</li>
              <li>✓ Lexical range</li>
              <li>✓ Grammar accuracy</li>
            </ul>
          </div>
          <div className="space-y-4 rounded-2xl border border-white/15 bg-white/5 p-6">
            <p className="font-serif text-3xl">Band 7+</p>
            <p className="text-sm leading-6 text-[#E8F1E7]">
              {landingPageContent.coachFlow.join(" → ")}
            </p>
            <div className="grid gap-3 text-sm sm:grid-cols-2">
              {landingPageContent.previewCards.map((card) => (
                <div className="rounded-xl bg-white/10 p-4" key={card}>
                  {card}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-3">
        {landingPageContent.capabilities.map((item, index) => {
          const Icon = capabilityIcons[index];

          return (
            <Card key={item.title}>
              <CardContent className="flex items-start gap-4 p-6">
                <IconPill>
                  <Icon size={20} />
                </IconPill>
                <div>
                  <h2 className="font-semibold text-[#102014]">{item.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-[#5F6B61]">
                    {item.text}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <p className="mt-6 rounded-2xl bg-[#E8F1E7] px-5 py-4 text-sm leading-6 text-[#5F6B61]">
        AI 反馈仅用于写作训练诊断，不代表官方 IELTS 成绩。
      </p>
    </AppShell>
  );
}
