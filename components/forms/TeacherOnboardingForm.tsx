"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, FileText, RefreshCw, Trash2, UploadCloud } from "lucide-react";
import { OnboardingTimeline, type TimelineStage } from "@/components/dashboard/OnboardingTimeline";
import { ProgressBar } from "@/components/dashboard/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { SkeletonForm } from "@/components/dashboard/DashboardSkeletons";
import { missingRequiredApplicationFields, REQUIRED_DOC_TYPES, REQUIRED_DOC_LABELS } from "@/lib/teacher/constants";
import { cn } from "@/lib/cn";

const GENDERS = ["Male", "Female", "Other", "Prefer not to say"];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Fixed document slots — each gets its own upload button (Module 1 Step 2).
const DOC_SLOTS: { type: string; label: string; required: boolean; multiple?: boolean }[] = [
  { type: "AADHAAR", label: "Aadhaar card", required: true },
  { type: "PAN", label: "PAN card", required: true },
  { type: "PHOTO", label: "Profile photo", required: true },
  { type: "QUALIFICATION_CERTIFICATE", label: "Qualification certificate", required: false },
  { type: "EXPERIENCE_CERTIFICATE", label: "Experience certificate", required: false },
  { type: "OTHER", label: "Other documents", required: false, multiple: true },
];

const STEPS = ["Personal", "Academic", "Teaching", "Documents", "Review"] as const;

type Option = { slug: string; name: string };
type DocRow = { id: string; type: string; fileName: string; fileSize: number; verifiedAt: string | null };

type Onboarding = {
  id: string;
  status: string;
  onboardingFormSubmittedAt: string | null;
  rejectionReason: string | null;
  profileCompletion: { percent: number; missing: string[] };
  timeline: TimelineStage[];
  form: Record<string, unknown>;
  counseling: { id: string; scheduledAt: string | null; mode: string | null; outcome: string | null; completedAt: string | null }[];
  demos: { id: string; scheduledAt: string | null; subject: string | null; topic: string | null; meetingLink: string | null; result: string | null }[];
};

const STATUS_LABEL: Record<string, { text: string; tone: "lime" | "ink" | "outline" }> = {
  APPLICATION: { text: "Application started", tone: "outline" },
  UNDER_REVIEW: { text: "Under review", tone: "ink" },
  NEEDS_CORRECTION: { text: "Changes requested", tone: "ink" },
  VERIFIED: { text: "Verified", tone: "lime" },
  ACTIVE: { text: "Approved", tone: "lime" },
  REJECTED: { text: "Not approved", tone: "ink" },
};

function fmtDateTime(v: string | null) {
  return v ? new Date(v).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "";
}

/**
 * Step-wise teacher application. Used by the no-login /apply/<token> page and
 * the logged-in /mentor/onboarding page — only the endpoints differ.
 * Equipment / connection checks are NOT collected here; the admin records
 * those on the technical-assessment step after counseling.
 */
export function TeacherOnboardingForm({
  stateUrl,
  docsUrl,
  intro,
  showTimeline = true,
}: {
  stateUrl: string;
  docsUrl: string;
  intro?: string;
  showTimeline?: boolean;
}) {
  const [data, setData] = useState<Onboarding | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [subjects, setSubjects] = useState<Option[]>([]);
  const [grades, setGrades] = useState<Option[]>([]);
  const [docs, setDocs] = useState<DocRow[]>([]);
  const [form, setForm] = useState<Record<string, string>>({});
  const [subjectSlugs, setSubjectSlugs] = useState<string[]>([]);
  const [gradeSlugs, setGradeSlugs] = useState<string[]>([]);
  const [prefDays, setPrefDays] = useState<string[]>([]);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [uploadingType, setUploadingType] = useState<string | null>(null);
  const [justSubmitted, setJustSubmitted] = useState(false);
  const [viewDetails, setViewDetails] = useState(false);
  const pendingType = useRef<string>("");
  const fileRef = useRef<HTMLInputElement>(null);

  const loadDocs = useCallback(async () => {
    const res = await fetch(docsUrl);
    if (res.ok) setDocs((await res.json()).documents ?? []);
  }, [docsUrl]);

  const load = useCallback(async () => {
    const [o, s, g] = await Promise.all([
      fetch(stateUrl),
      fetch("/api/subjects").then((r) => r.json()),
      fetch("/api/grades").then((r) => r.json()),
    ]);
    setSubjects(s.subjects ?? []);
    setGrades(g.grades ?? []);
    if (!o.ok) {
      setNotFound(true);
      return;
    }
    const body = await o.json();
    if (body.onboarding) {
      const ob: Onboarding = body.onboarding;
      setData(ob);
      const f = ob.form as Record<string, unknown>;
      const str = (v: unknown) => (v == null ? "" : String(v));
      setForm({
        phone: str(f.phone),
        whatsapp: str(f.whatsapp),
        dateOfBirth: f.dateOfBirth ? String(f.dateOfBirth).slice(0, 10) : "",
        gender: str(f.gender),
        addressLine: str(f.addressLine),
        city: str(f.city),
        state: str(f.state),
        pincode: str(f.pincode),
        highestQualification: str(f.highestQualification),
        degree: str(f.degree),
        institution: str(f.institution),
        qualificationYear: str(f.qualificationYear),
        yearsExperience: str(f.yearsExperience),
        currentOccupation: str(f.currentOccupation),
        bio: str(f.bio),
        languages: Array.isArray(f.languages) ? (f.languages as string[]).join(", ") : "",
        boards: Array.isArray(f.boards) ? (f.boards as string[]).join(", ") : "",
        employmentType: str(f.employmentType),
        availabilityHoursPerWeek: str(f.availabilityHoursPerWeek),
        preferredMode: str(f.preferredMode),
        preferredStudentAgeGroup: str(f.preferredStudentAgeGroup),
        preferredClassDurationMin: str(f.preferredClassDurationMin),
        preferredHours: str(f.preferredHours),
        expectedRate: str(f.expectedRate),
      });
      setSubjectSlugs(Array.isArray(f.subjectSlugs) ? (f.subjectSlugs as string[]) : []);
      setGradeSlugs(Array.isArray(f.gradeSlugs) ? (f.gradeSlugs as string[]) : []);
      setPrefDays(Array.isArray(f.preferredDays) ? (f.preferredDays as string[]) : []);
    }
  }, [stateUrl]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    loadDocs();
  }, [load, loadDocs]);

  function set(key: string, value: string) {
    setForm((p) => ({ ...p, [key]: value }));
  }
  function toggle(list: string[], setList: (v: string[]) => void, v: string) {
    setList(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  }

  function buildPayload(doSubmit: boolean) {
    const num = (v: string) => (v.trim() === "" ? undefined : Number(v));
    const list = (v: string) => v.split(",").map((x) => x.trim()).filter(Boolean);
    return {
      phone: form.phone,
      whatsapp: form.whatsapp || undefined,
      dateOfBirth: form.dateOfBirth || undefined,
      gender: form.gender || undefined,
      addressLine: form.addressLine || undefined,
      city: form.city || undefined,
      state: form.state || undefined,
      pincode: form.pincode || undefined,
      highestQualification: form.highestQualification || undefined,
      degree: form.degree || undefined,
      institution: form.institution || undefined,
      qualificationYear: num(form.qualificationYear),
      yearsExperience: num(form.yearsExperience),
      currentOccupation: form.currentOccupation || undefined,
      bio: form.bio || undefined,
      languages: list(form.languages),
      boards: list(form.boards),
      employmentType: form.employmentType || undefined,
      availabilityHoursPerWeek: num(form.availabilityHoursPerWeek),
      preferredMode: form.preferredMode || undefined,
      preferredStudentAgeGroup: form.preferredStudentAgeGroup || undefined,
      preferredClassDurationMin: num(form.preferredClassDurationMin),
      preferredHours: form.preferredHours || undefined,
      expectedRate: num(form.expectedRate),
      subjectSlugs,
      gradeSlugs,
      preferredDays: prefDays,
      submit: doSubmit,
    };
  }

  async function save(doSubmit: boolean) {
    setSaving(true);
    setErr("");
    setMsg("");
    try {
      const res = await fetch(stateUrl, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload(doSubmit)),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.issues?.[0]?.message ?? body?.error ?? "Could not save.");
      if (doSubmit) setJustSubmitted(true);
      else setMsg("Progress saved.");
      await load();
      return true;
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not save.");
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function next() {
    setErr("");
    if (step === 0 && !/^[\d+\-()\s]{7,}$/.test(form.phone?.trim() ?? "")) {
      setErr("Enter a valid phone number to continue.");
      return;
    }
    // Persist progress silently on every step change so nothing is lost.
    await save(false);
    setMsg("");
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  }
  function back() {
    setErr("");
    setMsg("");
    setStep((s) => Math.max(0, s - 1));
  }

  function pickFile(type: string) {
    pendingType.current = type;
    fileRef.current?.click();
  }

  async function onFilePicked() {
    const file = fileRef.current?.files?.[0];
    const type = pendingType.current;
    if (!file || !type) return;
    setUploadingType(type);
    setErr("");
    try {
      // Single-slot types replace the existing file.
      const slot = DOC_SLOTS.find((d) => d.type === type);
      if (slot && !slot.multiple) {
        const existing = docs.find((d) => d.type === type && !d.verifiedAt);
        if (existing) await fetch(`${docsUrl}/${existing.id}`, { method: "DELETE" });
      }
      const fd = new FormData();
      fd.append("file", file);
      fd.append("type", type);
      fd.append("filename", file.name);
      const res = await fetch(docsUrl, { method: "POST", body: fd });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error ?? "Upload failed.");
      if (fileRef.current) fileRef.current.value = "";
      await loadDocs();
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploadingType(null);
    }
  }

  async function removeDoc(id: string) {
    const res = await fetch(`${docsUrl}/${id}`, { method: "DELETE" });
    if (res.ok) {
      await loadDocs();
      await load();
    }
  }

  if (notFound) {
    return (
      <div className="rounded-2xl border border-border bg-white p-8 text-center">
        <p className="text-sm font-semibold text-ink">This application link is no longer valid.</p>
        <p className="mt-1 text-sm text-muted">
          It may have expired, or your application has already been decided. Contact the Remedial One team for a new link.
        </p>
      </div>
    );
  }
  if (!data) return <SkeletonForm fields={8} />;

  const status = STATUS_LABEL[data.status] ?? { text: data.status, tone: "outline" as const };
  const locked = data.status === "REJECTED";
  const submittedReadonly = !!data.onboardingFormSubmittedAt && data.status !== "NEEDS_CORRECTION";
  const readOnly = locked || submittedReadonly;
  const scheduled = [...data.counseling, ...data.demos];

  const subjectNames = subjects.filter((s) => subjectSlugs.includes(s.slug)).map((s) => s.name);
  const gradeNames = grades.filter((g) => gradeSlugs.includes(g.slug)).map((g) => g.name);

  // Hard submit gate.
  const missingFields = missingRequiredApplicationFields({
    ...form,
    subjectsCount: subjectSlugs.length,
    gradesCount: gradeSlugs.length,
    daysCount: prefDays.length,
  });
  const missingDocs = REQUIRED_DOC_TYPES.filter((t) => !docs.some((d) => d.type === t)).map((t) => REQUIRED_DOC_LABELS[t]);
  const allMissing = [...missingFields, ...missingDocs];
  const canSubmit = allMissing.length === 0;

  // Success screen — right after submitting, or when revisiting a submitted app.
  if (justSubmitted || (submittedReadonly && !viewDetails)) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-white p-10 text-center">
        <CheckCircle2 className="h-12 w-12 text-lime-ink" aria-hidden />
        <h3 className="text-xl font-semibold text-ink">Application submitted</h3>
        <p className="max-w-sm text-sm leading-relaxed text-muted">
          Thanks — our team will review your details and reach out about the next steps (a counseling call and a
          short demo class).
        </p>
        <Button type="button" variant="ghost" size="sm" onClick={() => setViewDetails(true)}>
          View what you submitted
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {intro ? <p className="text-sm text-muted">{intro}</p> : null}

      <div className="flex flex-wrap items-center gap-3">
        <Badge tone={status.tone}>{status.text}</Badge>
        {submittedReadonly ? <span className="text-sm text-muted">Submitted — our team is reviewing it.</span> : null}
        <span className="text-sm text-muted">· {data.profileCompletion.percent}% complete</span>
      </div>

      {data.status === "NEEDS_CORRECTION" && data.rejectionReason ? (
        <div className="flex gap-3 rounded-2xl border border-border bg-white p-4">
          <AlertCircle className="h-5 w-5 shrink-0 text-error" aria-hidden />
          <div>
            <p className="text-sm font-semibold text-ink">Changes requested</p>
            <p className="mt-1 text-sm text-muted">{data.rejectionReason}</p>
          </div>
        </div>
      ) : null}
      {locked && data.rejectionReason ? (
        <div className="rounded-2xl border border-border bg-white p-4">
          <p className="text-sm font-semibold text-ink">Application not approved</p>
          <p className="mt-1 text-sm text-muted">{data.rejectionReason}</p>
        </div>
      ) : null}
      {scheduled.length ? (
        <div className="rounded-2xl border border-border bg-white p-4">
          <p className="text-sm font-semibold text-ink">Scheduled</p>
          <ul className="mt-1 flex flex-col gap-1 text-sm text-muted">
            {data.counseling.map((c) => (
              <li key={c.id}>
                Counseling call{c.mode ? ` · ${c.mode}` : ""} — {fmtDateTime(c.scheduledAt) || "time to be confirmed"}
                {c.completedAt ? " · completed" : ""}
              </li>
            ))}
            {data.demos.map((d) => (
              <li key={d.id}>
                Demo class{d.topic ? ` · ${d.topic}` : ""} — {fmtDateTime(d.scheduledAt) || "time to be confirmed"}
                {d.result ? ` · ${d.result}` : ""}
                {d.meetingLink && !d.result ? (
                  <>
                    {" "}
                    <a href={d.meetingLink} target="_blank" rel="noreferrer" className="font-medium text-lime-ink underline">
                      join link
                    </a>
                  </>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <input ref={fileRef} type="file" accept="application/pdf,image/*" hidden onChange={onFilePicked} />

      {readOnly ? (
        <ReviewCard form={form} subjectNames={subjectNames} gradeNames={gradeNames} docs={docs} />
      ) : (
        <div className="flex flex-col gap-5 rounded-2xl border border-border bg-white p-6">
          {/* Stepper */}
          <div className="flex items-center gap-2">
            {STEPS.map((label, i) => (
              <div key={label} className="flex flex-1 items-center gap-2 last:flex-none">
                <button
                  type="button"
                  onClick={() => i < step && setStep(i)}
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                    i < step ? "bg-ink text-lime" : i === step ? "bg-lime-soft text-ink" : "bg-surface text-muted-2",
                  )}
                >
                  {i < step ? <CheckCircle2 className="h-4 w-4" aria-hidden /> : i + 1}
                </button>
                {i < STEPS.length - 1 ? (
                  <div className={cn("h-0.5 flex-1 rounded-full", i < step ? "bg-ink" : "bg-border")} />
                ) : null}
              </div>
            ))}
          </div>
          <h3 className="text-base font-semibold text-ink">
            {step + 1}. {STEPS[step]}
            {STEPS[step] === "Academic" ? " & experience" : ""}
            {STEPS[step] === "Teaching" ? " preferences" : ""}
            {STEPS[step] === "Review" ? " & submit" : ""}
          </h3>

          {/* Step 1 — Personal */}
          {step === 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Phone" htmlFor="phone"><Input id="phone" value={form.phone} onChange={(e) => set("phone", e.target.value)} /></FormField>
              <FormField label="WhatsApp" htmlFor="whatsapp" hint="Optional"><Input id="whatsapp" value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} /></FormField>
              <FormField label="Date of birth" htmlFor="dob"><Input id="dob" type="date" value={form.dateOfBirth} onChange={(e) => set("dateOfBirth", e.target.value)} /></FormField>
              <FormField label="Gender" htmlFor="gender">
                <Select id="gender" value={form.gender} onChange={(e) => set("gender", e.target.value)}>
                  <option value="">Select</option>
                  {GENDERS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Address" htmlFor="addr"><Input id="addr" value={form.addressLine} onChange={(e) => set("addressLine", e.target.value)} /></FormField>
              <FormField label="City" htmlFor="city"><Input id="city" value={form.city} onChange={(e) => set("city", e.target.value)} /></FormField>
              <FormField label="State" htmlFor="state"><Input id="state" value={form.state} onChange={(e) => set("state", e.target.value)} /></FormField>
              <FormField label="Pincode" htmlFor="pin"><Input id="pin" value={form.pincode} onChange={(e) => set("pincode", e.target.value)} /></FormField>
            </div>
          ) : null}

          {/* Step 2 — Academic & experience (concise) */}
          {step === 1 ? (
            <div className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Highest qualification" htmlFor="hq" hint="e.g. M.Sc, B.Ed, PhD"><Input id="hq" value={form.highestQualification} onChange={(e) => set("highestQualification", e.target.value)} /></FormField>
                <FormField label="Subject / specialization" htmlFor="deg"><Input id="deg" value={form.degree} onChange={(e) => set("degree", e.target.value)} /></FormField>
                <FormField label="College / university" htmlFor="inst"><Input id="inst" value={form.institution} onChange={(e) => set("institution", e.target.value)} /></FormField>
                <FormField label="Year completed" htmlFor="qy"><Input id="qy" type="number" value={form.qualificationYear} onChange={(e) => set("qualificationYear", e.target.value)} /></FormField>
                <FormField label="Years of teaching experience" htmlFor="ye"><Input id="ye" type="number" value={form.yearsExperience} onChange={(e) => set("yearsExperience", e.target.value)} /></FormField>
                <FormField label="Current occupation" htmlFor="occ" hint="Optional"><Input id="occ" value={form.currentOccupation} onChange={(e) => set("currentOccupation", e.target.value)} /></FormField>
                <FormField label="Languages you teach in" htmlFor="lang" hint="Comma separated"><Input id="lang" value={form.languages} onChange={(e) => set("languages", e.target.value)} /></FormField>
                <FormField label="Boards" htmlFor="boards" hint="e.g. CBSE, ICSE"><Input id="boards" value={form.boards} onChange={(e) => set("boards", e.target.value)} /></FormField>
              </div>
              <FormField label="About you" htmlFor="bio" hint="A few lines on your background and how you teach">
                <Textarea id="bio" value={form.bio} onChange={(e) => set("bio", e.target.value)} />
              </FormField>
            </div>
          ) : null}

          {/* Step 3 — Teaching preferences */}
          {step === 2 ? (
            <div className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Full-time or part-time" htmlFor="emp">
                  <Select id="emp" value={form.employmentType} onChange={(e) => set("employmentType", e.target.value)}>
                    <option value="">Select</option>
                    <option value="FULL_TIME">Full-time</option>
                    <option value="PART_TIME">Part-time</option>
                  </Select>
                </FormField>
                <FormField label="Hours available per week" htmlFor="hpw"><Input id="hpw" type="number" value={form.availabilityHoursPerWeek} onChange={(e) => set("availabilityHoursPerWeek", e.target.value)} /></FormField>
                <FormField label="Preferred mode" htmlFor="mode">
                  <Select id="mode" value={form.preferredMode} onChange={(e) => set("preferredMode", e.target.value)}>
                    <option value="">Select</option>
                    <option value="ONLINE">Online</option>
                    <option value="OFFLINE">Offline</option>
                    <option value="BOTH">Both</option>
                  </Select>
                </FormField>
                <FormField label="Preferred student age group" htmlFor="age" hint="Optional"><Input id="age" value={form.preferredStudentAgeGroup} onChange={(e) => set("preferredStudentAgeGroup", e.target.value)} /></FormField>
                <FormField label="Preferred class duration (min)" htmlFor="dur"><Input id="dur" type="number" value={form.preferredClassDurationMin} onChange={(e) => set("preferredClassDurationMin", e.target.value)} /></FormField>
                <FormField label="Preferred teaching hours" htmlFor="hrs" hint="e.g. 4–9 PM"><Input id="hrs" value={form.preferredHours} onChange={(e) => set("preferredHours", e.target.value)} /></FormField>
                <FormField label="Expected rate (₹/hr)" htmlFor="rate" hint="Optional"><Input id="rate" type="number" value={form.expectedRate} onChange={(e) => set("expectedRate", e.target.value)} /></FormField>
              </div>
              <FormField label="Available days" htmlFor="days">
                <div className="flex flex-wrap gap-2">
                  {DAYS.map((d) => (
                    <button key={d} type="button" onClick={() => toggle(prefDays, setPrefDays, d)}
                      className={cn("rounded-full border px-3 py-1 text-sm", prefDays.includes(d) ? "border-ink bg-ink text-white" : "border-border text-muted")}>
                      {d}
                    </button>
                  ))}
                </div>
              </FormField>
              <FormField label="Subjects you can teach" htmlFor="subs">
                <div className="flex flex-wrap gap-2">
                  {subjects.map((s) => (
                    <button key={s.slug} type="button" onClick={() => toggle(subjectSlugs, setSubjectSlugs, s.slug)}
                      className={cn("rounded-full border px-3 py-1 text-sm", subjectSlugs.includes(s.slug) ? "border-ink bg-ink text-white" : "border-border text-muted")}>
                      {s.name}
                    </button>
                  ))}
                </div>
              </FormField>
              <FormField label="Class levels you're ready to teach" htmlFor="grds">
                <div className="flex flex-wrap gap-2">
                  {grades.map((g) => (
                    <button key={g.slug} type="button" onClick={() => toggle(gradeSlugs, setGradeSlugs, g.slug)}
                      className={cn("rounded-full border px-3 py-1 text-sm", gradeSlugs.includes(g.slug) ? "border-ink bg-ink text-white" : "border-border text-muted")}>
                      {g.name}
                    </button>
                  ))}
                </div>
              </FormField>
            </div>
          ) : null}

          {/* Step 4 — Documents */}
          {step === 3 ? (
            <div className="flex flex-col gap-3">
              <p className="text-xs text-muted">
                PDF or image, up to 10&nbsp;MB each. Aadhaar, PAN and a profile photo are required. Files are private
                and only visible to the Remedial One review team.
              </p>
              {DOC_SLOTS.map((slot) => {
                const slotDocs = docs.filter((d) => d.type === slot.type);
                const busy = uploadingType === slot.type;
                return (
                  <div key={slot.type} className="rounded-xl border border-border p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-medium text-ink">
                        {slot.label}
                        {slot.required ? <span className="text-error"> *</span> : null}
                      </span>
                      {(!slotDocs.length || slot.multiple) ? (
                        <Button type="button" variant="ghost" size="sm" disabled={busy} onClick={() => pickFile(slot.type)} className="gap-1.5">
                          <UploadCloud className="h-4 w-4" aria-hidden />
                          {busy ? "Uploading…" : slotDocs.length ? "Add another" : "Upload"}
                        </Button>
                      ) : null}
                    </div>
                    {slotDocs.length ? (
                      <ul className="mt-2 flex flex-col gap-1.5">
                        {slotDocs.map((d) => (
                          <li key={d.id} className="flex items-center justify-between gap-3 text-sm">
                            <span className="flex min-w-0 items-center gap-2 text-muted">
                              <FileText className="h-4 w-4 shrink-0" aria-hidden />
                              <span className="truncate">{d.fileName}</span>
                            </span>
                            <span className="flex shrink-0 items-center gap-2">
                              {d.verifiedAt ? (
                                <Badge tone="lime">Verified</Badge>
                              ) : (
                                <>
                                  {!slot.multiple ? (
                                    <button type="button" onClick={() => pickFile(slot.type)} className="text-muted hover:text-ink" aria-label="Replace">
                                      <RefreshCw className="h-4 w-4" aria-hidden />
                                    </button>
                                  ) : null}
                                  <button type="button" onClick={() => removeDoc(d.id)} className="text-muted hover:text-error" aria-label="Remove">
                                    <Trash2 className="h-4 w-4" aria-hidden />
                                  </button>
                                </>
                              )}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-1 text-xs text-muted-2">Not uploaded yet</p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : null}

          {/* Step 5 — Review */}
          {step === 4 ? (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-muted">Check everything below, then submit. You can go back to edit any section.</p>
              <ProgressBar label="Application completion" value={data.profileCompletion.percent} />
              {allMissing.length ? (
                <div className="flex gap-3 rounded-xl border border-error/30 bg-error-soft/40 p-3">
                  <AlertCircle className="h-5 w-5 shrink-0 text-error" aria-hidden />
                  <div>
                    <p className="text-sm font-semibold text-ink">Complete these before submitting</p>
                    <ul className="mt-1 flex flex-wrap gap-1.5">
                      {allMissing.map((m) => (
                        <li key={m} className="rounded-full bg-white px-2 py-0.5 text-[11px] text-error">{m}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : null}
              <ReviewCard form={form} subjectNames={subjectNames} gradeNames={gradeNames} docs={docs} onEdit={setStep} />
            </div>
          ) : null}

          {err ? <p className="text-sm font-medium text-error">{err}</p> : null}
          {msg ? (
            <p className="inline-flex items-center gap-1.5 text-sm font-medium text-lime-ink">
              <CheckCircle2 className="h-4 w-4" aria-hidden /> {msg}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
            <div>
              {step > 0 ? (
                <Button type="button" variant="ghost" size="md" onClick={back} className="gap-1.5">
                  <ArrowLeft className="h-4 w-4" aria-hidden /> Back
                </Button>
              ) : null}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" size="md" disabled={saving} onClick={() => save(false)}>
                {saving ? "Saving…" : "Save draft"}
              </Button>
              {step < STEPS.length - 1 ? (
                <Button type="button" variant="primary-lime" size="md" disabled={saving} onClick={next} className="gap-1.5">
                  Next <ArrowRight className="h-4 w-4" aria-hidden />
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="primary-lime"
                  size="md"
                  disabled={saving || !canSubmit}
                  onClick={() => save(true)}
                >
                  {saving ? "Submitting…" : "Submit application"}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {showTimeline ? (
        <div className="rounded-2xl border border-border bg-white p-6">
          <h3 className="mb-4 text-sm font-semibold text-ink">Onboarding progress</h3>
          <OnboardingTimeline stages={data.timeline} />
        </div>
      ) : null}
    </div>
  );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border py-1.5 text-sm last:border-0">
      <span className="text-muted">{label}</span>
      <span className="max-w-[60%] text-right font-medium text-ink">{value || <span className="text-muted-2">—</span>}</span>
    </div>
  );
}

function ReviewCard({
  form,
  subjectNames,
  gradeNames,
  docs,
  onEdit,
}: {
  form: Record<string, string>;
  subjectNames: string[];
  gradeNames: string[];
  docs: DocRow[];
  onEdit?: (step: number) => void;
}) {
  const section = (title: string, step: number, rows: [string, ReactNode][]) => (
    <div className="rounded-xl border border-border p-4">
      <div className="mb-2 flex items-center justify-between">
        <h4 className="text-sm font-semibold text-ink">{title}</h4>
        {onEdit ? (
          <button type="button" onClick={() => onEdit(step)} className="text-xs font-medium text-lime-ink hover:underline">
            Edit
          </button>
        ) : null}
      </div>
      {rows.map(([l, v]) => (
        <Row key={l} label={l} value={v} />
      ))}
    </div>
  );

  return (
    <div className="flex flex-col gap-3">
      {section("Personal", 0, [
        ["Phone", form.phone],
        ["WhatsApp", form.whatsapp],
        ["Date of birth", form.dateOfBirth],
        ["Gender", form.gender],
        ["Address", [form.addressLine, form.city, form.state, form.pincode].filter(Boolean).join(", ")],
      ])}
      {section("Academic & experience", 1, [
        ["Highest qualification", form.highestQualification],
        ["Subject / specialization", form.degree],
        ["Institution", form.institution],
        ["Year completed", form.qualificationYear],
        ["Years of experience", form.yearsExperience],
        ["Current occupation", form.currentOccupation],
        ["Languages", form.languages],
        ["Boards", form.boards],
        ["About", form.bio],
      ])}
      {section("Teaching preferences", 2, [
        ["Working preference", form.employmentType ? form.employmentType.replace("_", "-").toLowerCase() : ""],
        ["Hours / week", form.availabilityHoursPerWeek],
        ["Mode", form.preferredMode ? form.preferredMode.toLowerCase() : ""],
        ["Class duration", form.preferredClassDurationMin ? `${form.preferredClassDurationMin} min` : ""],
        ["Preferred hours", form.preferredHours],
        ["Expected rate", form.expectedRate ? `₹${form.expectedRate}/hr` : ""],
        ["Subjects", subjectNames.join(", ")],
        ["Class levels", gradeNames.join(", ")],
      ])}
      {section("Documents", 3, DOC_SLOTS.map((s) => {
        const n = docs.filter((d) => d.type === s.type).length;
        return [s.label, n ? `${n} file${n > 1 ? "s" : ""}` : s.required ? "Missing" : "—"] as [string, ReactNode];
      }))}
    </div>
  );
}
