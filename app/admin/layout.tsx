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
  // CONTENT_MANAGER is let into the coarse /admin tree for the blog CMS
  // screens (app/admin/blog/**); their access to everything else here is
  // still bounded by the fine-grained cms.* permission checks each of those
  // API routes performs individually.
  if (!["ADMIN", "SUPER_ADMIN", "CONTENT_MANAGER"].includes(user.role)) redirect("/");

  return <AdminShell>{children}</AdminShell>;
}
