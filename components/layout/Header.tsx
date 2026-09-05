"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Menu, LayoutDashboard, ChevronDown, UserPlus } from "lucide-react";
import { headerNav, moreNav } from "@/lib/content/nav";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/layout/Logo";
import { MobileNav } from "@/components/layout/MobileNav";
import { MegaPanel } from "@/components/layout/MegaMenu";
import { useSession } from "@/lib/auth/SessionProvider";
import { dashboardPathForRole } from "@/lib/auth/session";
import { cn } from "@/lib/cn";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [openMega, setOpenMega] = useState<string | null>(null);
  const moreRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { session, ready } = useSession();
  const showDashboard = ready && !!session;
  const dashboardHref = session ? dashboardPathForRole(session.role) : "/login";

  const activeMega = headerNav.find(
    (entry): entry is Extract<typeof entry, { type: "mega" }> =>
      entry.type === "mega" && entry.key === openMega
  );

  // Hover-intent: a small delay before closing so the pointer can travel from
  // the trigger into the panel without the menu flickering shut.
  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = null;
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpenMega(null), 140);
  };
  const openMegaMenu = (key: string) => {
    cancelClose();
    setMoreOpen(false);
    setOpenMega(key);
  };

  useEffect(() => () => cancelClose(), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMoreOpen(false);
        setOpenMega(null);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!moreOpen) return;
    function onPointerDown(event: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        setMoreOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [moreOpen]);

  return (
    <>
      <header
        onMouseLeave={scheduleClose}
        onMouseEnter={cancelClose}
        className={cn(
          "sticky top-0 z-40 w-full border-b transition-all duration-300",
          scrolled || activeMega
            ? "border-border bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85"
            : "border-transparent bg-white"
        )}
      >
        <div className="mx-auto grid h-18 w-full max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-3.5">
          <div className="flex items-center">
            <Logo />
          </div>

          <nav className="hidden items-center justify-center gap-1 lg:flex">
            {headerNav.map((entry) =>
              entry.type === "link" ? (
                <Link
                  key={entry.href}
                  href={entry.href}
                  onMouseEnter={scheduleClose}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm transition-colors duration-200",
                    entry.highlight
                      ? "font-semibold text-lime-deep hover:text-lime"
                      : "font-medium text-ink/80 hover:bg-surface hover:text-ink"
                  )}
                >
                  <entry.icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                  {entry.label}
                </Link>
              ) : (
                <button
                  key={entry.key}
                  type="button"
                  onClick={() => setOpenMega((cur) => (cur === entry.key ? null : entry.key))}
                  onMouseEnter={() => openMegaMenu(entry.key)}
                  aria-haspopup="menu"
                  aria-expanded={openMega === entry.key}
                  className={cn(
                    "flex items-center gap-1 rounded-full px-3.5 py-2 text-sm font-medium transition-colors duration-200",
                    openMega === entry.key
                      ? "bg-surface text-ink"
                      : "text-ink/80 hover:bg-surface hover:text-ink"
                  )}
                >
                  {entry.label}
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 transition-transform duration-200",
                      openMega === entry.key && "rotate-180"
                    )}
                    aria-hidden
                  />
                </button>
              )
            )}

            <div ref={moreRef} className="relative">
              <button
                type="button"
                onClick={() => {
                  setOpenMega(null);
                  setMoreOpen((open) => !open);
                }}
                onMouseEnter={scheduleClose}
                aria-haspopup="menu"
                aria-expanded={moreOpen}
                className="flex items-center gap-1 rounded-full px-3.5 py-2 text-sm font-medium text-ink/80 transition-colors duration-200 hover:bg-surface hover:text-ink"
              >
                More
                <ChevronDown
                  className={cn("h-3.5 w-3.5 transition-transform duration-200", moreOpen && "rotate-180")}
                  aria-hidden
                />
              </button>

              {moreOpen ? (
                <div
                  role="menu"
                  className="absolute left-1/2 top-full mt-2 w-48 -translate-x-1/2 rounded-2xl border border-border bg-white p-1.5 shadow-lift"
                >
                  {moreNav.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      role="menuitem"
                      onClick={() => setMoreOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium text-ink/80 transition-colors duration-200 hover:bg-surface hover:text-ink"
                    >
                      <link.icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                      {link.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          </nav>

          <div className="flex items-center justify-end gap-2">
            <Link
              href="/become-a-mentor"
              onMouseEnter={scheduleClose}
              className="hidden items-center gap-1.5 px-3 text-sm font-medium text-muted transition-colors duration-200 hover:text-ink lg:inline-flex"
            >
              <UserPlus className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              Become a Mentor
            </Link>
            {showDashboard ? (
              <Button
                href={dashboardHref}
                variant="primary-lime"
                size="sm"
                className="hidden gap-1.5 lg:inline-flex"
              >
                <LayoutDashboard className="h-4 w-4" aria-hidden />
                Dashboard
              </Button>
            ) : (
              <>
                <Button href="/login" variant="ghost" size="sm" className="hidden lg:inline-flex">
                  Login
                </Button>
                <Button href="/signup" variant="primary-lime" size="sm" className="hidden lg:inline-flex">
                  Get Started
                </Button>
              </>
            )}

            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-surface lg:hidden"
            >
              <Menu className="h-5 w-5" aria-hidden />
            </button>
          </div>
        </div>

        {/* Desktop mega-menu panel — full-width surface pinned under the bar */}
        {activeMega ? (
          <div
            className="absolute inset-x-0 top-full hidden border-b border-border bg-white shadow-lift lg:block"
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
          >
            <MegaPanel panel={activeMega.panel} onNavigate={() => setOpenMega(null)} />
          </div>
        ) : null}
      </header>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
