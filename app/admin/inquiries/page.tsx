"use client";

import { useEffect, useState } from "react";
import { Inbox, CalendarHeart, Mail, Clock, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonList } from "@/components/dashboard/DashboardSkeletons";
import { cn } from "@/lib/cn";

type LeadStatus = "NEW" | "CONTACTED" | "SCHEDULED" | "CLOSED";

type LeadActivityOutcome =
  | "CALL_NO_ANSWER"
  | "CALL_CONNECTED"
  | "EMAILED"
  | "WHATSAPP_SENT"
  | "SCHEDULED_CALL"
  | "NOT_INTERESTED"
  | "CONVERTED"
  | "OTHER";

type LeadActivity = {
  id: string;
  outcome: LeadActivityOutcome;
  note: string | null;
  nextFollowUpAt: string | null;
  createdAt: string;
  author: { name: string };
};

type CounsellingRequestRow = {
  id: string;
  parentName: string;
  studentName: string;
  relation: string;
  email: string;
  phone: string;
  classBand: string | null;
  focusArea: string | null;
  preferredTime: string | null;
  message: string | null;
  status: LeadStatus;
  internalNotes: string | null;
  nextFollowUpAt: string | null;
  activities: LeadActivity[];
  createdAt: string;
};

type ContactMessageRow = {
  id: string;
  name: string;
  email: string;
  reason: string;
  message: string;
  status: LeadStatus;
  internalNotes: string | null;
  nextFollowUpAt: string | null;
  activities: LeadActivity[];
  createdAt: string;
};

const STATUS_TONE: Record<LeadStatus, "lime" | "ink" | "outline"> = {
  NEW: "lime",
  CONTACTED: "outline",
  SCHEDULED: "ink",
  CLOSED: "outline",
};

const STATUS_OPTIONS: LeadStatus[] = ["NEW", "CONTACTED", "SCHEDULED", "CLOSED"];

const OUTCOME_OPTIONS: { value: LeadActivityOutcome; label: string }[] = [
  { value: "CALL_NO_ANSWER", label: "Called — no answer" },
  { value: "CALL_CONNECTED", label: "Called — connected" },
  { value: "EMAILED", label: "Emailed" },
  { value: "WHATSAPP_SENT", label: "WhatsApp sent" },
  { value: "SCHEDULED_CALL", label: "Scheduled a call" },
  { value: "NOT_INTERESTED", label: "Not interested" },
  { value: "CONVERTED", label: "Converted" },
  { value: "OTHER", label: "Other" },
];

const OUTCOME_LABEL: Record<LeadActivityOutcome, string> = Object.fromEntries(
  OUTCOME_OPTIONS.map((o) => [o.value, o.label])
) as Record<LeadActivityOutcome, string>;

function statusLabel(status: LeadStatus) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

// <input type="datetime-local"> wants "YYYY-MM-DDTHH:mm" in local time, not
// an ISO string with a timezone offset.
function toLocalDateTimeInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function FollowUpBadge({ nextFollowUpAt }: { nextFollowUpAt: string | null }) {
  // Date.now() is impure to call directly in a render body — a lazy useState
  // initializer runs it exactly once, which is the accepted escape hatch.
  // A snapshot from mount time is precise enough for an "overdue" badge that
  // re-renders anyway whenever the list refetches.
  const [now] = useState(() => Date.now());
  if (!nextFollowUpAt) return null;
  const overdue = new Date(nextFollowUpAt).getTime() < now;
  return (
    <Badge tone="outline" className={overdue ? "border-error/40 text-error" : undefined}>
      {overdue ? <AlertTriangle className="h-3 w-3" aria-hidden /> : <Clock className="h-3 w-3" aria-hidden />}
      {overdue ? "Overdue" : "Follow up"} {new Date(nextFollowUpAt).toLocaleString()}
    </Badge>
  );
}

// Status quick-switch, activity timeline, and the "log a follow-up" form —
// shared between both lead types via the `resource` discriminator.
function LeadFooter({
  id,
  resource,
  status,
  internalNotes,
  nextFollowUpAt,
  activities,
  onUpdated,
}: {
  id: string;
  resource: "counselling-requests" | "contact-messages";
  status: LeadStatus;
  internalNotes: string | null;
  nextFollowUpAt: string | null;
  activities: LeadActivity[];
  onUpdated: () => void;
}) {
  const [notes, setNotes] = useState(internalNotes ?? "");
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);

  const [outcome, setOutcome] = useState<LeadActivityOutcome>("CALL_CONNECTED");
  const [activityNote, setActivityNote] = useState("");
  // Prefilled with the lead's current follow-up date (if any) so logging an
  // activity defaults to "keep the same reminder" rather than clearing it.
  const [nextFollowUp, setNextFollowUp] = useState(() => toLocalDateTimeInput(nextFollowUpAt));
  const [activityStatus, setActivityStatus] = useState<LeadStatus | "">("");
  const [logging, setLogging] = useState(false);
  const [logError, setLogError] = useState("");

  async function patch(body: Record<string, unknown>) {
    return fetch(`/api/${resource}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  async function handleStatusChange(next: LeadStatus) {
    setSavingStatus(true);
    await patch({ status: next });
    setSavingStatus(false);
    onUpdated();
  }

  async function handleSaveNotes() {
    setSavingNotes(true);
    await patch({ internalNotes: notes });
    setSavingNotes(false);
    onUpdated();
  }

  async function handleLogActivity() {
    setLogging(true);
    setLogError("");
    try {
      const res = await fetch(`/api/${resource}/${id}/activities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          outcome,
          note: activityNote || undefined,
          nextFollowUpAt: nextFollowUp ? new Date(nextFollowUp).toISOString() : undefined,
          status: activityStatus || undefined,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error || `Request failed (${res.status})`);
      setActivityNote("");
      setNextFollowUp("");
      setActivityStatus("");
      onUpdated();
    } catch (err) {
      setLogError(err instanceof Error ? err.message : "Could not log this follow-up.");
    } finally {
      setLogging(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 border-t border-border pt-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-muted">Status</span>
        <Select
          value={status}
          disabled={savingStatus}
          onChange={(e) => handleStatusChange(e.target.value as LeadStatus)}
          className="h-9 max-w-[10rem] text-sm"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {statusLabel(option)}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Pinned note (not visible to the requester)…"
          className="min-h-[44px] flex-1 text-sm"
        />
        <Button size="sm" variant="secondary-outline" onClick={handleSaveNotes} disabled={savingNotes}>
          {savingNotes ? "Saving…" : "Save Note"}
        </Button>
      </div>

      {activities.length > 0 ? (
        <div className="flex flex-col gap-2 rounded-xl bg-surface p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Follow-up history</p>
          <ul className="flex flex-col gap-2">
            {activities.map((activity) => (
              <li key={activity.id} className="text-sm text-ink">
                <span className="font-medium">{OUTCOME_LABEL[activity.outcome]}</span>
                <span className="text-muted"> · {activity.author.name} · {new Date(activity.createdAt).toLocaleString()}</span>
                {activity.note ? <p className="mt-0.5 text-muted">{activity.note}</p> : null}
                {activity.nextFollowUpAt ? (
                  <p className="mt-0.5 text-xs text-muted-2">
                    Next follow-up set for {new Date(activity.nextFollowUpAt).toLocaleString()}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="flex flex-col gap-2 rounded-xl border border-dashed border-border p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Log a follow-up</p>
        <div className="grid gap-2 sm:grid-cols-3">
          <Select value={outcome} onChange={(e) => setOutcome(e.target.value as LeadActivityOutcome)} className="h-9 text-sm">
            {OUTCOME_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          <Input
            type="datetime-local"
            value={nextFollowUp}
            onChange={(e) => setNextFollowUp(e.target.value)}
            className="h-9 text-sm"
            title="Next follow-up (optional)"
          />
          <Select
            value={activityStatus}
            onChange={(e) => setActivityStatus(e.target.value as LeadStatus | "")}
            className="h-9 text-sm"
          >
            <option value="">Also update status…</option>
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {statusLabel(option)}
              </option>
            ))}
          </Select>
        </div>
        <Textarea
          value={activityNote}
          onChange={(e) => setActivityNote(e.target.value)}
          placeholder="What happened? (optional)"
          className="min-h-[44px] text-sm"
        />
        {logError ? <p className="text-xs font-medium text-error">{logError}</p> : null}
        <Button size="sm" variant="primary-black" onClick={handleLogActivity} disabled={logging} className="w-fit">
          {logging ? "Logging…" : "Log Follow-up"}
        </Button>
      </div>
    </div>
  );
}

function FilterBar({
  status,
  onStatusChange,
  dueOnly,
  onDueOnlyChange,
}: {
  status: string;
  onStatusChange: (value: string) => void;
  dueOnly: boolean;
  onDueOnlyChange: (value: boolean) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select value={status} onChange={(e) => onStatusChange(e.target.value)} className="max-w-xs">
        <option value="">All statuses</option>
        {STATUS_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {statusLabel(option)}
          </option>
        ))}
      </Select>
      <label className="flex items-center gap-2 text-sm text-ink">
        <input type="checkbox" checked={dueOnly} onChange={(e) => onDueOnlyChange(e.target.checked)} />
        Follow-ups due only
      </label>
    </div>
  );
}

function CounsellingRequestsPanel() {
  const [status, setStatus] = useState("");
  const [dueOnly, setDueOnly] = useState(false);
  const [rows, setRows] = useState<CounsellingRequestRow[] | null>(null);
  const [error, setError] = useState("");

  function load() {
    const params = new URLSearchParams({ limit: "50" });
    if (status) params.set("status", status);
    if (dueOnly) params.set("dueOnly", "1");
    fetch(`/api/counselling-requests?${params.toString()}`)
      .then(async (res) => {
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body?.error || `Request failed (${res.status})`);
        return body;
      })
      .then((body) => {
        setError("");
        setRows(body.requests);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load requests."));
  }

  useEffect(load, [status, dueOnly]);

  return (
    <div className="flex flex-col gap-4">
      <FilterBar status={status} onStatusChange={setStatus} dueOnly={dueOnly} onDueOnlyChange={setDueOnly} />
      {error ? <p className="text-sm font-medium text-error">{error}</p> : null}
      {rows === null && !error ? (
        <SkeletonList rows={5} />
      ) : rows && rows.length > 0 ? (
        <div className="flex flex-col gap-3">
          {rows.map((row) => (
            <div key={row.id} className="flex flex-col gap-3 rounded-2xl border border-border bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-ink">
                    {row.studentName} <span className="text-muted">— {row.relation} is</span> {row.parentName}
                  </p>
                  <p className="text-sm text-muted">
                    {row.email} · {row.phone}
                    {row.classBand ? ` · ${row.classBand}` : ""}
                    {row.focusArea ? ` · ${row.focusArea}` : ""}
                  </p>
                  {row.preferredTime ? (
                    <p className="text-xs text-muted-2">Preferred call time: {row.preferredTime}</p>
                  ) : null}
                  {row.message ? <p className="mt-2 text-sm text-ink">{row.message}</p> : null}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge tone={STATUS_TONE[row.status]}>{row.status}</Badge>
                  <FollowUpBadge nextFollowUpAt={row.nextFollowUpAt} />
                  <span className="text-xs text-muted-2">{new Date(row.createdAt).toLocaleString()}</span>
                </div>
              </div>
              <LeadFooter
                id={row.id}
                resource="counselling-requests"
                status={row.status}
                internalNotes={row.internalNotes}
                nextFollowUpAt={row.nextFollowUpAt}
                activities={row.activities}
                onUpdated={load}
              />
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon={CalendarHeart} title="No counselling requests" description="Try a different filter." />
      )}
    </div>
  );
}

function ContactMessagesPanel() {
  const [status, setStatus] = useState("");
  const [dueOnly, setDueOnly] = useState(false);
  const [rows, setRows] = useState<ContactMessageRow[] | null>(null);
  const [error, setError] = useState("");

  function load() {
    const params = new URLSearchParams({ limit: "50" });
    if (status) params.set("status", status);
    if (dueOnly) params.set("dueOnly", "1");
    fetch(`/api/contact-messages?${params.toString()}`)
      .then(async (res) => {
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body?.error || `Request failed (${res.status})`);
        return body;
      })
      .then((body) => {
        setError("");
        setRows(body.messages);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load messages."));
  }

  useEffect(load, [status, dueOnly]);

  return (
    <div className="flex flex-col gap-4">
      <FilterBar status={status} onStatusChange={setStatus} dueOnly={dueOnly} onDueOnlyChange={setDueOnly} />
      {error ? <p className="text-sm font-medium text-error">{error}</p> : null}
      {rows === null && !error ? (
        <SkeletonList rows={5} />
      ) : rows && rows.length > 0 ? (
        <div className="flex flex-col gap-3">
          {rows.map((row) => (
            <div key={row.id} className="flex flex-col gap-3 rounded-2xl border border-border bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-ink">
                    {row.name} <span className="text-muted">— {row.reason}</span>
                  </p>
                  <p className="text-sm text-muted">{row.email}</p>
                  <p className="mt-2 text-sm text-ink">{row.message}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge tone={STATUS_TONE[row.status]}>{row.status}</Badge>
                  <FollowUpBadge nextFollowUpAt={row.nextFollowUpAt} />
                  <span className="text-xs text-muted-2">{new Date(row.createdAt).toLocaleString()}</span>
                </div>
              </div>
              <LeadFooter
                id={row.id}
                resource="contact-messages"
                status={row.status}
                internalNotes={row.internalNotes}
                nextFollowUpAt={row.nextFollowUpAt}
                activities={row.activities}
                onUpdated={load}
              />
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon={Mail} title="No contact messages" description="Try a different filter." />
      )}
    </div>
  );
}

export default function AdminInquiriesPage() {
  const [tab, setTab] = useState<"counselling" | "contact">("counselling");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Inquiries"
        description="Free counselling requests and contact messages submitted from the website."
      />

      <div className="flex w-fit items-center gap-1 rounded-lg bg-surface p-1">
        <button
          type="button"
          onClick={() => setTab("counselling")}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            tab === "counselling" ? "bg-white text-ink shadow-card" : "text-muted hover:text-ink"
          )}
        >
          <CalendarHeart className="h-4 w-4" aria-hidden />
          Counselling Requests
        </button>
        <button
          type="button"
          onClick={() => setTab("contact")}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            tab === "contact" ? "bg-white text-ink shadow-card" : "text-muted hover:text-ink"
          )}
        >
          <Inbox className="h-4 w-4" aria-hidden />
          Contact Messages
        </button>
      </div>

      {tab === "counselling" ? <CounsellingRequestsPanel /> : <ContactMessagesPanel />}
    </div>
  );
}
