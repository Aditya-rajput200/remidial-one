import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Card({
  children,
  className,
  interactive = false,
}: {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-white p-6 shadow-card",
        interactive &&
          "transition-all duration-300 hover:-translate-y-1 hover:border-ink/15 hover:shadow-lift",
        className
      )}
    >
      {children}
    </div>
  );
}
