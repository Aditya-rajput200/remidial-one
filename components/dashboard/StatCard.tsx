import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  className,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-3 rounded-2xl border border-border bg-white p-5", className)}>
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-soft text-ink">
        <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
      </div>
      <div>
        <p className="text-2xl font-semibold tracking-tight text-ink">{value}</p>
        <p className="text-sm text-muted">{label}</p>
      </div>
      {hint ? <p className="text-xs text-muted-2">{hint}</p> : null}
    </div>
  );
}
