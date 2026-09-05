"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2 } from "lucide-react";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { subjects } from "@/lib/content/subjects";
import { classBands } from "@/lib/content/classes";
import { cn } from "@/lib/cn";

type FormValues = {
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  city: string;
  state: string;
  message: string;
  // Honeypot — real visitors never see or fill this (see the visually-hidden
  // field below); a filled value marks the submission as a bot.
  website: string;
};

const initialValues: FormValues = {
  name: "",
  email: "",
  phone: "",
  whatsapp: "",
  city: "",
  state: "",
  message: "",
  website: "",
};

type Errors = Partial<Record<keyof FormValues, string>>;

function toggle(list: string[], setList: (v: string[]) => void, value: string) {
  setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
}

/**
 * Public "Become a Mentor" application — posts straight to a TeacherLead
 * (POST /api/teacher-leads/apply, unauthenticated, rate-limited by IP), so a
 * prospective mentor lands in the same admin pipeline a counselor would enter
 * them into by hand. This is the first, low-friction touchpoint — full
 * qualifications, documents, and availability come later in
 * TeacherOnboardingForm once the lead is converted.
 */
export function BecomeMentorApplicationForm() {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [subjectNames, setSubjectNames] = useState<string[]>([]);
  const [gradeNames, setGradeNames] = useState<string[]>([]);
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  function update<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: Errors = {};
    if (!values.name.trim()) nextErrors.name = "Please enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) nextErrors.email = "Enter a valid email address.";
    if (!/^[\d+\-()\s]{7,}$/.test(values.phone.trim())) nextErrors.phone = "Enter a valid phone number.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/teacher-leads/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          interestedSubjects: subjectNames,
          interestedGrades: gradeNames,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? "Something went wrong. Please try again.");
      }
      setSubmitted(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-white p-10 text-center">
        <CheckCircle2 className="h-10 w-10 text-lime-ink" aria-hidden />
        <h3 className="text-xl font-semibold text-ink">Application received</h3>
        <p className="max-w-sm text-sm leading-relaxed text-muted">
          Thanks, {values.name}. Our team will review your application and reach out to {values.email} with next
          steps.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 rounded-2xl border border-border bg-white p-6 sm:p-8"
      noValidate
    >
      {/* Honeypot — hidden from real visitors, never focusable. A filled
          value flags the submission as spam (checked server-side). */}
      <div className="absolute h-0 w-0 overflow-hidden" aria-hidden="true">
        <label htmlFor="mentor-website">Website</label>
        <input
          id="mentor-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values.website}
          onChange={(event) => update("website", event.target.value)}
        />
      </div>

      <FormField label="Full name" htmlFor="name" error={errors.name}>
        <Input
          id="name"
          name="name"
          placeholder="Your name"
          autoComplete="name"
          value={values.name}
          onChange={(event) => update("name", event.target.value)}
        />
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Email address" htmlFor="email" error={errors.email}>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            value={values.email}
            onChange={(event) => update("email", event.target.value)}
          />
        </FormField>

        <FormField label="Phone number" htmlFor="phone" error={errors.phone}>
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="+91 98765 43210"
            autoComplete="tel"
            value={values.phone}
            onChange={(event) => update("phone", event.target.value)}
          />
        </FormField>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="WhatsApp number" htmlFor="whatsapp" hint="Optional, if different from phone">
          <Input
            id="whatsapp"
            name="whatsapp"
            type="tel"
            placeholder="+91 98765 43210"
            value={values.whatsapp}
            onChange={(event) => update("whatsapp", event.target.value)}
          />
        </FormField>

        <FormField label="City" htmlFor="city" hint="Optional">
          <Input
            id="city"
            name="city"
            placeholder="e.g. Patna"
            autoComplete="address-level2"
            value={values.city}
            onChange={(event) => update("city", event.target.value)}
          />
        </FormField>
      </div>

      <FormField label="Subjects you can teach" htmlFor="subjects" hint="Optional — pick as many as apply">
        <div id="subjects" className="flex flex-wrap gap-2">
          {subjects.map((subject) => (
            <button
              key={subject.slug}
              type="button"
              onClick={() => toggle(subjectNames, setSubjectNames, subject.name)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm transition-colors",
                subjectNames.includes(subject.name)
                  ? "border-ink bg-ink text-white"
                  : "border-border text-muted hover:border-border-strong"
              )}
            >
              {subject.name}
            </button>
          ))}
        </div>
      </FormField>

      <FormField label="Classes you can teach" htmlFor="grades" hint="Optional — pick as many as apply">
        <div id="grades" className="flex flex-wrap gap-2">
          {classBands.map((band) => (
            <button
              key={band.slug}
              type="button"
              onClick={() => toggle(gradeNames, setGradeNames, band.name)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm transition-colors",
                gradeNames.includes(band.name)
                  ? "border-ink bg-ink text-white"
                  : "border-border text-muted hover:border-border-strong"
              )}
            >
              {band.name}
            </button>
          ))}
        </div>
      </FormField>

      <FormField label="Tell us about your teaching experience" htmlFor="message" hint="Optional">
        <Textarea
          id="message"
          name="message"
          placeholder="Qualifications, years of experience, subjects you specialize in..."
          value={values.message}
          onChange={(event) => update("message", event.target.value)}
        />
      </FormField>

      {submitError ? <p className="text-sm font-medium text-error">{submitError}</p> : null}

      <Button type="submit" variant="primary-lime" size="lg" className="w-full sm:w-auto" disabled={submitting}>
        {submitting ? "Submitting…" : "Submit Application"}
      </Button>
    </form>
  );
}
