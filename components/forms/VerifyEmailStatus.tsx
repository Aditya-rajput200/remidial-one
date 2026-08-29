"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Info, Loader2 } from "lucide-react";

export function VerifyEmailStatus() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [state, setState] = useState<"loading" | "success" | "error">(token ? "loading" : "error");
  const [error, setError] = useState("This verification link is missing its token.");

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    (async () => {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (cancelled) return;
      if (response.ok) {
        setState("success");
        return;
      }
      const body = await response.json().catch(() => ({}));
      setError(body?.error ?? "This verification link is invalid or has expired.");
      setState("error");
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  if (state === "loading") {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted" aria-hidden />
        <p className="text-sm text-muted">Verifying your email…</p>
      </div>
    );
  }

  if (state === "success") {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <CheckCircle2 className="h-8 w-8 text-ink" aria-hidden />
        <h2 className="text-xl font-semibold tracking-tight text-ink">Email verified</h2>
        <p className="text-sm text-muted">Your account is now active.</p>
        <Link href="/login" className="text-sm font-semibold text-ink underline underline-offset-4">
          Continue to login
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <Info className="h-8 w-8 text-error" aria-hidden />
      <h2 className="text-xl font-semibold tracking-tight text-ink">Verification failed</h2>
      <p className="text-sm text-muted">{error}</p>
      <Link href="/login" className="text-sm font-semibold text-ink underline underline-offset-4">
        Back to login
      </Link>
    </div>
  );
}
