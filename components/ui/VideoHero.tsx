"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { cn } from "@/lib/cn";

export function VideoHero({
  src,
  className,
}: {
  src?: string;
  className?: string;
}) {
  const [playing, setPlaying] = useState(false);
  const [notice, setNotice] = useState(false);

  if (src && playing) {
    return (
      <div className={cn("aspect-video w-full overflow-hidden rounded-3xl bg-ink", className)}>
        <video
          src={src}
          controls
          autoPlay
          playsInline
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative aspect-video w-full overflow-hidden rounded-3xl bg-ink",
        className
      )}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-6 text-center">
        <button
          type="button"
          onClick={() => (src ? setPlaying(true) : setNotice(true))}
          aria-label="Play video"
          className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-gradient text-white transition-transform duration-200 hover:scale-105 sm:h-20 sm:w-20"
        >
          <Play className="h-7 w-7 translate-x-0.5 sm:h-8 sm:w-8" fill="currentColor" aria-hidden />
        </button>
        <p className="text-sm font-medium text-white/70 sm:text-base">
          {notice ? "Video coming soon." : "Watch how Remedial One works"}
        </p>
      </div>
    </div>
  );
}
