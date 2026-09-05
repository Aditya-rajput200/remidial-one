"use client";

import Link from "next/link";
import { X, UserPlus, ChevronDown } from "lucide-react";
import { headerNav, moreNav } from "@/lib/content/nav";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/layout/Logo";
import { useSession } from "@/lib/auth/SessionProvider";
import { dashboardPathForRole } from "@/lib/auth/session";
import { cn } from "@/lib/cn";

export function MobileNav({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { session, ready } = useSession();
  const showDashboard = ready && !!session;
  const dashboardHref = session ? dashboardPathForRole(session.role) : "/login";
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 lg:hidden",
        open ? "pointer-events-auto" : "pointer-events-none"
      )}
      aria-hidden={!open}
    >
      <div
        className={cn(
          "absolute inset-0 bg-ink/40 transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
      />
      <div
        className={cn(
          "absolute inset-y-0 right-0 flex w-full max-w-sm flex-col gap-6 overflow-y-auto bg-white p-6 shadow-lift transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between">
          <Logo />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-surface"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <nav className="flex flex-col gap-1">
          {headerNav.map((entry) =>
            entry.type === "link" ? (
              <Link
                key={entry.href}
                href={entry.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-3 text-base",
                  entry.highlight
                    ? "font-semibold text-lime-deep"
                    : "font-medium text-ink hover:bg-surface"
                )}
              >
                <entry.icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                {entry.label}
              </Link>
            ) : (
              <details key={entry.key} className="group rounded-lg">
                <summary className="flex cursor-pointer list-none items-center justify-between rounded-lg px-3 py-3 text-base font-medium text-ink hover:bg-surface [&::-webkit-details-marker]:hidden">
                  {entry.label}
                  <ChevronDown
                    className="h-4 w-4 text-muted transition-transform duration-200 group-open:rotate-180"
                    aria-hidden
                  />
                </summary>
                <div className="flex flex-col gap-4 px-2 pb-2 pt-1">
                  {entry.panel.columns.map((col) => (
                    <div key={col.heading} className="flex flex-col gap-1">
                      <span className="flex items-center gap-2 px-2 pb-0.5 text-xs font-semibold uppercase tracking-wide text-muted-2">
                        <col.icon className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                        {col.heading}
                      </span>
                      {col.items.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={onClose}
                          className="rounded-lg px-3 py-2 text-sm text-ink/80 hover:bg-surface hover:text-ink"
                        >
                          {item.label}
                        </Link>
                      ))}
                      {col.seeAll ? (
                        <Link
                          href={col.seeAll.href}
                          onClick={onClose}
                          className="px-3 py-2 text-xs font-semibold text-lime-deep underline underline-offset-4"
                        >
                          {col.seeAll.label}
                        </Link>
                      ) : null}
                    </div>
                  ))}
                  <Button
                    href={entry.panel.footer.ctaHref}
                    variant="primary-lime"
                    size="sm"
                    className="w-full"
                    onClick={onClose}
                  >
                    {entry.panel.footer.ctaLabel}
                  </Button>
                </div>
              </details>
            )
          )}

          {moreNav.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className="flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium text-ink hover:bg-surface"
            >
              <link.icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              {link.label}
            </Link>
          ))}

          <Link
            href="/become-a-mentor"
            onClick={onClose}
            className="flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium text-muted hover:bg-surface"
          >
            <UserPlus className="h-5 w-5" strokeWidth={1.75} aria-hidden />
            Become a Mentor
          </Link>
        </nav>

        <div className="mt-auto flex flex-col gap-3 pt-2">
          {showDashboard ? (
            <Button href={dashboardHref} variant="primary-lime" size="lg" className="w-full" onClick={onClose}>
              Go to Dashboard
            </Button>
          ) : (
            <>
              <Button href="/signup" variant="primary-lime" size="lg" className="w-full" onClick={onClose}>
                Get Started
              </Button>
              <Button href="/login" variant="secondary-outline" size="lg" className="w-full" onClick={onClose}>
                Login
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
