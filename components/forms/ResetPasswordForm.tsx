"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Info } from "lucide-react";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "");
    const confirm = String(formData.get("confirmPassword") ?? "");

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(body?.error ?? "This reset link is invalid or has expired");
        return;
      }
      setDone(true);
      setTimeout(() => router.push("/login"), 1500);
    } finally {
      setSubmitting(false);
    }
  }

  if (!token) {
    return (
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Invalid link</h2>
        <p className="text-sm text-muted">This password reset link is missing its token. Request a new one.</p>
        <Link href="/forgot-password" className="text-sm font-semibold text-ink underline underline-offset-4">
          Request a new link
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-ink">
          <CheckCircle2 className="h-5 w-5" aria-hidden />
          <h2 className="text-xl font-semibold tracking-tight">Password updated</h2>
        </div>
        <p className="text-sm text-muted">Redirecting you to login…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Choose a new password</h2>
        <p className="text-sm text-muted">Must be at least 10 characters with a letter and a number.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
        <FormField label="New password" htmlFor="reset-password">
          <Input id="reset-password" name="password" type="password" placeholder="••••••••" autoComplete="new-password" required />
        </FormField>
        <FormField label="Confirm password" htmlFor="reset-confirm-password">
          <Input
            id="reset-confirm-password"
            name="confirmPassword"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            required
          />
        </FormField>

        <Button type="submit" variant="primary-lime" size="lg" className="w-full" disabled={submitting}>
          {submitting ? "Updating…" : "Update password"}
        </Button>

        {error ? (
          <div className="flex items-start gap-2 rounded-xl bg-surface p-3 text-xs text-muted">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            <span>{error}</span>
          </div>
        ) : null}
      </form>
    </div>
  );
}
