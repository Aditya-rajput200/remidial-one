import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session.server";
import { toPublicUser } from "@/lib/auth/public-user";
import type { Session } from "@/lib/auth/session";
import { SessionProvider } from "@/lib/auth/SessionProvider";
import { DashboardGate } from "@/components/dashboard/DashboardGate";

// Resolves the session server-side (one DB query) so the dashboard renders
// with a known session on first paint instead of the client fetching
// /api/auth/me itself and blocking on a second round trip before the page's
// own data hook can even start. See app/admin/layout.tsx for the same
// pattern applied to /admin.
export default async function MentorLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/mentor/dashboard");
  if (user.role !== "MENTOR") redirect("/");

  const publicUser = toPublicUser(user);
  const initialSession: Session = {
    id: publicUser.id,
    name: publicUser.name,
    avatarUrl: publicUser.avatarUrl,
    email: publicUser.email,
    role: "mentor",
    status: publicUser.status,
    emailVerifiedAt: publicUser.emailVerifiedAt ? publicUser.emailVerifiedAt.toISOString() : null,
  };

  return (
    <SessionProvider initialSession={initialSession}>
      <DashboardGate role="mentor">{children}</DashboardGate>
    </SessionProvider>
  );
}
