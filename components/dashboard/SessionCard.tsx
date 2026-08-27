"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar as CalendarIcon, Clock3, Video, RotateCcw, XCircle, CheckCircle2 } from "lucide-react";
import type { DashboardSession } from "@/lib/data/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/cn";

const statusTone: Record<DashboardSession["status"], "lime" | "outline" | "ink"> = {
  upcoming: "lime",
  completed: "outline",
  cancelled: "outline",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function SessionCard({
  session,
  onReschedule,
  onCancel,
  onMarkComplete,
}: {
  session: DashboardSession;
  onReschedule?: (id: string, date: string) => void;
  onCancel?: (id: string) => void;
  onMarkComplete?: (id: string) => void;
}) {
  const [rescheduling, setRescheduling] = useState(false);
  const [newDate, setNewDate] = useState("");

  function submitReschedule() {
    if (!newDate) return;
    onReschedule?.(session.id, new Date(newDate).toISOString());
    setRescheduling(false);
    setNewDate("");
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-ink sm:text-lg">{session.subjectName}</h3>
            <Badge tone={statusTone[session.status]} className={cn(session.status === "cancelled" && "text-error")}>
              {session.status}
            </Badge>
          </div>
          <p className="text-sm text-muted">
            with <span className="font-medium text-ink">{session.counterpartName}</span> · {session.classBandName}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-muted">
        <span className="inline-flex items-center gap-1.5">
          <CalendarIcon className="h-4 w-4" aria-hidden />
          {formatDate(session.date)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock3 className="h-4 w-4" aria-hidden />
          {session.durationMinutes} min
        </span>
      </div>

      {session.notes ? <p className="text-sm leading-relaxed text-muted">{session.notes}</p> : null}

      {rescheduling ? (
        <div className="flex flex-wrap items-center gap-3 rounded-xl bg-surface p-3">
          <Input
            type="datetime-local"
            value={newDate}
            onChange={(event) => setNewDate(event.target.value)}
            className="max-w-xs"
          />
          <Button type="button" size="sm" variant="primary-black" onClick={submitReschedule}>
            Confirm
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={() => setRescheduling(false)}>
            Cancel
          </Button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2 pt-1">
          {session.status === "upcoming" ? (
            <>
              <Button href={`/session/${session.id}/room`} size="sm" variant="primary-lime" className="gap-1.5">
                <Video className="h-4 w-4" aria-hidden />
                Join Session
              </Button>
              <Button size="sm" variant="secondary-outline" className="gap-1.5" onClick={() => setRescheduling(true)}>
                <RotateCcw className="h-4 w-4" aria-hidden />
                Reschedule
              </Button>
              {onMarkComplete ? (
                <Button
                  size="sm"
                  variant="ghost"
                  className="gap-1.5"
                  onClick={() => onMarkComplete(session.id)}
                >
                  <CheckCircle2 className="h-4 w-4" aria-hidden />
                  Mark Complete
                </Button>
              ) : null}
              <Button
                size="sm"
                variant="ghost"
                className="gap-1.5 text-error hover:bg-error-soft"
                onClick={() => {
                  if (window.confirm("Cancel this session?")) onCancel?.(session.id);
                }}
              >
                <XCircle className="h-4 w-4" aria-hidden />
                Cancel
              </Button>
            </>
          ) : session.status === "cancelled" ? (
            <Button size="sm" variant="secondary-outline" className="gap-1.5" onClick={() => setRescheduling(true)}>
              <RotateCcw className="h-4 w-4" aria-hidden />
              Rebook
            </Button>
          ) : (
            <Link
              href={`/session/${session.id}/room`}
              className="text-sm font-semibold text-ink underline underline-offset-4"
            >
              View session notes
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
