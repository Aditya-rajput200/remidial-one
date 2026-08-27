"use client";

import { useState, type ReactNode } from "react";
import { CalendarClock } from "lucide-react";
import type { DashboardSession, SessionStatus } from "@/lib/data/types";
import { SessionCard } from "@/components/dashboard/SessionCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/cn";

const TABS: { key: SessionStatus; label: string }[] = [
  { key: "upcoming", label: "Upcoming" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

export function SessionTabs({
  sessions,
  onReschedule,
  onCancel,
  onMarkComplete,
  emptyAction,
}: {
  sessions: DashboardSession[];
  onReschedule?: (id: string, date: string) => void;
  onCancel?: (id: string) => void;
  onMarkComplete?: (id: string) => void;
  emptyAction?: ReactNode;
}) {
  const [tab, setTab] = useState<SessionStatus>("upcoming");
  const filtered = sessions
    .filter((s) => s.status === tab)
    .sort((a, b) => (tab === "upcoming" ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date)));

  return (
    <div className="flex flex-col gap-5">
      <div className="flex gap-1 rounded-full border border-border bg-white p-1 w-fit">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-150",
              tab === t.key ? "bg-ink text-white" : "text-muted hover:text-ink"
            )}
          >
            {t.label} ({sessions.filter((s) => s.status === t.key).length})
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div className="flex flex-col gap-4">
          {filtered.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              onReschedule={onReschedule}
              onCancel={onCancel}
              onMarkComplete={onMarkComplete}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={CalendarClock}
          title={`No ${tab} sessions`}
          description={`You don't have any ${tab} sessions right now.`}
          action={emptyAction}
        />
      )}
    </div>
  );
}
