"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Info } from "lucide-react";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

export function SignupForm() {
  const [notice, setNotice] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(true);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Create your account</h2>
        <p className="text-sm text-muted">Start your personalized learning journey.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
        <FormField label="Full name" htmlFor="signup-name">
          <Input id="signup-name" name="name" placeholder="Your name" autoComplete="name" required />
        </FormField>
        <FormField label="Email address" htmlFor="signup-email">
          <Input id="signup-email" name="email" type="email" placeholder="you@example.com" autoComplete="email" required />
        </FormField>
        <FormField label="I am a" htmlFor="signup-role">
          <Select id="signup-role" name="role" defaultValue="student">
            <option value="student">Student</option>
            <option value="parent">Parent</option>
          </Select>
        </FormField>
        <FormField label="Password" htmlFor="signup-password">
          <Input id="signup-password" name="password" type="password" placeholder="••••••••" autoComplete="new-password" required />
        </FormField>

        <Button type="submit" variant="primary-lime" size="lg" className="w-full">
          Create Account
        </Button>

        {notice ? (
          <div className="flex items-start gap-2 rounded-xl bg-surface p-3 text-xs text-muted">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            <span>Sign-up isn&apos;t live yet — we&apos;re getting things ready.</span>
          </div>
        ) : null}
      </form>

      <p className="text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-ink underline underline-offset-4">
          Log in
        </Link>
      </p>
    </div>
  );
}
