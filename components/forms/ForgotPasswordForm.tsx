"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Info, MailCheck } from "lucide-react";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function ForgotPasswordForm() {
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();

    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        setError(body?.error ?? "Something went wrong. Please try again.");
        return;
      }
      setSent(true);
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-ink">
          <MailCheck className="h-5 w-5" aria-hidden />
          <h2 className="text-xl font-semibold tracking-tight">Check your inbox</h2>
        </div>
        <p className="text-sm text-muted">
          If an account exists for that email, we&apos;ve sent a link to reset your password.
        </p>
        <Link href="/login" className="text-sm font-semibold text-ink underline underline-offset-4">
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Forgot your password?</h2>
        <p className="text-sm text-muted">Enter your email and we&apos;ll send you a reset link.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
        <FormField label="Email address" htmlFor="forgot-email">
          <Input id="forgot-email" name="email" type="email" placeholder="you@example.com" autoComplete="email" required />
        </FormField>

        <Button type="submit" variant="primary-lime" size="lg" className="w-full" disabled={submitting}>
          {submitting ? "Sending…" : "Send reset link"}
        </Button>

        {error ? (
          <div className="flex items-start gap-2 rounded-xl bg-surface p-3 text-xs text-muted">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            <span>{error}</span>
          </div>
        ) : null}
      </form>

      <p className="text-center text-sm text-muted">
        Remembered it?{" "}
        <Link href="/login" className="font-semibold text-ink underline underline-offset-4">
          Log in
        </Link>
      </p>
    </div>
  );
}
