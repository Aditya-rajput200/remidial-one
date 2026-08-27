"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { X, Check, Clock3, AlertCircle } from "lucide-react";
import { useSession } from "@/lib/auth/SessionProvider";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/cn";

const DURATIONS = [30, 45, 60];

function toLocalInputValue(d: Date) {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function toLocalDateValue(d: Date) {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

type AvailabilitySlot = { dayOfWeek: number; startHour: number; endHour: number };

function formatHour(hour: number) {
  const period = hour < 12 ? "AM" : "PM";
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12}:00 ${period}`;
}

// The mentor's weekly availability is stored as naked hour numbers with no
// timezone (see prisma/schema.prisma MentorAvailability), and the booking
// API validates a submission by reading getUTCDay()/getUTCHours() off the
// resulting Date (see app/api/bookings/route.ts). There's no per-mentor
// timezone yet (a known follow-up, not fixed here), so both sides treat
// these numbers as a shared, timezone-less clock face: candidates are built
// with Date.UTC from the raw digits rather than the browser's local time,
// which keeps the slot a student sees exactly matching the hour the mentor
// set — and exactly what the server will accept — regardless of either
// party's actual timezone.
function availableHoursForDate(dateStr: string, durationMinutes: number, availability: AvailabilitySlot[]) {
  if (!dateStr || availability.length === 0) return [];
  const [year, month, day] = dateStr.split("-").map(Number);
  const now = new Date();

  const hours: { hour: number; iso: string; label: string }[] = [];
  for (let hour = 0; hour < 24; hour++) {
    const candidate = new Date(Date.UTC(year, month - 1, day, hour, 0, 0, 0));
    if (candidate <= now) continue;

    const dayOfWeek = candidate.getUTCDay();
    const fits = availability.some(
      (slot) => slot.dayOfWeek === dayOfWeek && hour >= slot.startHour && hour * 60 + durationMinutes <= slot.endHour * 60
    );
    if (!fits) continue;

    hours.push({ hour, iso: candidate.toISOString(), label: formatHour(hour) });
  }
  return hours;
}

type MentorDetail = {
  id: string;
  name: string;
  subjects: { slug: string; name: string }[];
  grades: { slug: string; name: string }[];
};

export default function BookMentorPage(props: PageProps<"/book/[mentor]">) {
  const { mentor: mentorId } = use(props.params);
  const router = useRouter();
  const { session, ready } = useSession();

  const [mentor, setMentor] = useState<MentorDetail | null | undefined>(undefined);
  const [availability, setAvailability] = useState<AvailabilitySlot[] | null>(null);

  const [step, setStep] = useState(1);
  const [subjectSlug, setSubjectSlug] = useState("");
  const [gradeLabel, setGradeLabel] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [date, setDate] = useState("");
  const [duration, setDuration] = useState(45);
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!ready) return;
    if (!session) router.replace("/login");
    else if (session.role !== "student") router.replace("/mentor/dashboard");
  }, [ready, session, router]);

  useEffect(() => {
    fetch(`/api/mentors/${mentorId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((body) => {
        const m = body?.mentor ?? null;
        setMentor(m);
        if (m) {
          setSubjectSlug(m.subjects[0]?.slug ?? "");
          setGradeLabel(m.grades[0]?.name ?? "");
        }
      });
    fetch(`/api/mentors/${mentorId}/availability`)
      .then((res) => (res.ok ? res.json() : null))
      .then((body) => setAvailability(body?.slots ?? []));
  }, [mentorId]);

  if (mentor === null) notFound();
  if (!ready || !session || session.role !== "student" || mentor === undefined) {
    return (
      <div className="mx-auto flex min-h-screen max-w-2xl flex-col gap-8 px-5 py-8 sm:px-8">
        <div className="flex items-center justify-between">
          <Logo />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-3.5 w-40" />
        </div>
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  const subject = mentor.subjects.find((s) => s.slug === subjectSlug);
  const now = new Date();
  const minDateTimeLocal = toLocalInputValue(now);
  const minDateValue = toLocalDateValue(now);
  const hasFixedAvailability = (availability?.length ?? 0) > 0;
  const availableHours = availability ? availableHoursForDate(selectedDate, duration, availability) : [];

  function selectDuration(d: number) {
    setDuration(d);
    setDate("");
  }

  function selectDate(value: string) {
    setSelectedDate(value);
    setDate("");
  }

  async function handleConfirm() {
    if (!date || !subject) return;
    setSubmitting(true);
    setError("");

    const response = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mentorId,
        subjectSlug: subject.slug,
        gradeLabel,
        scheduledAt: new Date(date).toISOString(),
        durationMinutes: duration,
      }),
    });

    setSubmitting(false);

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      setError(body?.error ?? "Could not book this session. Please try another time.");
      return;
    }

    setConfirmed(true);
    setTimeout(() => router.push("/student/sessions"), 1500);
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col gap-8 px-5 py-8 sm:px-8">
      <div className="flex items-center justify-between">
        <Logo />
        <button
          type="button"
          onClick={() => router.push("/student/mentors")}
          aria-label="Close booking"
          className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-surface"
        >
          <X className="h-5 w-5" aria-hidden />
        </button>
      </div>

      {confirmed ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-white p-10 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-lime-soft text-lime-ink">
            <Check className="h-7 w-7" aria-hidden />
          </div>
          <h1 className="text-2xl font-semibold text-ink">Session booked!</h1>
          <p className="text-sm text-muted">Taking you to your sessions...</p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-lime-ink">Booking with</p>
            <h1 className="text-3xl font-semibold tracking-tight text-ink">{mentor.name}</h1>
            {mentor.subjects.length > 0 ? (
              <p className="text-sm text-muted">{mentor.subjects.map((s) => s.name).join(", ")}</p>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className={cn("h-1.5 flex-1 rounded-full", s <= step ? "bg-lime" : "bg-border")} />
            ))}
          </div>

          {step === 1 ? (
            <div className="flex flex-col gap-5 rounded-2xl border border-border bg-white p-6">
              <h2 className="text-lg font-semibold text-ink">Choose subject & class</h2>
              <FormField label="Subject" htmlFor="book-subject">
                <Select id="book-subject" value={subjectSlug} onChange={(e) => setSubjectSlug(e.target.value)}>
                  {mentor.subjects.map((s) => (
                    <option key={s.slug} value={s.slug}>
                      {s.name}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Class" htmlFor="book-class">
                <Select id="book-class" value={gradeLabel} onChange={(e) => setGradeLabel(e.target.value)}>
                  {mentor.grades.map((band) => (
                    <option key={band.slug} value={band.name}>
                      {band.name}
                    </option>
                  ))}
                </Select>
              </FormField>
              <Button variant="primary-black" size="md" className="w-fit" onClick={() => setStep(2)} disabled={!subject}>
                Continue
              </Button>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="flex flex-col gap-5 rounded-2xl border border-border bg-white p-6">
              <h2 className="text-lg font-semibold text-ink">Pick a date, time & duration</h2>

              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-ink">Duration</span>
                <div className="flex gap-2">
                  {DURATIONS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => selectDuration(d)}
                      className={cn(
                        "rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-150",
                        duration === d ? "border-ink bg-ink text-white" : "border-border text-muted hover:border-ink/40"
                      )}
                    >
                      {d} min
                    </button>
                  ))}
                </div>
              </div>

              {availability === null ? (
                <div className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-ink">Date</span>
                  <Skeleton className="h-12 w-full rounded-xl" />
                </div>
              ) : hasFixedAvailability ? (
                <>
                  <FormField label="Date" htmlFor="book-date" hint="Only the mentor's available hours are shown below.">
                    <Input
                      id="book-date"
                      type="date"
                      value={selectedDate}
                      min={minDateValue}
                      onChange={(e) => selectDate(e.target.value)}
                    />
                  </FormField>
                  {selectedDate ? (
                    availableHours.length > 0 ? (
                      <div className="flex flex-col gap-1.5">
                        <span className="text-sm font-medium text-ink">Available times</span>
                        <div className="flex flex-wrap gap-2">
                          {availableHours.map(({ hour, iso, label }) => (
                            <button
                              key={hour}
                              type="button"
                              onClick={() => setDate(iso)}
                              className={cn(
                                "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors duration-150",
                                date === iso ? "border-ink bg-ink text-white" : "border-border text-muted hover:border-ink/40"
                              )}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2 rounded-xl bg-surface p-3 text-xs text-muted">
                        <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                        <span>No open slots on this date for a {duration}-minute session. Try another date.</span>
                      </div>
                    )
                  ) : null}
                </>
              ) : (
                <>
                  <FormField label="Date & time" htmlFor="book-date" hint="This mentor hasn't set fixed hours yet — shown in your local time zone.">
                    <Input
                      id="book-date"
                      type="datetime-local"
                      value={date}
                      min={minDateTimeLocal}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </FormField>
                </>
              )}

              <div className="flex gap-2">
                <Button variant="ghost" size="md" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button variant="primary-black" size="md" onClick={() => setStep(3)} disabled={!date}>
                  Continue
                </Button>
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="flex flex-col gap-5 rounded-2xl border border-border bg-white p-6">
              <h2 className="text-lg font-semibold text-ink">Confirm your session</h2>
              <dl className="flex flex-col gap-3 text-sm">
                <div className="flex justify-between border-b border-border pb-3">
                  <dt className="text-muted">Mentor</dt>
                  <dd className="font-medium text-ink">{mentor.name}</dd>
                </div>
                <div className="flex justify-between border-b border-border pb-3">
                  <dt className="text-muted">Subject</dt>
                  <dd className="font-medium text-ink">{subject?.name}</dd>
                </div>
                <div className="flex justify-between border-b border-border pb-3">
                  <dt className="text-muted">Class</dt>
                  <dd className="font-medium text-ink">{gradeLabel}</dd>
                </div>
                <div className="flex justify-between border-b border-border pb-3">
                  <dt className="text-muted">Date & time</dt>
                  <dd className="font-medium text-ink">
                    {date
                      ? new Date(date).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                          ...(hasFixedAvailability ? { timeZone: "UTC" } : {}),
                        })
                      : "—"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">Duration</dt>
                  <dd className="font-medium text-ink">{duration} minutes</dd>
                </div>
              </dl>
              <div className="flex items-start gap-2 rounded-xl bg-surface p-3 text-xs text-muted">
                <Clock3 className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                <span>
                  {hasFixedAvailability
                    ? "This time matches the mentor's posted hours exactly."
                    : "Times are shown in your device's local time zone."}{" "}
                  You can reschedule or cancel free of charge from your Sessions page.
                </span>
              </div>
              {error ? (
                <div className="flex items-start gap-2 rounded-xl bg-error-soft p-3 text-xs text-error">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                  <span>{error}</span>
                </div>
              ) : null}
              <div className="flex gap-2">
                <Button variant="ghost" size="md" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button variant="primary-lime" size="md" onClick={handleConfirm} disabled={submitting}>
                  {submitting ? "Booking…" : "Confirm Booking"}
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
