import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "lime" | "ink" | "outline";

const toneClasses: Record<Tone, string> = {
  lime: "bg-lime-soft text-ink",
  ink: "bg-ink text-white",
  outline: "border border-border-strong text-muted",
};

export function Badge({
  children,
  tone = "lime",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
        toneClasses[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
