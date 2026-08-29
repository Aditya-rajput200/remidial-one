"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar as CalendarIcon, Clock3, Video, RotateCcw, XCircle, CheckCircle2, Star, History } from "lucide-react";
import type { DashboardSession } from "@/lib/data/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/lib/cn";

const RATING_VALUES = Array.from({ length: 10 }, (_, i) => i + 1);

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

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
}

function formatActualTiming(startedAt: string, endedAt: string | null) {
  if (!endedAt) return `Started ${formatTime(startedAt)} · still recording`;
  const minutes = Math.max(1, Math.round((new Date(endedAt).getTime() - new Date(startedAt).getTime()) / 60000));
  return `${minutes} min actual · ${formatTime(startedAt)}–${formatTime(endedAt)}`;
}

export function SessionCard({
  session,
  onReschedule,
  onCancel,
  onMarkComplete,
  onRate,
}: {
  session: DashboardSession;
  onReschedule?: (id: string, date: string) => void;
  onCancel?: (id: string) => void;
  onMarkComplete?: (id: string) => void;
  onRate?: (id: string, rating: number, note?: string) => Promise<boolean> | void;
}) {
  const [rescheduling, setRescheduling] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [rating, setRating] = useState(false);
  const [ratingValue, setRatingValue] = useState<number | null>(session.mentorRating ?? null);
  const [ratingNote, setRatingNote] = useState(session.mentorRatingNote ?? "");
  const [savingRating, setSavingRating] = useState(false);

  function submitReschedule() {
    if (!newDate) return;
    onReschedule?.(session.id, new Date(newDate).toISOString());
    setRescheduling(false);
    setNewDate("");
  }

  async function submitRating() {
    if (!ratingValue) return;
    setSavingRating(true);
    const ok = await onRate?.(session.id, ratingValue, ratingNote.trim() || undefined);
    setSavingRating(false);
    if (ok !== false) setRating(false);
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
            {typeof session.mentorRating === "number" ? (
              <Badge tone="lime" className="normal-case">
                <Star className="h-3 w-3 fill-current" aria-hidden />
                {session.mentorRating}/10
              </Badge>
            ) : null}
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
          {session.durationMinutes} min scheduled
        </span>
        {session.actualStartedAt ? (
          <span className="inline-flex items-center gap-1.5">
            <History className="h-4 w-4" aria-hidden />
            {formatActualTiming(session.actualStartedAt, session.actualEndedAt ?? null)}
          </span>
        ) : null}
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
      ) : rating ? (
        <div className="flex flex-col gap-3 rounded-xl bg-surface p-3">
          <div className="flex flex-wrap gap-1.5">
            {RATING_VALUES.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRatingValue(value)}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border text-sm font-medium transition-colors duration-150",
                  ratingValue === value ? "border-ink bg-ink text-white" : "border-border text-muted hover:border-ink/40"
                )}
              >
                {value}
              </button>
            ))}
          </div>
          <Textarea
            placeholder="Optional note for this score (visible to the student)"
            value={ratingNote}
            onChange={(e) => setRatingNote(e.target.value)}
            className="min-h-[60px]"
          />
          <div className="flex gap-2">
            <Button type="button" size="sm" variant="primary-black" onClick={submitRating} disabled={!ratingValue || savingRating}>
              {savingRating ? "Saving…" : "Save Score"}
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setRating(false)}>
              Cancel
            </Button>
          </div>
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
            <>
              <Link
                href={`/session/${session.id}/room`}
                className="text-sm font-semibold text-ink underline underline-offset-4"
              >
                View session notes
              </Link>
              {onRate ? (
                <Button size="sm" variant="secondary-outline" className="gap-1.5" onClick={() => setRating(true)}>
                  <Star className="h-4 w-4" aria-hidden />
                  {typeof session.mentorRating === "number" ? "Edit Score" : "Score Session"}
                </Button>
              ) : null}
            </>
          )}
        </div>
      )}
    </div>
  );
}
