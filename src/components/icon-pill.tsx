import type { ReactNode } from "react";

export function IconPill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#E8F1E7] text-[#123D24]">
      {children}
    </span>
  );
}
