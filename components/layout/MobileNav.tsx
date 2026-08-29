"use client";

import Link from "next/link";
import { X, UserPlus } from "lucide-react";
import { primaryNav, moreNav } from "@/lib/content/nav";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/layout/Logo";
import { useSession } from "@/lib/auth/SessionProvider";
import { cn } from "@/lib/cn";

export function MobileNav({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { session } = useSession();
  const dashboardHref = session?.role === "mentor" ? "/mentor/dashboard" : "/student/dashboard";
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
          "absolute inset-y-0 right-0 flex w-full max-w-sm flex-col gap-8 bg-white p-6 shadow-lift transition-transform duration-300 ease-out",
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
          {[...primaryNav, ...moreNav].map((link) => (
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

        <div className="mt-auto flex flex-col gap-3">
          {session ? (
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
