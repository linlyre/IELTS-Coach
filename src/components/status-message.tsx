import { cn } from "@/lib/utils";

export function StatusMessage({
  message,
  type,
}: {
  message?: string;
  type?: string;
}) {
  if (!message) {
    return null;
  }

  return (
    <p
      role={type === "success" ? "status" : "alert"}
      className={cn(
        "rounded-2xl px-4 py-3 text-sm leading-6",
        type === "success"
          ? "bg-[#E8F1E7] text-[#123D24]"
          : "bg-[#FCE7E2] text-[#A33F31]",
      )}
    >
      {message}
    </p>
  );
}
