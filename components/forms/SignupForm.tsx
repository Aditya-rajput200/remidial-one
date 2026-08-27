"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { useSession } from "@/lib/auth/SessionProvider";
import { dashboardPathForRole } from "@/lib/auth/session";

export function SignupForm() {
  const router = useRouter();
  const { signup } = useSession();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const role = String(formData.get("role") ?? "student") as "student" | "mentor";

    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter your name and a valid email address.");
      return;
    }

    setSubmitting(true);
    const result = await signup({ name, email, password, role });
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
            <option value="mentor">Mentor</option>
          </Select>
        </FormField>
        <FormField label="Password" htmlFor="signup-password">
          <Input id="signup-password" name="password" type="password" placeholder="••••••••" autoComplete="new-password" required />
        </FormField>

        {error ? (
          <p className="text-xs font-medium text-error" role="alert">
            {error}
          </p>
        ) : null}

        <Button type="submit" variant="primary-lime" size="lg" className="w-full" disabled={submitting}>
          {submitting ? "Creating account…" : "Create Account"}
        </Button>
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
