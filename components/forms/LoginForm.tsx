"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Info } from "lucide-react";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useSession } from "@/lib/auth/SessionProvider";
import { dashboardPathForRole } from "@/lib/auth/session";

export function LoginForm() {
  const router = useRouter();
  const { login } = useSession();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    setSubmitting(true);
    const result = await login({ email, password });
    setSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    router.push(dashboardPathForRole(result.session.role));
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Welcome back</h2>
        <p className="text-sm text-muted">Log in to continue your learning journey.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
        <FormField label="Email address" htmlFor="login-email">
          <Input id="login-email" name="email" type="email" placeholder="you@example.com" autoComplete="email" required />
        </FormField>
        <FormField label="Password" htmlFor="login-password">
          <Input id="login-password" name="password" type="password" placeholder="••••••••" autoComplete="current-password" required />
        </FormField>

        <Button type="submit" variant="primary-lime" size="lg" className="w-full" disabled={submitting}>
          {submitting ? "Logging in…" : "Log In"}
        </Button>

        {error ? (
          <div className="flex items-start gap-2 rounded-xl bg-surface p-3 text-xs text-muted">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            <span>{error}</span>
          </div>
        ) : null}
      </form>

      <p className="text-center text-sm text-muted">
        New to Remedial One?{" "}
        <Link href="/signup" className="font-semibold text-ink underline underline-offset-4">
          Create an account
        </Link>
      </p>
    </div>
  );
}
