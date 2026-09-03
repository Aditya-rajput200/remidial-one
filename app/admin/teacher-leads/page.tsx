"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { UserPlus, Search, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { FormField } from "@/components/ui/FormField";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonTable } from "@/components/dashboard/DashboardSkeletons";
import { TEACHER_LEAD_STATUSES } from "@/lib/validation/teacher";

type LeadRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  interestedSubjects: string[];
  nextFollowUpAt: string | null;
  createdAt: string;
  assignedTo: { id: string; name: string } | null;
  mentorProfile: { id: string } | null;
  _count: { activities: number };
};

type LeadDetail = LeadRow & {
  whatsapp: string | null;
  city: string | null;
  state: string | null;
  message: string | null;
  internalNotes: string | null;
  activities: { id: string; outcome: string; note: string | null; createdAt: string; nextFollowUpAt: string | null; author: { name: string } }[];
};

const OUTCOMES = [
  "CALL_NO_ANSWER",
  "CALL_CONNECTED",
  "EMAILED",
  "WHATSAPP_SENT",
  "SCHEDULED_CALL",
  "NOT_INTERESTED",
  "CONVERTED",
  "OTHER",
];

function statusTone(s: string): "lime" | "ink" | "outline" {
  if (["APPROVED", "ONBOARDED"].includes(s)) return "lime";
  if (["REJECTED", "INACTIVE"].includes(s)) return "ink";
  return "outline";
}

export default function AdminTeacherLeadsPage() {
  const [rows, setRows] = useState<LeadRow[] | null>(null);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dueOnly, setDueOnly] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<LeadDetail | null>(null);
  const [err, setErr] = useState("");

  // activity form
  const [outcome, setOutcome] = useState("CALL_CONNECTED");
  const [note, setNote] = useState("");
  const [followUp, setFollowUp] = useState("");
  const [busy, setBusy] = useState(false);
  const [appLink, setAppLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [nl, setNl] = useState({ name: "", email: "", phone: "", city: "", subjects: "", message: "" });

  const load = useCallback(() => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (statusFilter) params.set("status", statusFilter);
    if (dueOnly) params.set("dueOnly", "1");
    fetch(`/api/teacher-leads?${params}`)
      .then((r) => r.json())
      .then((b) => setRows(b.leads ?? []));
  }, [q, statusFilter, dueOnly]);

  useEffect(() => {
    load();
  }, [load]);

  // Deep link from the "new lead" email / notification (?id=…).
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("id");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (id) setSelectedId(id);
  }, []);

  const loadDetail = useCallback((id: string) => {
    fetch(`/api/teacher-leads/${id}`)
      .then((r) => r.json())
      .then((b) => setDetail(b.lead ?? null));
  }, []);

  useEffect(() => {
    if (selectedId) loadDetail(selectedId);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    else setDetail(null);
  }, [selectedId, loadDetail]);

  async function patch(body: Record<string, unknown>) {
    if (!selectedId) return;
    setErr("");
    const res = await fetch(`/api/teacher-leads/${selectedId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      setErr((await res.json().catch(() => ({}))).error ?? "Update failed.");
      return;
    }
    loadDetail(selectedId);
    load();
  }

  async function logActivity(e: FormEvent) {
    e.preventDefault();
    if (!selectedId) return;
    setBusy(true);
    setErr("");
    const res = await fetch(`/api/teacher-leads/${selectedId}/activities`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ outcome, note: note || undefined, nextFollowUpAt: followUp || undefined }),
    });
    setBusy(false);
    if (!res.ok) {
      setErr((await res.json().catch(() => ({}))).error ?? "Could not log activity.");
      return;
    }
    setNote("");
    setFollowUp("");
    loadDetail(selectedId);
    load();
  }

  async function createLead(e: FormEvent) {
    e.preventDefault();
    setErr("");
    if (!nl.name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nl.email) || nl.phone.trim().length < 7) {
      setErr("Enter a name, valid email, and phone number.");
      return;
    }
    setBusy(true);
    const res = await fetch("/api/teacher-leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: nl.name,
        email: nl.email,
        phone: nl.phone,
        city: nl.city || undefined,
        interestedSubjects: nl.subjects.split(",").map((s) => s.trim()).filter(Boolean),
        message: nl.message || undefined,
      }),
    });
    setBusy(false);
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setErr(body?.error ?? "Could not create the lead.");
      return;
    }
    setShowNew(false);
    setNl({ name: "", email: "", phone: "", city: "", subjects: "", message: "" });
    load();
    setSelectedId(body.id);
  }

  async function sendApplication() {
    if (!selectedId) return;
    setBusy(true);
    setErr("");
    setCopied(false);
    const res = await fetch(`/api/teacher-leads/${selectedId}/send-application`, { method: "POST" });
    setBusy(false);
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setErr(body.error ?? "Could not generate the application link.");
      return;
    }
    setAppLink(body.applicationUrl ?? "");
    loadDetail(selectedId);
    load();
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Teacher Leads" description="The pipeline from first contact to a converted applicant." />

      <div className="flex flex-wrap items-end gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
          <Input placeholder="Name, email, phone" value={q} onChange={(e) => setQ(e.target.value)} className="w-64 pl-9" />
        </div>
        <div className="w-52">
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            {TEACHER_LEAD_STATUSES.map((s) => (
              <option key={s} value={s}>{s.replaceAll("_", " ")}</option>
            ))}
          </Select>
        </div>
        <label className="flex items-center gap-2 text-sm text-muted">
          <input type="checkbox" checked={dueOnly} onChange={(e) => setDueOnly(e.target.checked)} />
          Follow-ups due
        </label>
        <Button type="button" variant="primary-lime" size="sm" onClick={() => setShowNew((v) => !v)} className="ml-auto">
          {showNew ? "Close" : "New lead"}
        </Button>
      </div>

      {showNew ? (
        <form onSubmit={createLead} className="grid gap-3 rounded-2xl border border-border bg-white p-4 sm:grid-cols-2">
          <FormField label="Name" htmlFor="nl-name"><Input id="nl-name" value={nl.name} onChange={(e) => setNl({ ...nl, name: e.target.value })} /></FormField>
          <FormField label="Email" htmlFor="nl-email"><Input id="nl-email" type="email" value={nl.email} onChange={(e) => setNl({ ...nl, email: e.target.value })} /></FormField>
          <FormField label="Phone" htmlFor="nl-phone"><Input id="nl-phone" value={nl.phone} onChange={(e) => setNl({ ...nl, phone: e.target.value })} /></FormField>
          <FormField label="City" htmlFor="nl-city" hint="Optional"><Input id="nl-city" value={nl.city} onChange={(e) => setNl({ ...nl, city: e.target.value })} /></FormField>
          <FormField label="Subjects" htmlFor="nl-sub" hint="Comma separated"><Input id="nl-sub" value={nl.subjects} onChange={(e) => setNl({ ...nl, subjects: e.target.value })} /></FormField>
          <FormField label="Note" htmlFor="nl-note" hint="Optional"><Input id="nl-note" value={nl.message} onChange={(e) => setNl({ ...nl, message: e.target.value })} /></FormField>
          <div className="sm:col-span-2">
            <Button type="submit" variant="primary-lime" size="sm" disabled={busy}>{busy ? "Saving…" : "Create lead"}</Button>
          </div>
        </form>
      ) : null}

      {err ? <p className="text-sm font-medium text-error">{err}</p> : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <div>
          {rows === null ? (
            <SkeletonTable rows={6} cols={4} />
          ) : rows.length === 0 ? (
            <EmptyState icon={UserPlus} title="No leads" description="Use “New lead” to add a teacher you've spoken with." />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-border bg-white">
              <table className="w-full text-sm">
                <thead className="bg-surface text-left text-xs uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-4 py-2.5">Name</th>
                    <th className="px-4 py-2.5">Status</th>
                    <th className="px-4 py-2.5">Owner</th>
                    <th className="px-4 py-2.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map((r) => (
                    <tr
                      key={r.id}
                      onClick={() => setSelectedId(r.id)}
                      className={`cursor-pointer hover:bg-surface ${selectedId === r.id ? "bg-surface" : ""}`}
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-ink">{r.name}</div>
                        <div className="text-xs text-muted">{r.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={statusTone(r.status)}>{r.status.replaceAll("_", " ")}</Badge>
                      </td>
                      <td className="px-4 py-3 text-muted">{r.assignedTo?.name ?? "—"}</td>
                      <td className="px-4 py-3 text-right text-muted">
                        {r.mentorProfile ? <span className="text-xs text-lime-ink">Converted</span> : <ArrowRight className="ml-auto h-4 w-4" aria-hidden />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {detail ? (
          <aside className="flex flex-col gap-5 rounded-2xl border border-border bg-white p-5">
            <div>
              <h3 className="text-base font-semibold text-ink">{detail.name}</h3>
              <p className="text-sm text-muted">{detail.email} · {detail.phone}</p>
              {detail.whatsapp ? <p className="text-sm text-muted">WhatsApp: {detail.whatsapp}</p> : null}
              {detail.city || detail.state ? <p className="text-sm text-muted">{[detail.city, detail.state].filter(Boolean).join(", ")}</p> : null}
              {detail.interestedSubjects.length ? (
                <p className="mt-1 text-xs text-muted">Subjects: {detail.interestedSubjects.join(", ")}</p>
              ) : null}
              {detail.message ? <p className="mt-2 rounded-lg bg-surface p-2 text-xs text-muted">{detail.message}</p> : null}
            </div>

            <FormField label="Status" htmlFor="d-status">
              <Select id="d-status" value={detail.status} onChange={(e) => patch({ status: e.target.value })}>
                {TEACHER_LEAD_STATUSES.map((s) => (
                  <option key={s} value={s}>{s.replaceAll("_", " ")}</option>
                ))}
              </Select>
            </FormField>

            <FormField label="Internal notes" htmlFor="d-notes">
              <Textarea
                id="d-notes"
                defaultValue={detail.internalNotes ?? ""}
                onBlur={(e) => {
                  if (e.target.value !== (detail.internalNotes ?? "")) patch({ internalNotes: e.target.value });
                }}
              />
            </FormField>

            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="primary-lime" size="sm" disabled={busy} onClick={sendApplication}>
                  {busy ? "Working…" : detail.mentorProfile ? "Regenerate application link" : "Send application form"}
                </Button>
                {detail.mentorProfile ? (
                  <Button href={`/admin/teacher-onboarding/${detail.mentorProfile.id}`} variant="ghost" size="sm">
                    Open onboarding
                  </Button>
                ) : null}
              </div>
              {appLink ? (
                <div className="flex items-center gap-2 rounded-lg bg-surface p-2">
                  <input
                    readOnly
                    value={appLink}
                    onFocus={(e) => e.currentTarget.select()}
                    className="min-w-0 flex-1 bg-transparent text-xs text-muted outline-none"
                  />
                  <button
                    type="button"
                    className="shrink-0 text-xs font-semibold text-lime-ink hover:underline"
                    onClick={() => {
                      navigator.clipboard?.writeText(appLink).then(() => {
                        setCopied(true);
                        setTimeout(() => setCopied(false), 1500);
                      });
                    }}
                  >
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
              ) : (
                <p className="text-xs text-muted">
                  Generates a prefilled no-login link the mentor uses to fill their full application. It&apos;s also emailed to them.
                </p>
              )}
            </div>

            <div>
              <h4 className="mb-2 text-sm font-semibold text-ink">Activity</h4>
              <form onSubmit={logActivity} className="flex flex-col gap-2 rounded-xl bg-surface p-3">
                <Select value={outcome} onChange={(e) => setOutcome(e.target.value)}>
                  {OUTCOMES.map((o) => (
                    <option key={o} value={o}>{o.replaceAll("_", " ")}</option>
                  ))}
                </Select>
                <Input placeholder="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
                <label className="text-xs text-muted">Next follow-up</label>
                <Input type="datetime-local" value={followUp} onChange={(e) => setFollowUp(e.target.value)} />
                <Button type="submit" variant="ghost" size="sm" disabled={busy}>Log activity</Button>
              </form>
              <ul className="mt-3 flex flex-col gap-2">
                {detail.activities.map((a) => (
                  <li key={a.id} className="border-l-2 border-border pl-3 text-xs">
                    <p className="font-medium text-ink">{a.outcome.replaceAll("_", " ")}</p>
                    {a.note ? <p className="text-muted">{a.note}</p> : null}
                    <p className="text-muted-2">
                      {a.author.name} · {new Date(a.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        ) : (
          <aside className="hidden rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted lg:block">
            Select a lead to see details.
          </aside>
        )}
      </div>
    </div>
  );
}
