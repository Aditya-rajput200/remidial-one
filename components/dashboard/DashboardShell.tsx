import type { ReactNode } from "react";
import type { DashboardNavItem } from "@/lib/content/dashboardNav";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { MobileBottomNav } from "@/components/dashboard/MobileBottomNav";

export function DashboardShell({
  navItems,
  bottomNavItems,
  children,
}: {
  navItems: DashboardNavItem[];
  bottomNavItems: DashboardNavItem[];
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar items={navItems} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar items={navItems} />
        <main className="flex-1 px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pb-10">{children}</main>
      </div>
      <MobileBottomNav items={bottomNavItems} />
    </div>
  );
}
