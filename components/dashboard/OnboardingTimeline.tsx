import { Check, X, Dot, CircleDashed } from "lucide-react";
import { cn } from "@/lib/cn";

export type TimelineStage = {
  key: string;
  label: string;
  state: "PENDING" | "CURRENT" | "COMPLETED" | "FAILED" | "SKIPPED";
  enteredAt?: string | Date | null;
  completedAt?: string | Date | null;
  notes?: string | null;
};

function fmt(value?: string | Date | null) {
  if (!value) return null;
  const d = typeof value === "string" ? new Date(value) : value;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

const DOT: Record<TimelineStage["state"], { icon: typeof Check; cls: string }> = {
  COMPLETED: { icon: Check, cls: "bg-ink text-lime border-ink" },
  CURRENT: { icon: Dot, cls: "bg-lime-soft text-ink border-ink" },
  FAILED: { icon: X, cls: "bg-error/10 text-error border-error" },
  SKIPPED: { icon: CircleDashed, cls: "bg-surface text-muted-2 border-border" },
  PENDING: { icon: CircleDashed, cls: "bg-surface text-muted-2 border-border" },
};

export function OnboardingTimeline({
  stages,
  showNotes = false,
  className,
}: {
  stages: TimelineStage[];
  showNotes?: boolean;
  className?: string;
}) {
  return (
    <ol className={cn("flex flex-col", className)}>
      {stages.map((stage, i) => {
        const { icon: Icon, cls } = DOT[stage.state];
        const isLast = i === stages.length - 1;
        const date = fmt(stage.completedAt) ?? fmt(stage.enteredAt);
        return (
          <li key={stage.key} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full border", cls)}>
                <Icon className="h-4 w-4" aria-hidden />
              </span>
              {!isLast ? (
                <span
                  className={cn(
                    "w-0.5 flex-1",
                    stage.state === "COMPLETED" ? "bg-ink" : "bg-border",
                  )}
                />
              ) : null}
            </div>
            <div className={cn("pb-6", isLast && "pb-0")}>
              <p
                className={cn(
                  "text-sm font-medium",
                  stage.state === "PENDING" ? "text-muted-2" : "text-ink",
                  stage.state === "FAILED" && "text-error",
                )}
              >
                {stage.label}
                {stage.state === "CURRENT" ? (
                  <span className="ml-2 rounded-full bg-lime-soft px-2 py-0.5 text-[11px] font-semibold text-ink">
                    In progress
                  </span>
                ) : null}
              </p>
              {date ? <p className="mt-0.5 text-xs text-muted">{date}</p> : null}
              {showNotes && stage.notes ? <p className="mt-1 text-xs text-muted">{stage.notes}</p> : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
