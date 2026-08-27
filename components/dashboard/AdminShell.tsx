"use client";

import type { ReactNode } from "react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { adminNav, adminBottomNav } from "@/lib/content/dashboardNav";

// The nav config carries Lucide icon component references, which aren't
// serializable across the server/client boundary. Importing it here (client
// side) instead of in the server-component admin layout avoids passing
// non-plain-object props from a Server Component into a Client Component.
export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <DashboardShell navItems={adminNav} bottomNavItems={adminBottomNav}>
      {children}
    </DashboardShell>
  );
}
