"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth/SessionProvider";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { studentNav, mentorNav, studentBottomNav, mentorBottomNav } from "@/lib/content/dashboardNav";
import type { Role } from "@/lib/auth/session";

export function DashboardGate({ role, children }: { role: Role; children: ReactNode }) {
  const { session, ready } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    if (!session) {
      router.replace("/login");
      return;
    }
    if (session.role !== role) {
      router.replace(session.role === "mentor" ? "/mentor/dashboard" : "/student/dashboard");
    }
  }, [ready, session, role, router]);

  if (!ready || !session || session.role !== role) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-ink" aria-hidden />
      </div>
    );
  }

  const navItems = role === "student" ? studentNav : mentorNav;
  const bottomNavItems = role === "student" ? studentBottomNav : mentorBottomNav;

  return (
    <DashboardShell navItems={navItems} bottomNavItems={bottomNavItems}>
      {children}
    </DashboardShell>
  );
}
