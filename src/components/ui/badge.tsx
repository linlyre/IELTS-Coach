import * as React from "react";

import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "soft" | "warning" | "danger" | "outline";

const variants: Record<BadgeVariant, string> = {
  default: "bg-[#123D24] text-white",
  soft: "bg-[#E8F1E7] text-[#123D24]",
  warning: "bg-[#FFF4DA] text-[#8A5A00]",
  danger: "bg-[#FCE7E2] text-[#A33F31]",
  outline: "border border-[#DDE5DC] bg-white text-[#5F6B61]",
};

function Badge({
  className,
  variant = "soft",
  ...props
}: React.ComponentProps<"span"> & { variant?: BadgeVariant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
