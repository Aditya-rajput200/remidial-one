import type { Metadata } from "next";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session.server";
import { AdminShell } from "@/components/dashboard/AdminShell";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// Real server-side authorization, not the client-side DashboardGate the
// student/mentor dashboards use — the admin panel must not depend on
// client-trusted checks. Every admin API route additionally enforces its own
// specific permission via lib/auth/rbac.ts; this layout only gates coarse
// access to the /admin route tree.
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();

  if (!user) redirect("/login?redirect=/admin");
  // Every non-STUDENT/MENTOR/PARENT role gets into the coarse /admin tree —
  // CONTENT_MANAGER for the blog CMS, SUPPORT_AGENT for /admin/inquiries,
  // FINANCE_MANAGER/MODERATOR for their respective areas. Access to any
  // specific page or action within /admin is still bounded by the
  // fine-grained permission check each API route performs individually; this
  // layout only keeps ordinary end users out.
  if (["STUDENT", "MENTOR", "PARENT"].includes(user.role)) redirect("/");

  return <AdminShell>{children}</AdminShell>;
}
