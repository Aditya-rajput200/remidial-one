"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { useSession } from "@/lib/auth/SessionProvider";

// Slim shell for teachers whose application isn't approved yet. No dashboard
// nav — the only place they can go is /mentor/onboarding. Anything else under
// /mentor/* bounces back here (server layout already blocks non-mentors).
export function MentorOnboardingShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { session, logout } = useSession();

  const onOnboarding = pathname === "/mentor/onboarding";

  useEffect(() => {
    if (!onOnboarding) router.replace("/mentor/onboarding");
  }, [onOnboarding, router]);

  return (
    <div className="min-h-screen bg-surface">
      <header className="flex h-16 items-center justify-between border-b border-border bg-white px-4 sm:px-6 lg:px-8">
        <Logo />
        <div className="flex items-center gap-4">
          <span className="hidden text-sm text-muted sm:inline">
            {session?.name ? `Signed in as ${session.name}` : null}
          </span>
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-muted hover:bg-surface"
          >
            <LogOut className="h-4 w-4" aria-hidden />
            Log out
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {onOnboarding ? children : null}
      </main>
    </div>
  );
}
