"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { X, Check, Clock3 } from "lucide-react";
import { useSession } from "@/lib/auth/SessionProvider";
import { useStudentData } from "@/lib/data/useStudentData";
import { subjects } from "@/lib/content/subjects";
import { classBands } from "@/lib/content/classes";
import { DEMO_MENTOR, type DashboardSession } from "@/lib/data/types";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/cn";

const DURATIONS = [30, 45, 60];

export default function BookMentorPage(props: PageProps<"/book/[mentor]">) {
  const { mentor } = use(props.params);
  const router = useRouter();
  const { session, ready } = useSession();
  const { addSession } = useStudentData();

  const [step, setStep] = useState(1);
  const [subjectSlug, setSubjectSlug] = useState(subjects[0].slug);
  const [classBand, setClassBand] = useState(classBands[0].name);
  const [date, setDate] = useState("");
  const [duration, setDuration] = useState(45);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (!session) router.replace("/login");
    else if (session.role !== "student") router.replace("/mentor/dashboard");
  }, [ready, session, router]);

  if (mentor !== DEMO_MENTOR.id) notFound();
  if (!ready || !session || session.role !== "student") return null;

  const subject = subjects.find((s) => s.slug === subjectSlug)!;

  function handleConfirm() {
    if (!date) return;
    const newSession: DashboardSession = {
      id: `s-${Date.now()}`,
      counterpartId: DEMO_MENTOR.id,
      counterpartName: DEMO_MENTOR.name,
      subjectSlug: subject.slug,
      subjectName: subject.name,
      classBandName: classBand,
      date: new Date(date).toISOString(),
      durationMinutes: duration,
      status: "upcoming",
      notes: "Newly booked session — say hello before you start!",
      isDemo: true,
    };
    addSession(newSession);
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
            <h1 className="text-3xl font-semibold tracking-tight text-ink">{DEMO_MENTOR.name}</h1>
            <p className="text-sm text-muted">{DEMO_MENTOR.role} · Demo profile</p>
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
                  {subjects.map((s) => (
                    <option key={s.slug} value={s.slug}>
                      {s.name}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Class" htmlFor="book-class">
                <Select id="book-class" value={classBand} onChange={(e) => setClassBand(e.target.value)}>
                  {classBands.map((band) => (
                    <option key={band.slug} value={band.name}>
                      {band.name}
                    </option>
                  ))}
                </Select>
              </FormField>
              <Button variant="primary-black" size="md" className="w-fit" onClick={() => setStep(2)}>
                Continue
              </Button>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="flex flex-col gap-5 rounded-2xl border border-border bg-white p-6">
              <h2 className="text-lg font-semibold text-ink">Pick a date, time & duration</h2>
              <FormField label="Date & time" htmlFor="book-date" hint="Shown in your local time zone.">
                <Input
                  id="book-date"
                  type="datetime-local"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </FormField>
              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-ink">Duration</span>
                <div className="flex gap-2">
                  {DURATIONS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDuration(d)}
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
                  <dd className="font-medium text-ink">{DEMO_MENTOR.name}</dd>
                </div>
                <div className="flex justify-between border-b border-border pb-3">
                  <dt className="text-muted">Subject</dt>
                  <dd className="font-medium text-ink">{subject.name}</dd>
                </div>
                <div className="flex justify-between border-b border-border pb-3">
                  <dt className="text-muted">Class</dt>
                  <dd className="font-medium text-ink">{classBand}</dd>
                </div>
                <div className="flex justify-between border-b border-border pb-3">
                  <dt className="text-muted">Date & time</dt>
                  <dd className="font-medium text-ink">
                    {date ? new Date(date).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—"}
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
                  Times are shown in your device&apos;s local time zone. You can reschedule or cancel free
                  of charge from your Sessions page.
                </span>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="md" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button variant="primary-lime" size="md" onClick={handleConfirm}>
                  Confirm Booking
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
