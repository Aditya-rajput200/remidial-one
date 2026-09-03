"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, Download, FileText } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { OnboardingTimeline } from "@/components/dashboard/OnboardingTimeline";
import { ProgressBar } from "@/components/dashboard/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { FormField } from "@/components/ui/FormField";
import { cn } from "@/lib/cn";
import { DEMO_RATING_CATEGORIES, TECH_ASSESSMENT_ITEMS, TECH_ASSESSMENT_STATES } from "@/lib/teacher/constants";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Detail = any;

const TABS = ["Overview", "Personal", "Professional", "Documents", "Counseling", "Demo", "Tech", "Timeline"] as const;

function fmt(v: string | null | undefined) {
  return v ? new Date(v).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—";
}
function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border py-2 text-sm last:border-0">
      <span className="text-muted">{label}</span>
      <span className="text-right font-medium text-ink">{value || "—"}</span>
    </div>
  );
}

export default function TeacherOnboardingDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [data, setData] = useState<Detail | null>(null);
  const [activity, setActivity] = useState<any[]>([]);
  const [can, setCan] = useState<{ verify: boolean; manage: boolean }>({ verify: false, manage: false });
  const [tab, setTab] = useState<(typeof TABS)[number]>("Overview");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    fetch(`/api/teacher-onboarding/${id}`)
      .then((r) => r.json())
      .then((b) => {
        if (b.error) {
          setErr(b.error);
          return;
        }
        setData(b.applicant);
        setActivity(b.activity ?? []);
        setCan(b.can ?? { verify: false, manage: false });
      });
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function call(url: string, method: string, body?: unknown) {
    setBusy(true);
    setErr("");
    try {
      const res = await fetch(url, {
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j?.issues?.[0]?.message ?? j?.error ?? "Request failed.");
      load();
      return true;
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Request failed.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  if (err && !data) return <p className="text-sm font-medium text-error">{err}</p>;
  if (!data) return <p className="text-sm text-muted">Loading…</p>;

  const p = data;

  return (
    <div className="flex flex-col gap-6">
      <Link href="/admin/teacher-onboarding" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" aria-hidden /> All applicants
      </Link>

      <PageHeader title={p.user.name} description={p.user.email} />

      <div className="flex flex-wrap items-center gap-3">
        <Badge tone={p.status === "ACTIVE" ? "lime" : p.status === "REJECTED" ? "ink" : "outline"}>
          {p.status.replaceAll("_", " ")}
        </Badge>
        <div className="w-56">
          <ProgressBar label="Profile completion" value={p.profileCompletion.percent} />
        </div>
      </div>

      {err ? <p className="text-sm font-medium text-error">{err}</p> : null}

      {/* Verification action bar */}
      {can.verify && p.status !== "ACTIVE" && p.status !== "REJECTED" ? (
        <VerificationBar busy={busy} onAct={(action, reason) => call(`/api/teacher-onboarding/${id}/verify`, "POST", { action, reason })} />
      ) : null}

      <div className="flex gap-1 overflow-x-auto border-b border-border">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "whitespace-nowrap px-3 py-2 text-sm font-medium",
              tab === t ? "border-b-2 border-ink text-ink" : "text-muted hover:text-ink",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Overview" ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-white p-5">
            <h3 className="mb-3 text-sm font-semibold text-ink">Application</h3>
            <Row label="Form submitted" value={fmt(p.onboardingFormSubmittedAt)} />
            <Row label="Documents" value={p.documents.length} />
            <Row label="Counseling sessions" value={p.counselingSessions.length} />
            <Row label="Demos" value={p.demos.length} />
            <Row label="Tech assessment" value={p.techAssessment?.completedAt ? "Completed" : "Pending"} />
            <Row label="Lead source" value={p.lead?.source} />
          </div>
          <div className="rounded-2xl border border-border bg-white p-5">
            <h3 className="mb-3 text-sm font-semibold text-ink">Onboarding progress</h3>
            <OnboardingTimeline stages={p.timeline} showNotes />
          </div>
          {p.verificationEvents.length ? (
            <div className="rounded-2xl border border-border bg-white p-5 lg:col-span-2">
              <h3 className="mb-3 text-sm font-semibold text-ink">Verification history</h3>
              <ul className="flex flex-col gap-2 text-sm">
                {p.verificationEvents.map((e: any) => (
                  <li key={e.id} className="border-l-2 border-border pl-3">
                    <span className="font-medium text-ink">{e.action.replaceAll("_", " ")}</span> by {e.actorName} · {fmt(e.createdAt)}
                    {e.reason ? <p className="text-muted">{e.reason}</p> : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}

      {tab === "Personal" ? (
        <div className="rounded-2xl border border-border bg-white p-5">
          <Row label="Phone" value={p.personal.phone} />
          <Row label="WhatsApp" value={p.personal.whatsapp} />
          <Row label="Date of birth" value={p.personal.dateOfBirth ? new Date(p.personal.dateOfBirth).toLocaleDateString("en-IN") : null} />
          <Row label="Gender" value={p.personal.gender} />
          <Row label="Address" value={[p.personal.addressLine, p.personal.city, p.personal.state, p.personal.pincode].filter(Boolean).join(", ")} />
        </div>
      ) : null}

      {tab === "Professional" ? (
        <div className="rounded-2xl border border-border bg-white p-5">
          <Row label="Highest qualification" value={p.professional.highestQualification} />
          <Row label="Degree" value={p.professional.degree} />
          <Row label="Institution" value={p.professional.institution} />
          <Row label="Qualification year" value={p.professional.qualificationYear} />
          <Row label="Years of experience" value={p.professional.yearsExperience} />
          <Row label="Current occupation" value={p.professional.currentOccupation} />
          <Row label="Working preference" value={p.professional.employmentType ? p.professional.employmentType.replace("_", "-").toLowerCase() : null} />
          <Row label="Hours / week" value={p.professional.availabilityHoursPerWeek} />
          <Row label="Languages" value={(p.professional.languages ?? []).join(", ")} />
          <Row label="Boards" value={(p.professional.boards ?? []).join(", ")} />
          <Row label="Subjects" value={(p.professional.subjects ?? []).map((s: any) => s.name).join(", ")} />
          <Row label="Class levels" value={(p.professional.grades ?? []).map((g: any) => g.name).join(", ")} />
          <Row label="Preferred mode" value={p.preferences.preferredMode} />
          <Row label="Preferred days" value={(p.preferences.preferredDays ?? []).join(", ")} />
          <Row label="Expected rate" value={p.preferences.expectedRate ? `₹${p.preferences.expectedRate}/hr` : null} />
          {p.professional.bio ? <p className="mt-3 text-sm text-muted"><strong className="text-ink">Bio:</strong> {p.professional.bio}</p> : null}
          {p.professional.previousExperience ? <p className="mt-2 text-sm text-muted"><strong className="text-ink">Experience:</strong> {p.professional.previousExperience}</p> : null}
        </div>
      ) : null}

      {tab === "Documents" ? (
        <div className="rounded-2xl border border-border bg-white p-5">
          {p.documents.length === 0 ? (
            <p className="text-sm text-muted">No documents uploaded.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {p.documents.map((d: any) => (
                <li key={d.id} className="flex items-center justify-between gap-3 py-3">
                  <span className="flex items-center gap-2 text-sm text-ink">
                    <FileText className="h-4 w-4 text-muted" aria-hidden />
                    {d.type.replaceAll("_", " ")} <span className="text-muted">· {d.fileName}</span>
                  </span>
                  <span className="flex items-center gap-3">
                    <a href={d.downloadUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-lime-ink underline">
                      <Download className="h-3.5 w-3.5" aria-hidden /> View
                    </a>
                    {d.verifiedAt ? (
                      <Badge tone="lime">Verified</Badge>
                    ) : can.manage ? (
                      <Button type="button" variant="ghost" size="sm" disabled={busy}
                        onClick={() => call(`/api/teacher-onboarding/${id}/documents/${d.id}`, "PATCH", { verified: true })}>
                        Mark verified
                      </Button>
                    ) : (
                      <span className="text-xs text-muted">Unverified</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {can.manage ? (
            <div className="mt-4 border-t border-border pt-4">
              <StageButton busy={busy} label="Mark documents stage complete"
                onClick={() => call(`/api/teacher-onboarding/${id}/stages`, "PATCH", { key: "DOCUMENTS", state: "COMPLETED" })} />
            </div>
          ) : null}
        </div>
      ) : null}

      {tab === "Counseling" ? (
        <CounselingTab p={p} canManage={can.manage} busy={busy} call={call} id={id} />
      ) : null}

      {tab === "Demo" ? <DemoTab p={p} canManage={can.manage} busy={busy} call={call} id={id} /> : null}

      {tab === "Tech" ? <TechTab p={p} canManage={can.manage} busy={busy} call={call} id={id} /> : null}

      {tab === "Timeline" ? (
        <div className="rounded-2xl border border-border bg-white p-5">
          <ul className="flex flex-col gap-2 text-sm">
            {activity.length === 0 ? <li className="text-muted">No activity recorded.</li> : null}
            {activity.map((a) => (
              <li key={a.id} className="border-l-2 border-border pl-3">
                <span className="font-medium text-ink">{a.action.replaceAll(/_/g, " ").toLowerCase()}</span>
                <span className="text-muted"> · {a.actorName} · {fmt(a.createdAt)}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function StageButton({ busy, label, onClick }: { busy: boolean; label: string; onClick: () => void }) {
  return (
    <Button type="button" variant="ghost" size="sm" disabled={busy} onClick={onClick} className="gap-1.5">
      <Check className="h-4 w-4" aria-hidden /> {label}
    </Button>
  );
}

function VerificationBar({
  busy,
  onAct,
}: {
  busy: boolean;
  onAct: (action: string, reason?: string) => void;
}) {
  const [mode, setMode] = useState<null | "REJECT" | "SEND_BACK" | "REQUEST_INFO">(null);
  const [reason, setReason] = useState("");

  return (
    <div className="rounded-2xl border border-border bg-white p-5">
      <h3 className="mb-3 text-sm font-semibold text-ink">Super admin decision</h3>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="primary-lime" size="sm" disabled={busy} onClick={() => onAct("APPROVE")}>
          Approve &amp; activate
        </Button>
        <Button type="button" variant="ghost" size="sm" disabled={busy} onClick={() => setMode("SEND_BACK")}>
          Send back for correction
        </Button>
        <Button type="button" variant="ghost" size="sm" disabled={busy} onClick={() => setMode("REQUEST_INFO")}>
          Request more info
        </Button>
        <Button type="button" variant="ghost" size="sm" disabled={busy} onClick={() => setMode("REJECT")} className="text-error">
          Reject
        </Button>
      </div>
      {mode ? (
        <form
          className="mt-4 flex flex-col gap-2"
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            if (!reason.trim()) return;
            onAct(mode, reason);
            setMode(null);
            setReason("");
          }}
        >
          <FormField label={`Reason (required to ${mode.replaceAll("_", " ").toLowerCase()})`} htmlFor="v-reason">
            <Textarea id="v-reason" value={reason} onChange={(e) => setReason(e.target.value)} />
          </FormField>
          <div className="flex gap-2">
            <Button type="submit" variant="primary-lime" size="sm" disabled={busy || !reason.trim()}>
              Confirm
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setMode(null)}>
              Cancel
            </Button>
          </div>
        </form>
      ) : null}
    </div>
  );
}

function CounselingTab({ p, canManage, busy, call, id }: any) {
  const [f, setF] = useState<Record<string, string>>({});
  const set = (k: string, v: string) => setF((s) => ({ ...s, [k]: v }));

  async function submit(e: FormEvent, complete: boolean) {
    e.preventDefault();
    const ok = await call(`/api/teacher-onboarding/${id}/counseling`, "POST", {
      scheduledAt: f.scheduledAt || undefined,
      mode: f.mode || undefined,
      notes: f.notes || undefined,
      teacherExpectations: f.teacherExpectations || undefined,
      recommendation: f.recommendation || undefined,
      outcome: f.outcome || undefined,
      complete,
    });
    if (ok) setF({});
  }

  return (
    <div className="flex flex-col gap-4">
      {p.counselingSessions.map((c: any) => (
        <div key={c.id} className="rounded-2xl border border-border bg-white p-5 text-sm">
          <Row label="Scheduled" value={fmt(c.scheduledAt)} />
          <Row label="Mode" value={c.mode} />
          <Row label="Counselor" value={c.counselorName} />
          <Row label="Outcome" value={c.outcome} />
          <Row label="Completed" value={fmt(c.completedAt)} />
          {c.notes ? <p className="mt-2 text-muted">{c.notes}</p> : null}
          {c.recommendation ? <p className="mt-1 text-muted"><strong className="text-ink">Recommendation:</strong> {c.recommendation}</p> : null}
        </div>
      ))}
      {canManage ? (
        <form onSubmit={(e) => submit(e, false)} className="flex flex-col gap-3 rounded-2xl border border-border bg-white p-5">
          <h3 className="text-sm font-semibold text-ink">Record a counseling session</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label="Scheduled at" htmlFor="c-when"><Input id="c-when" type="datetime-local" value={f.scheduledAt ?? ""} onChange={(e) => set("scheduledAt", e.target.value)} /></FormField>
            <FormField label="Mode" htmlFor="c-mode"><Input id="c-mode" value={f.mode ?? ""} onChange={(e) => set("mode", e.target.value)} placeholder="Video / Phone" /></FormField>
          </div>
          <FormField label="Notes" htmlFor="c-notes"><Textarea id="c-notes" value={f.notes ?? ""} onChange={(e) => set("notes", e.target.value)} /></FormField>
          <FormField label="Teacher expectations" htmlFor="c-exp"><Textarea id="c-exp" value={f.teacherExpectations ?? ""} onChange={(e) => set("teacherExpectations", e.target.value)} /></FormField>
          <FormField label="Recommendation" htmlFor="c-rec"><Textarea id="c-rec" value={f.recommendation ?? ""} onChange={(e) => set("recommendation", e.target.value)} /></FormField>
          <FormField label="Outcome" htmlFor="c-out">
            <Select id="c-out" value={f.outcome ?? ""} onChange={(e) => set("outcome", e.target.value)}>
              <option value="">—</option>
              <option value="PASS">Pass</option>
              <option value="HOLD">Hold</option>
              <option value="REQUIRES_FOLLOW_UP">Requires follow-up</option>
              <option value="REJECT">Reject</option>
            </Select>
          </FormField>
          <div className="flex gap-2">
            <Button type="submit" variant="ghost" size="sm" disabled={busy}>Save</Button>
            <Button type="button" variant="primary-lime" size="sm" disabled={busy} onClick={(e) => submit(e as any, true)}>
              Save &amp; complete stage
            </Button>
          </div>
        </form>
      ) : null}
    </div>
  );
}

function DemoTab({ p, canManage, busy, call, id }: any) {
  const [f, setF] = useState<Record<string, string>>({});
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const set = (k: string, v: string) => setF((s) => ({ ...s, [k]: v }));

  async function schedule(e: FormEvent) {
    e.preventDefault();
    const ok = await call(`/api/teacher-onboarding/${id}/demo`, "POST", {
      scheduledAt: f.scheduledAt,
      subject: f.subject || undefined,
      topic: f.topic || undefined,
      gradeLabel: f.gradeLabel || undefined,
      durationMinutes: f.durationMinutes ? Number(f.durationMinutes) : undefined,
      meetingLink: f.meetingLink || undefined,
      notes: f.notes || undefined,
    });
    if (ok) setF({});
  }

  async function evaluate(demoId: string, result: string) {
    await call(`/api/teacher-onboarding/${id}/demo/${demoId}`, "PATCH", {
      result,
      ratings,
      evaluatorComments: f[`comment_${demoId}`] || undefined,
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {p.demos.map((d: any) => (
        <div key={d.id} className="rounded-2xl border border-border bg-white p-5 text-sm">
          <Row label="Scheduled" value={fmt(d.scheduledAt)} />
          <Row label="Subject / topic" value={[d.subject, d.topic].filter(Boolean).join(" · ")} />
          <Row label="Evaluator" value={d.evaluatorName} />
          <Row label="Result" value={d.result} />
          {d.meetingLink ? <Row label="Meeting" value={<a className="text-lime-ink underline" href={d.meetingLink} target="_blank" rel="noreferrer">Link</a>} /> : null}
          {d.evaluatorComments ? <p className="mt-2 text-muted">{d.evaluatorComments}</p> : null}
          {canManage && !d.result ? (
            <div className="mt-3 border-t border-border pt-3">
              <p className="mb-2 text-xs font-semibold text-ink">Score (1–5)</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {DEMO_RATING_CATEGORIES.map((cat) => (
                  <label key={cat.key} className="flex items-center justify-between gap-2 text-xs text-ink">
                    {cat.label}
                    <select
                      className="rounded border border-border px-1.5 py-0.5"
                      value={ratings[cat.key] ?? ""}
                      onChange={(e) => setRatings((r) => ({ ...r, [cat.key]: Number(e.target.value) }))}
                    >
                      <option value="">–</option>
                      {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </label>
                ))}
              </div>
              <Textarea
                className="mt-2"
                placeholder="Evaluator comments"
                value={f[`comment_${d.id}`] ?? ""}
                onChange={(e) => set(`comment_${d.id}`, e.target.value)}
              />
              <div className="mt-2 flex gap-2">
                <Button type="button" variant="primary-lime" size="sm" disabled={busy} onClick={() => evaluate(d.id, "PASS")}>Pass</Button>
                <Button type="button" variant="ghost" size="sm" disabled={busy} onClick={() => evaluate(d.id, "REDEMO_REQUIRED")}>Re-demo</Button>
                <Button type="button" variant="ghost" size="sm" disabled={busy} onClick={() => evaluate(d.id, "FAIL")} className="text-error">Fail</Button>
              </div>
            </div>
          ) : null}
        </div>
      ))}
      {canManage ? (
        <form onSubmit={schedule} className="flex flex-col gap-3 rounded-2xl border border-border bg-white p-5">
          <h3 className="text-sm font-semibold text-ink">Schedule a demo class</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label="Scheduled at" htmlFor="d-when"><Input id="d-when" type="datetime-local" value={f.scheduledAt ?? ""} onChange={(e) => set("scheduledAt", e.target.value)} /></FormField>
            <FormField label="Duration (min)" htmlFor="d-dur"><Input id="d-dur" type="number" value={f.durationMinutes ?? ""} onChange={(e) => set("durationMinutes", e.target.value)} /></FormField>
            <FormField label="Subject" htmlFor="d-sub"><Input id="d-sub" value={f.subject ?? ""} onChange={(e) => set("subject", e.target.value)} /></FormField>
            <FormField label="Topic" htmlFor="d-top"><Input id="d-top" value={f.topic ?? ""} onChange={(e) => set("topic", e.target.value)} /></FormField>
            <FormField label="Grade / class" htmlFor="d-grd"><Input id="d-grd" value={f.gradeLabel ?? ""} onChange={(e) => set("gradeLabel", e.target.value)} /></FormField>
            <FormField label="Meeting link" htmlFor="d-link"><Input id="d-link" value={f.meetingLink ?? ""} onChange={(e) => set("meetingLink", e.target.value)} /></FormField>
          </div>
          <Button type="submit" variant="primary-lime" size="sm" disabled={busy}>Schedule demo</Button>
        </form>
      ) : null}
    </div>
  );
}

function TechTab({ p, canManage, busy, call, id }: any) {
  const initial: Record<string, string> = {};
  const existing = (p.techAssessment?.items ?? {}) as Record<string, string>;
  for (const item of TECH_ASSESSMENT_ITEMS) initial[item.key] = existing[item.key] ?? "";
  const [items, setItems] = useState<Record<string, string>>(initial);
  const [notes, setNotes] = useState<string>(p.techAssessment?.adminNotes ?? "");

  async function save(complete: boolean) {
    const clean = Object.fromEntries(Object.entries(items).filter(([, v]) => v));
    await call(`/api/teacher-onboarding/${id}/tech-assessment`, "PUT", { items: clean, adminNotes: notes || undefined, complete });
  }

  return (
    <div className="rounded-2xl border border-border bg-white p-5">
      <h3 className="mb-3 text-sm font-semibold text-ink">Technical / accessory assessment</h3>
      <div className="grid gap-2 sm:grid-cols-2">
        {TECH_ASSESSMENT_ITEMS.map((item) => (
          <label key={item.key} className="flex items-center justify-between gap-2 text-sm text-ink">
            {item.label}
            <select
              className="rounded border border-border px-2 py-1 text-xs"
              disabled={!canManage}
              value={items[item.key] ?? ""}
              onChange={(e) => setItems((s) => ({ ...s, [item.key]: e.target.value }))}
            >
              <option value="">–</option>
              {TECH_ASSESSMENT_STATES.map((st) => <option key={st} value={st}>{st.replaceAll("_", " ")}</option>)}
            </select>
          </label>
        ))}
      </div>
      <Textarea className="mt-3" placeholder="Admin notes" disabled={!canManage} value={notes} onChange={(e) => setNotes(e.target.value)} />
      {p.techAssessment?.completedAt ? (
        <p className="mt-2 text-xs text-lime-ink">Completed {fmt(p.techAssessment.completedAt)}</p>
      ) : null}
      {canManage ? (
        <div className="mt-3 flex gap-2">
          <Button type="button" variant="ghost" size="sm" disabled={busy} onClick={() => save(false)}>Save</Button>
          <Button type="button" variant="primary-lime" size="sm" disabled={busy} onClick={() => save(true)}>Save &amp; complete stage</Button>
        </div>
      ) : null}
    </div>
  );
}
