import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-5 rounded-3xl border border-dashed border-border-strong bg-surface px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-ink shadow-card">
        <Icon className="h-6 w-6" strokeWidth={1.5} aria-hidden />
      </div>
      <div className="flex max-w-md flex-col gap-2">
        <h3 className="text-xl font-semibold text-ink">{title}</h3>
        <p className="text-sm leading-relaxed text-muted sm:text-base">{description}</p>
      </div>
      {action}
    </div>
  );
}
