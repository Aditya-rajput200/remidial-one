import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-12 w-full rounded-xl border border-border bg-white px-4 text-[15px] text-ink placeholder:text-muted-2 transition-colors duration-200 focus:border-ink/40 focus:outline-none",
        className
      )}
      {...props}
    />
  );
}
