"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import type { DashboardNavItem } from "@/lib/content/dashboardNav";
import { Logo } from "@/components/layout/Logo";
import { useSession } from "@/lib/auth/SessionProvider";
import { cn } from "@/lib/cn";

export function Sidebar({ items }: { items: DashboardNavItem[] }) {
  const pathname = usePathname();
  const { logout } = useSession();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-white lg:flex">
      <div className="flex h-18 items-center border-b border-border px-6">
        <Logo />
      </div>
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-4">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors duration-200",
                active ? "bg-ink text-white" : "text-ink/70 hover:bg-surface hover:text-ink"
              )}
            >
              <item.icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border p-4">
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-muted transition-colors duration-200 hover:bg-surface hover:text-ink"
        >
          <LogOut className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          Log Out
        </button>
      </div>
    </aside>
  );
}
