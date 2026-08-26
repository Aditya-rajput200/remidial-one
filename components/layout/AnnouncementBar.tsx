"use client";

import { useState } from "react";
import Link from "next/link";
import { X, Sparkles } from "lucide-react";

export function AnnouncementBar() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="relative flex items-center justify-center gap-2 bg-ink px-10 py-2.5 text-center text-xs font-medium text-white sm:text-sm">
      <Sparkles className="hidden h-3.5 w-3.5 shrink-0 text-lime sm:inline" aria-hidden />
      <p>
        Mentor applications are now open.{" "}
        <Link href="/become-a-mentor" className="font-semibold text-lime underline underline-offset-2">
          Apply early
        </Link>
      </p>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss announcement"
        className="absolute right-3 flex h-6 w-6 items-center justify-center rounded-full text-white/60 hover:bg-white/10 hover:text-white"
      >
        <X className="h-3.5 w-3.5" aria-hidden />
      </button>
    </div>
  );
}
