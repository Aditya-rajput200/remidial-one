"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Inbox,
  Search,
  Users,
  Flame,
  Clock,
  CheckCircle2,
  CalendarHeart,
  Mail as MailIcon,
  Phone as PhoneIcon,
  MessageCircle,
  AlertTriangle,
  UserRound,
} from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { FormField } from "@/components/ui/FormField";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonStatCards, SkeletonTable } from "@/components/dashboard/DashboardSkeletons";
import { cn } from "@/lib/cn";

type LeadStatus = "NEW" | "CONTACTED" | "SCHEDULED" | "CLOSED";
type Kind = "counselling" | "contact";

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

type CounsellingRow = {
  id: string;
  parentName: string;
  studentName: string;
  relation: string;
  email: string;
  phone: string;
  classBand: string | null;
  focusArea: string | null;
  preferredTime: string | null;
  status: LeadStatus;
  nextFollowUpAt: string | null;
  createdAt: string;
  _count: { activities: number };
};

type ContactRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  reason: string;
  status: LeadStatus;
  nextFollowUpAt: string | null;
  createdAt: string;
  _count: { activities: number };
};

type CounsellingDetail = CounsellingRow & { message: string | null; internalNotes: string | null; activities: LeadActivity[] };
type ContactDetail = ContactRow & { message: string; internalNotes: string | null; activities: LeadActivity[] };

// One shape the table renders regardless of which resource a row came from —
// `kind` is what routes clicks, patches, and activity posts back to the
// right API (/api/counselling-requests/:id or /api/contact-messages/:id).
type Row = {
  id: string;
  kind: Kind;
  name: string;
  subtitle: string;
  email: string;
  phone: string | null;
  status: LeadStatus;
  nextFollowUpAt: string | null;
  createdAt: string;
  activityCount: number;
};

const STATUS_OPTIONS: LeadStatus[] = ["NEW", "CONTACTED", "SCHEDULED", "CLOSED"];
const STATUS_TONE: Record<LeadStatus, "lime" | "ink" | "outline"> = {
  NEW: "lime",
  CONTACTED: "outline",
  SCHEDULED: "ink",
  CLOSED: "outline",
};

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

function initials(name: string) {
  return (name || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

function waLink(phone: string) {
  return `https://wa.me/${phone.replace(/[^\d]/g, "")}`;
}

function toLocalDateTimeInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function toRow(kind: Kind, item: CounsellingRow | ContactRow): Row {
  if (kind === "counselling") {
    const r = item as CounsellingRow;
    return {
      id: r.id,
      kind,
      name: r.studentName,
      subtitle: `${r.relation === "parent" ? "Parent" : r.relation === "student" ? "Self" : "Guardian"}: ${r.parentName}`,
      email: r.email,
      phone: r.phone,
      status: r.status,
      nextFollowUpAt: r.nextFollowUpAt,
      createdAt: r.createdAt,
      activityCount: r._count.activities,
    };
  }
  const r = item as ContactRow;
  return {
    id: r.id,
    kind,
    name: r.name,
    subtitle: r.reason === "other" ? "General inquiry" : "Student / Parent",
    email: r.email,
    phone: r.phone,
    status: r.status,
    nextFollowUpAt: r.nextFollowUpAt,
    createdAt: r.createdAt,
    activityCount: r._count.activities,
  };
}

function FollowUpBadge({ nextFollowUpAt }: { nextFollowUpAt: string | null }) {
  const [now] = useState(() => Date.now());
  if (!nextFollowUpAt) return <span className="text-xs text-muted-2">—</span>;
  const overdue = new Date(nextFollowUpAt).getTime() < now;
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-medium", overdue ? "text-error" : "text-muted")}>
      {overdue ? <AlertTriangle className="h-3 w-3" aria-hidden /> : <Clock className="h-3 w-3" aria-hidden />}
      {new Date(nextFollowUpAt).toLocaleDateString()}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Detail panel — quick-contact actions, the type-specific profile, and the
// shared status / notes / activity-timeline footer.
// ---------------------------------------------------------------------------

function DetailPanel({
  kind,
  detail,
  onUpdated,
}: {
  kind: Kind;
  detail: CounsellingDetail | ContactDetail;
  onUpdated: () => void;
}) {
  // Callers key this component by `${kind}:${detail.id}` so switching to a
  // different inquiry remounts it (fresh initial state below) instead of
  // needing an effect to resync local state from a changed `detail` prop.
  const [notes, setNotes] = useState(detail.internalNotes ?? "");
  const [savingStatus, setSavingStatus] = useState(false);

  const [outcome, setOutcome] = useState<LeadActivityOutcome>("CALL_CONNECTED");
  const [activityNote, setActivityNote] = useState("");
  const [nextFollowUp, setNextFollowUp] = useState(() => toLocalDateTimeInput(detail.nextFollowUpAt));
  const [activityStatus, setActivityStatus] = useState<LeadStatus | "">("");
  const [logging, setLogging] = useState(false);
  const [logError, setLogError] = useState("");

  const resource = kind === "counselling" ? "counselling-requests" : "contact-messages";

  async function patch(body: Record<string, unknown>) {
    return fetch(`/api/${resource}/${detail.id}`, {
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

  async function handleNotesBlur() {
    if (notes === (detail.internalNotes ?? "")) return;
    await patch({ internalNotes: notes });
    onUpdated();
  }

  async function handleLogActivity() {
    setLogging(true);
    setLogError("");
    try {
      const res = await fetch(`/api/${resource}/${detail.id}/activities`, {
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
      setActivityStatus("");
      onUpdated();
    } catch (err) {
      setLogError(err instanceof Error ? err.message : "Could not log this follow-up.");
    } finally {
      setLogging(false);
    }
  }

  const name = kind === "counselling" ? (detail as CounsellingDetail).studentName : (detail as ContactDetail).name;
  const phone = detail.phone;

  return (
    <aside className="flex flex-col gap-5 rounded-2xl border border-border bg-white p-5">
      {/* Header — avatar, name, status, type */}
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-lime-soft text-sm font-semibold text-ink">
          {initials(name)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <h3 className="truncate text-base font-semibold text-ink">{name}</h3>
            <Badge tone={STATUS_TONE[detail.status]}>{statusLabel(detail.status)}</Badge>
          </div>
          <p className="text-xs text-muted-2">
            {kind === "counselling" ? "Counselling request" : "Contact message"} · {new Date(detail.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-2">
        <a
          href={`mailto:${detail.email}`}
          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-ink px-3.5 text-xs font-semibold text-white transition hover:bg-ink-soft"
        >
          <MailIcon className="h-3.5 w-3.5" aria-hidden />
          Email
        </a>
        {phone ? (
          <>
            <a
              href={`tel:${phone}`}
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-brand-gradient px-3.5 text-xs font-semibold text-white transition hover:brightness-95"
            >
              <PhoneIcon className="h-3.5 w-3.5" aria-hidden />
              Call
            </a>
            <a
              href={waLink(phone)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#25D366] px-3.5 text-xs font-semibold text-white transition hover:brightness-95"
            >
              <MessageCircle className="h-3.5 w-3.5" aria-hidden />
              WhatsApp
            </a>
          </>
        ) : null}
      </div>

      {/* Contact + profile */}
      <div className="flex flex-col gap-1 rounded-xl bg-surface p-3 text-sm">
        <p className="text-muted">
          {detail.email}
          {phone ? ` · ${phone}` : ""}
        </p>
        {kind === "counselling" ? (
          <>
            {(() => {
              const c = detail as CounsellingDetail;
              return (
                <>
                  <p className="text-ink">
                    {c.relation === "parent" ? "Parent/Guardian" : c.relation === "student" ? "Contact" : "Relation"}: {c.parentName}
                  </p>
                  {c.classBand ? <p className="text-muted">Class: {c.classBand}</p> : null}
                  {c.focusArea ? <p className="text-muted">Focus area: {c.focusArea}</p> : null}
                  {c.preferredTime ? <p className="text-muted">Preferred call time: {c.preferredTime}</p> : null}
                </>
              );
            })()}
          </>
        ) : (
          <p className="text-ink">Reason: {(detail as ContactDetail).reason}</p>
        )}
        {detail.message ? <p className="mt-1 text-ink">{detail.message}</p> : null}
      </div>

      <FormField label="Status" htmlFor="d-status">
        <Select
          id="d-status"
          value={detail.status}
          disabled={savingStatus}
          onChange={(e) => handleStatusChange(e.target.value as LeadStatus)}
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {statusLabel(option)}
            </option>
          ))}
        </Select>
      </FormField>

      <FormField label="Internal notes" htmlFor="d-notes" hint="Not visible to the requester">
        <Textarea
          id="d-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={handleNotesBlur}
          className="min-h-[70px] text-sm"
        />
      </FormField>

      <div>
        <h4 className="mb-2 text-sm font-semibold text-ink">Activity timeline</h4>
        <div className="flex flex-col gap-2 rounded-xl bg-surface p-3">
          <div className="grid gap-2 sm:grid-cols-2">
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
          </div>
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
          <Textarea
            value={activityNote}
            onChange={(e) => setActivityNote(e.target.value)}
            placeholder="What happened? (optional)"
            className="min-h-[44px] text-sm"
          />
          {logError ? <p className="text-xs font-medium text-error">{logError}</p> : null}
          <button
            type="button"
            onClick={handleLogActivity}
            disabled={logging}
            className="w-fit rounded-full bg-ink px-4 py-2 text-xs font-semibold text-white transition hover:bg-ink-soft disabled:opacity-50"
          >
            {logging ? "Logging…" : "Log follow-up"}
          </button>
        </div>

        {detail.activities.length > 0 ? (
          <ul className="mt-3 flex flex-col gap-3">
            {detail.activities.map((activity) => (
              <li key={activity.id} className="border-l-2 border-border pl-3 text-xs">
                <p className="font-medium text-ink">{OUTCOME_LABEL[activity.outcome]}</p>
                {activity.note ? <p className="text-muted">{activity.note}</p> : null}
                <p className="text-muted-2">
                  {activity.author.name} · {new Date(activity.createdAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-xs text-muted-2">No follow-ups logged yet.</p>
        )}
      </div>
    </aside>
  );
}

// ---------------------------------------------------------------------------
// List page
// ---------------------------------------------------------------------------

export default function AdminInquiriesPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [kindFilter, setKindFilter] = useState<"" | Kind>("");
  const [dueOnly, setDueOnly] = useState(false);

  const [rows, setRows] = useState<Row[] | null>(null);
  const [stats, setStats] = useState<{ total: number; newCount: number; dueCount: number; closedCount: number } | null>(null);
  const [error, setError] = useState("");

  const [selected, setSelected] = useState<{ id: string; kind: Kind } | null>(null);
  const [detail, setDetail] = useState<CounsellingDetail | ContactDetail | null>(null);

  const fetchMerged = useCallback(async (params: URLSearchParams, kind: "" | Kind) => {
    const qs = params.toString();
    const [c, m] = await Promise.all([
      kind === "contact" ? Promise.resolve({ requests: [] }) : fetch(`/api/counselling-requests?${qs}`).then((r) => r.json()),
      kind === "counselling" ? Promise.resolve({ messages: [] }) : fetch(`/api/contact-messages?${qs}`).then((r) => r.json()),
    ]);
    const merged: Row[] = [
      ...((c.requests ?? []) as CounsellingRow[]).map((r) => toRow("counselling", r)),
      ...((m.messages ?? []) as ContactRow[]).map((r) => toRow("contact", r)),
    ];
    return merged;
  }, []);

  const loadTable = useCallback(() => {
    const params = new URLSearchParams({ limit: "100" });
    if (status) params.set("status", status);
    if (dueOnly) params.set("dueOnly", "1");
    if (q.trim()) params.set("q", q.trim());
    fetchMerged(params, kindFilter)
      .then((merged) => {
        merged.sort((a, b) =>
          dueOnly
            ? new Date(a.nextFollowUpAt ?? 0).getTime() - new Date(b.nextFollowUpAt ?? 0).getTime()
            : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setError("");
        setRows(merged);
      })
      .catch(() => setError("Could not load inquiries."));
  }, [status, dueOnly, q, kindFilter, fetchMerged]);

  // Unfiltered snapshot for the stat cards — the count of "New" or "Overdue"
  // inquiries shouldn't shift just because someone is searching the table.
  const loadStats = useCallback(() => {
    fetchMerged(new URLSearchParams({ limit: "100" }), "")
      .then((merged) => {
        const now = Date.now();
        setStats({
          total: merged.length,
          newCount: merged.filter((r) => r.status === "NEW").length,
          dueCount: merged.filter((r) => r.nextFollowUpAt && new Date(r.nextFollowUpAt).getTime() < now).length,
          closedCount: merged.filter((r) => r.status === "CLOSED").length,
        });
      })
      .catch(() => {});
  }, [fetchMerged]);

  useEffect(loadTable, [loadTable]);
  useEffect(loadStats, [loadStats]);

  const loadDetail = useCallback((id: string, kind: Kind) => {
    const resource = kind === "counselling" ? "counselling-requests" : "contact-messages";
    fetch(`/api/${resource}/${id}`)
      .then((r) => r.json())
      .then((body) => setDetail(kind === "counselling" ? body.request : body.message));
  }, []);

  useEffect(() => {
    // Clear immediately on every selection change — otherwise the panel can
    // render for one frame with the *new* selection's `kind` paired with the
    // *previous* selection's `detail` (fetch hasn't resolved yet), and
    // reading e.g. `.name` off a still-counselling-shaped object crashes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDetail(null);
    if (selected) loadDetail(selected.id, selected.kind);
  }, [selected, loadDetail]);

  function handleUpdated() {
    if (selected) loadDetail(selected.id, selected.kind);
    loadTable();
    loadStats();
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Inquiries"
        description="Counselling requests and contact messages from students and parents. Mentor inquiries go to Teacher Leads instead."
      />

      {stats ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Users} value={stats.total} label="Total inquiries" />
          <StatCard icon={Flame} value={stats.newCount} label="New" />
          <StatCard icon={Clock} value={stats.dueCount} label="Follow-ups overdue" />
          <StatCard icon={CheckCircle2} value={stats.closedCount} label="Closed" />
        </div>
      ) : (
        <SkeletonStatCards count={4} />
      )}

      <div className="flex flex-wrap items-end gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
          <Input placeholder="Search name, phone or email…" value={q} onChange={(e) => setQ(e.target.value)} className="w-64 pl-9" />
        </div>
        <div className="w-48">
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {statusLabel(option)}
              </option>
            ))}
          </Select>
        </div>
        <label className="flex h-11 items-center gap-2 text-sm text-ink">
          <input type="checkbox" checked={dueOnly} onChange={(e) => setDueOnly(e.target.checked)} />
          Follow-ups due only
        </label>
      </div>

      <div className="flex w-fit items-center gap-1 rounded-lg bg-surface p-1">
        {(
          [
            { value: "", label: "All", icon: Inbox },
            { value: "counselling", label: "Counselling Requests", icon: CalendarHeart },
            { value: "contact", label: "Contact Messages", icon: MailIcon },
          ] as const
        ).map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setKindFilter(tab.value)}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              kindFilter === tab.value ? "bg-white text-ink shadow-card" : "text-muted hover:text-ink"
            )}
          >
            <tab.icon className="h-4 w-4" aria-hidden />
            {tab.label}
          </button>
        ))}
      </div>

      {error ? <p className="text-sm font-medium text-error">{error}</p> : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <div>
          {rows === null ? (
            <SkeletonTable rows={6} cols={5} />
          ) : rows.length === 0 ? (
            <EmptyState icon={q ? Search : Inbox} title="No inquiries found" description="Try a different search or filter." />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-border bg-white">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-sm">
                  <thead className="bg-surface text-left text-xs uppercase tracking-wide text-muted">
                    <tr>
                      <th className="px-4 py-2.5">Name</th>
                      <th className="px-4 py-2.5">Type</th>
                      <th className="px-4 py-2.5">Contact</th>
                      <th className="px-4 py-2.5">Status</th>
                      <th className="px-4 py-2.5">Follow-up</th>
                      <th className="px-4 py-2.5">Added</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {rows.map((row) => {
                      const active = selected?.id === row.id && selected?.kind === row.kind;
                      return (
                        <tr
                          key={`${row.kind}-${row.id}`}
                          onClick={() => setSelected({ id: row.id, kind: row.kind })}
                          className={cn("cursor-pointer hover:bg-surface", active && "bg-surface")}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-lime-soft text-xs font-semibold text-ink">
                                {initials(row.name)}
                              </div>
                              <div className="min-w-0">
                                <div className="truncate font-medium text-ink">{row.name}</div>
                                <div className="truncate text-xs text-muted">{row.subtitle}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <Badge tone="outline" className="gap-1">
                              {row.kind === "counselling" ? (
                                <CalendarHeart className="h-3 w-3" aria-hidden />
                              ) : (
                                <MailIcon className="h-3 w-3" aria-hidden />
                              )}
                              {row.kind === "counselling" ? "Counselling" : "Contact"}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-muted">
                            <div className="truncate">{row.email}</div>
                            {row.phone ? <div className="text-xs text-muted-2">{row.phone}</div> : null}
                          </td>
                          <td className="px-4 py-3">
                            <Badge tone={STATUS_TONE[row.status]}>{statusLabel(row.status)}</Badge>
                          </td>
                          <td className="px-4 py-3">
                            <FollowUpBadge nextFollowUpAt={row.nextFollowUpAt} />
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-2">{new Date(row.createdAt).toLocaleDateString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {selected && detail ? (
          <DetailPanel key={`${selected.kind}:${selected.id}`} kind={selected.kind} detail={detail} onUpdated={handleUpdated} />
        ) : (
          <aside className="hidden flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted lg:flex">
            <UserRound className="h-6 w-6 text-muted-2" aria-hidden />
            Select an inquiry to see details.
          </aside>
        )}
      </div>
    </div>
  );
}
