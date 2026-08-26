import type { ReactNode } from "react";
import { GraduationCap } from "lucide-react";

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="grid min-h-[calc(100vh-4.5rem)] lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-ink p-12 text-white lg:flex">
        <span className="text-sm font-semibold uppercase tracking-wide text-lime">{eyebrow}</span>
        <div className="flex flex-col gap-4">
          <GraduationCap className="h-10 w-10 text-lime" strokeWidth={1.5} aria-hidden />
          <h1 className="max-w-md text-3xl font-semibold leading-tight tracking-tight">{title}</h1>
          <p className="max-w-sm text-sm leading-relaxed text-white/70">{description}</p>
        </div>
        <p className="text-xs text-white/40">One Student. One Mentor. One Learning Journey.</p>
      </div>

      <div className="flex items-center justify-center px-5 py-14 sm:px-8">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
