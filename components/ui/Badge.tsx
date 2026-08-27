import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "lime" | "ink" | "outline" | "outline-dark" | "outline-lime";

const toneClasses: Record<Tone, string> = {
  lime: "bg-lime-soft text-ink",
  ink: "bg-ink text-white",
  outline: "border border-border-strong text-muted",
  "outline-dark": "border border-white/20 text-white/80",
  "outline-lime": "border border-lime/40 bg-white text-lime-ink",
};

export function Badge({
  children,
  tone = "lime",
  dot = false,
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  dot?: boolean;
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
      {dot ? <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-lime" aria-hidden /> : null}
      {children}
    </span>
  );
}
