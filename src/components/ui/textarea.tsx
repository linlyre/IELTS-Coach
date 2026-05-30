import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "min-h-28 w-full resize-none rounded-[12px] border border-[#DDE5DC] bg-white px-4 py-3 text-sm leading-6 text-[#102014] outline-none transition placeholder:text-[#8A938B] focus:border-[#2F6B45] focus:ring-2 focus:ring-[#2F6B45]/15",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
