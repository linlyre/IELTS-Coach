import type { ReactNode } from "react";

import { SiteHeader } from "@/components/site-header";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1440px] overflow-hidden rounded-[32px] border border-white/70 bg-[#FAFBF7]/95 shadow-[0_24px_70px_rgba(18,61,36,0.12)] backdrop-blur">
        <SiteHeader />
        <main className="px-6 py-8 sm:px-10 lg:px-14 lg:py-12">{children}</main>
      </div>
    </div>
  );
}
