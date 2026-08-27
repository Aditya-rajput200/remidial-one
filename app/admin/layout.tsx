import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session.server";
import { AdminShell } from "@/components/dashboard/AdminShell";

// Real server-side authorization, not the client-side DashboardGate the
// student/mentor dashboards use — the admin panel must not depend on
// client-trusted checks. Every admin API route additionally enforces its own
// specific permission via lib/auth/rbac.ts; this layout only gates coarse
// access to the /admin route tree.
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();

  if (!user) redirect("/login?redirect=/admin");
  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") redirect("/");

  return <AdminShell>{children}</AdminShell>;
}
