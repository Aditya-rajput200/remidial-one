"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { toClientSession, type ApiRole, type Session } from "@/lib/auth/session";

type SignupInput = { name: string; email: string; password: string; role: "student" | "mentor" | "parent" };
type LoginInput = { email: string; password: string };
type AuthResult = { ok: true; session: Session } | { ok: false; error: string };

type SessionContextValue = {
  session: Session | null;
  ready: boolean;
  signup: (input: SignupInput) => Promise<AuthResult>;
  login: (input: LoginInput) => Promise<AuthResult>;
  logout: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

const CLIENT_TO_API_ROLE: Record<SignupInput["role"], ApiRole> = {
  student: "STUDENT",
  mentor: "MENTOR",
  parent: "PARENT",
};

async function parseAuthResponse(response: Response): Promise<AuthResult> {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      body?.issues?.[0]?.message ?? body?.error ?? "Something went wrong. Please try again.";
    return { ok: false, error: message };
  }
  return { ok: true, session: toClientSession(body.user) };
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((body) => {
        if (cancelled) return;
        setSession(body.user ? toClientSession(body.user) : null);
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const signup = useCallback(async (input: SignupInput): Promise<AuthResult> => {
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...input, role: CLIENT_TO_API_ROLE[input.role] }),
    });
    const result = await parseAuthResponse(response);
    if (result.ok) setSession(result.session);
    return result;
  }, []);

  const login = useCallback(async (input: LoginInput): Promise<AuthResult> => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const result = await parseAuthResponse(response);
    if (result.ok) setSession(result.session);
    return result;
  }, []);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setSession(null);
  }, []);

  return (
    <SessionContext.Provider value={{ session, ready, signup, login, logout }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}
