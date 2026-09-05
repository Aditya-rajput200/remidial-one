"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Info } from "lucide-react";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useSession } from "@/lib/auth/SessionProvider";
import { dashboardPathForRole } from "@/lib/auth/session";

// A redirect target must be an internal path ("/foo"), never a
// protocol-relative or absolute URL — otherwise `?redirect=` could be used
// to send a logged-in user off-site.
function safeRedirect(value: string | null): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return null;
  return value;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, refreshSession } = useSession();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Landing here can mean a dashboard route just redirected us because the
  // session had expired or been revoked server-side. The SessionProvider's
  // client state doesn't know that yet (it's only updated by explicit
  // login/logout calls), so without this the header would keep showing the
  // "Dashboard" button — clicking it just bounces back here again. Re-sync
  // against the server so the header correctly falls back to "Login".
  useEffect(() => {
    refreshSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

    const redirectTo = safeRedirect(searchParams.get("redirect")) ?? dashboardPathForRole(result.session.role);
    router.push(redirectTo);
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

        <Link href="/forgot-password" className="-mt-2 self-end text-xs font-medium text-muted underline underline-offset-4 hover:text-ink">
          Forgot password?
        </Link>

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
