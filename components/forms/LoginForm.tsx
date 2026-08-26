"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Info } from "lucide-react";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function LoginForm() {
  const [notice, setNotice] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(true);
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

        <Button type="submit" variant="primary-lime" size="lg" className="w-full">
          Log In
        </Button>

        {notice ? (
          <div className="flex items-start gap-2 rounded-xl bg-surface p-3 text-xs text-muted">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            <span>Account login isn&apos;t live yet — we&apos;re getting things ready.</span>
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
