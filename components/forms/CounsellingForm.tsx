"use client";

import { useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { classBands } from "@/lib/content/classes";
import { cn } from "@/lib/cn";

type FormValues = {
  parentName: string;
  studentName: string;
  relation: string;
  email: string;
  phone: string;
  classBand: string;
  focusArea: string;
  preferredTime: string;
  message: string;
  // Honeypot — real visitors never see or fill this (see the visually-hidden
  // field below); a filled value marks the submission as a bot.
  website: string;
};

const initialValues: FormValues = {
  parentName: "",
  studentName: "",
  relation: "parent",
  email: "",
  phone: "",
  classBand: "",
  focusArea: "",
  preferredTime: "morning",
  message: "",
  website: "",
};

type Errors = Partial<Record<keyof FormValues, string>>;

const steps = [
  { key: "about", title: "Who is this for?" },
  { key: "contact", title: "How can we reach you?" },
  { key: "goals", title: "What should we focus on?" },
] as const;

function validateStep(step: number, values: FormValues): Errors {
  const errors: Errors = {};

  if (step === 0) {
    if (!values.parentName.trim()) errors.parentName = "Please enter a parent or guardian name.";
    if (!values.studentName.trim()) errors.studentName = "Please enter the student's name.";
  }

  if (step === 1) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      errors.email = "Enter a valid email address.";
    }
    if (!/^[\d+\-()\s]{7,}$/.test(values.phone.trim())) {
      errors.phone = "Enter a valid phone number.";
    }
  }

  if (step === 2) {
    if (!values.classBand) errors.classBand = "Please select a class.";
  }

  return errors;
}

export function CounsellingForm() {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const isLastStep = step === steps.length - 1;

  function update<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleNext(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const stepErrors = validateStep(step, values);
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length > 0) return;

    if (!isLastStep) {
      setStep((current) => current + 1);
      return;
    }

    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/counselling-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
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

  function handleBack() {
    setErrors({});
    setStep((current) => Math.max(0, current - 1));
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-white p-10 text-center">
        <CheckCircle2 className="h-10 w-10 text-lime-ink" aria-hidden />
        <h3 className="text-xl font-semibold text-ink">Counselling request received</h3>
        <p className="max-w-sm text-sm leading-relaxed text-muted">
          Thanks, {values.parentName || values.studentName}. Our team will reach out to{" "}
          {values.email} shortly to schedule a free counselling call for {values.studentName}.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-white p-6 sm:p-8">
      {/* Step progress */}
      <div className="mb-8 flex items-center gap-2">
        {steps.map((s, index) => (
          <div key={s.key} className="flex flex-1 items-center gap-2">
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors duration-200",
                index < step
                  ? "bg-ink text-lime"
                  : index === step
                    ? "bg-lime-soft text-ink"
                    : "bg-surface text-muted-2"
              )}
            >
              {index + 1}
            </div>
            {index < steps.length - 1 ? (
              <div className={cn("h-0.5 flex-1 rounded-full", index < step ? "bg-ink" : "bg-border")} />
            ) : null}
          </div>
        ))}
      </div>

      <h3 className="mb-6 text-lg font-semibold text-ink">{steps[step].title}</h3>

      <form onSubmit={handleNext} className="flex flex-col gap-5" noValidate>
        {/* Honeypot — hidden from real visitors (zero-size + overflow-hidden,
            not display:none, so it still fools bots that skip display:none
            fields specifically), never focusable. A filled value flags the
            submission as spam. absolute + h-0 w-0 keeps it from ever affecting
            page layout or scroll, regardless of what it's nested inside. */}
        <div className="absolute h-0 w-0 overflow-hidden" aria-hidden="true">
          <label htmlFor="website">Website</label>
          <input
            id="website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={values.website}
            onChange={(event) => update("website", event.target.value)}
          />
        </div>

        {step === 0 ? (
          <>
            <FormField label="Parent / guardian name" htmlFor="parentName" error={errors.parentName}>
              <Input
                id="parentName"
                name="parentName"
                placeholder="e.g. Anita Sharma"
                autoComplete="name"
                value={values.parentName}
                onChange={(event) => update("parentName", event.target.value)}
              />
            </FormField>

            <FormField label="Student's name" htmlFor="studentName" error={errors.studentName}>
              <Input
                id="studentName"
                name="studentName"
                placeholder="e.g. Rohan Sharma"
                value={values.studentName}
                onChange={(event) => update("studentName", event.target.value)}
              />
            </FormField>

            <FormField label="I am the" htmlFor="relation">
              <Select
                id="relation"
                name="relation"
                value={values.relation}
                onChange={(event) => update("relation", event.target.value)}
              >
                <option value="parent">Parent / Guardian</option>
                <option value="student">Student</option>
                <option value="other">Someone else</option>
              </Select>
            </FormField>
          </>
        ) : null}

        {step === 1 ? (
          <>
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
                placeholder="e.g. +91 98765 43210"
                autoComplete="tel"
                value={values.phone}
                onChange={(event) => update("phone", event.target.value)}
              />
            </FormField>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <FormField label="Student's class" htmlFor="classBand" error={errors.classBand}>
              <Select
                id="classBand"
                name="classBand"
                value={values.classBand}
                onChange={(event) => update("classBand", event.target.value)}
              >
                <option value="">Select a class</option>
                {classBands.map((band) => (
                  <option key={band.slug} value={band.slug}>
                    {band.name}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField
              label="Subject or area you'd like guidance on"
              htmlFor="focusArea"
              hint="e.g. Physics, exam preparation, or communication skills"
            >
              <Input
                id="focusArea"
                name="focusArea"
                placeholder="e.g. Mathematics"
                value={values.focusArea}
                onChange={(event) => update("focusArea", event.target.value)}
              />
            </FormField>

            <FormField label="Best time to call" htmlFor="preferredTime">
              <Select
                id="preferredTime"
                name="preferredTime"
                value={values.preferredTime}
                onChange={(event) => update("preferredTime", event.target.value)}
              >
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
              </Select>
            </FormField>

            <FormField label="Anything else we should know?" htmlFor="message" hint="Optional">
              <Textarea
                id="message"
                name="message"
                placeholder="Tell us more about the learning gaps or goals you'd like to discuss..."
                value={values.message}
                onChange={(event) => update("message", event.target.value)}
              />
            </FormField>
          </>
        ) : null}

        {submitError ? <p className="text-sm font-medium text-error">{submitError}</p> : null}

        <div className="mt-2 flex items-center justify-between gap-3">
          {step > 0 ? (
            <Button type="button" variant="ghost" size="md" onClick={handleBack} className="gap-1.5">
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Back
            </Button>
          ) : (
            <span />
          )}
          <Button type="submit" variant="primary-lime" size="md" className="gap-1.5" disabled={submitting}>
            {isLastStep ? (submitting ? "Submitting…" : "Book Free Counselling") : "Next"}
            {!isLastStep ? <ArrowRight className="h-4 w-4" aria-hidden /> : null}
          </Button>
        </div>
      </form>
    </div>
  );
}
