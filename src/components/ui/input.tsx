import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-[12px] border border-[#DDE5DC] bg-white px-4 text-sm text-[#102014] outline-none transition focus:border-[#2F6B45] focus:ring-2 focus:ring-[#2F6B45]/15",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
