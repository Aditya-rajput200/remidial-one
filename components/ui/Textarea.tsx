import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-32 w-full rounded-xl border border-border bg-white px-4 py-3 text-[15px] text-ink placeholder:text-muted-2 transition-colors duration-200 focus:border-ink/40 focus:outline-none",
        className
      )}
      {...props}
    />
  );
}
