"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2 } from "lucide-react";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

type Errors = Partial<Record<"name" | "email" | "message", string>>;

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [submitError, setSubmitError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const reason = String(formData.get("reason") ?? "student");
    const message = String(formData.get("message") ?? "").trim();
    // Honeypot — see the visually-hidden field below.
    const website = String(formData.get("website") ?? "");

    const nextErrors: Errors = {};
    if (!name) nextErrors.name = "Please enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextErrors.email = "Enter a valid email address.";
    if (!message) nextErrors.message = "Tell us a little about what you need.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/contact-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, reason, message, website }),
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
        <h3 className="text-xl font-semibold text-ink">Message received</h3>
        <p className="max-w-sm text-sm leading-relaxed text-muted">
          Thanks for reaching out. Our team will get back to you shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 rounded-2xl border border-border bg-white p-6 sm:p-8" noValidate>
      {/* Honeypot — hidden from real visitors, never focusable. A filled
          value flags the submission as spam (checked server-side). */}
      <div className="absolute h-0 w-0 overflow-hidden" aria-hidden="true">
        <label htmlFor="contact-website">Website</label>
        <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <FormField label="Full name" htmlFor="name" error={errors.name}>
        <Input id="name" name="name" placeholder="Your name" autoComplete="name" />
      </FormField>

      <FormField label="Email address" htmlFor="email" error={errors.email}>
        <Input id="email" name="email" type="email" placeholder="you@example.com" autoComplete="email" />
      </FormField>

      <FormField label="I'm reaching out as a" htmlFor="reason">
        <Select id="reason" name="reason" defaultValue="student">
          <option value="student">Student / Parent</option>
          <option value="mentor">Prospective Mentor</option>
          <option value="other">Something else</option>
        </Select>
      </FormField>

      <FormField label="Message" htmlFor="message" error={errors.message}>
        <Textarea id="message" name="message" placeholder="Tell us what you're looking for..." />
      </FormField>

      {submitError ? <p className="text-sm font-medium text-error">{submitError}</p> : null}

      <Button type="submit" variant="primary-lime" size="lg" className="w-full sm:w-auto" disabled={submitting}>
        {submitting ? "Sending…" : "Send Message"}
      </Button>
    </form>
  );
}
