"use client";

import { useState } from "react";
import { Menu, LogOut, X } from "lucide-react";
import type { DashboardNavItem } from "@/lib/content/dashboardNav";
import { useSession } from "@/lib/auth/SessionProvider";
import { Logo } from "@/components/layout/Logo";
import { Avatar } from "@/components/ui/Avatar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function TopBar({ items }: { items: DashboardNavItem[] }) {
  const { session, logout } = useSession();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <header className="flex h-16 items-center justify-between border-b border-border bg-white px-4 sm:px-6 lg:h-18 lg:px-8">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open menu"
          className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-surface lg:hidden"
        >
          <Menu className="h-5 w-5" aria-hidden />
        </button>

        <div className="lg:hidden">
          <Logo />
        </div>

        <div className="ml-auto flex items-center gap-3">
          <span className="hidden text-sm text-muted sm:inline">
            Welcome, <span className="font-semibold text-ink">{session?.name.split(" ")[0]}</span>
          </span>
          {session ? (
            <Avatar
              src={session.avatarUrl}
              alt={session.name}
              size="sm"
              className="border-0"
              fallback={
                <span className="flex h-full w-full items-center justify-center rounded-full bg-ink text-xs font-semibold text-lime">
                  {initials(session.name)}
                </span>
              }
            />
          ) : null}
        </div>
      </header>

      {/* Mobile drawer with full nav */}
      <div className={cn("fixed inset-0 z-50 lg:hidden", drawerOpen ? "pointer-events-auto" : "pointer-events-none")}>
        <div
          className={cn(
            "absolute inset-0 bg-ink/40 transition-opacity duration-300",
            drawerOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={() => setDrawerOpen(false)}
        />
        <div
          className={cn(
            "absolute inset-y-0 left-0 flex w-72 flex-col gap-2 bg-white p-5 shadow-lift transition-transform duration-300 ease-out",
            drawerOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="mb-4 flex items-center justify-between">
            <Logo />
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              aria-label="Close menu"
              className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-surface"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
          {items.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setDrawerOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium",
                  active ? "bg-ink text-white" : "text-ink/70 hover:bg-surface"
                )}
              >
                <item.icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                {item.label}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={logout}
            className="mt-2 flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-muted hover:bg-surface"
          >
            <LogOut className="h-5 w-5" strokeWidth={1.75} aria-hidden />
            Log Out
          </button>
        </div>
      </div>
    </>
  );
}
