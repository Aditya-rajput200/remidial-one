import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Logo } from "@/components/layout/Logo";

export const metadata: Metadata = {
  title: "Teacher application — Remedial One",
  robots: { index: false, follow: false },
};

export default function ApplyLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-surface">
      <header className="flex h-16 items-center border-b border-border bg-white px-4 sm:px-6 lg:px-8">
        <Logo />
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
