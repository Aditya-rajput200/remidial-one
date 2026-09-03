"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ClipboardList, Search, TrendingUp } from "lucide-react";
import { cn } from "@/lib/cn";

// Icons are resolved here, not passed from the server component — Next.js does
// not allow component references to cross the server/client boundary as props.
const ICONS = {
  search: Search,
  clipboard: ClipboardList,
  trending: TrendingUp,
} as const;

// Corner illustration per step, keyed by icon.
const ILLUSTRATIONS: Record<keyof typeof ICONS, { src: string; w: number; h: number }> = {
  search: { src: "/landing-page/marksheet.png", w: 1024, h: 1536 },
  clipboard: { src: "/landing-page/pen-Calender.png", w: 1536, h: 1024 },
  trending: { src: "/landing-page/track.png", w: 1536, h: 1024 },
};

export type AssessmentStep = {
  icon: keyof typeof ICONS;
  title: string;
  description: string;
  detail?: string;
};

const CYCLE_MS = 2600;

/**
 * The three assessment steps — Identify → Personalize → Track — as three
 * equal-weight, equal-height cards. They stagger in when the section scrolls
 * into view, then the "active" highlight auto-advances through them on a loop.
 * Hovering or focusing a card takes over and pauses the loop; only one card is
 * active at a time. The highlight is purely visual (no layout shift). All
 * motion is neutralised by the global prefers-reduced-motion reset.
 */
export function AssessmentJourney({
  steps,
  className,
}: {
  steps: readonly AssessmentStep[];
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const fallback = setTimeout(() => setShown(true), 1200);
    if (typeof IntersectionObserver === "undefined") return () => clearTimeout(fallback);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          observer.disconnect();
          clearTimeout(fallback);
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -10% 0px" }
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      clearTimeout(fallback);
    };
  }, []);

  useEffect(() => {
    if (!shown || paused) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setActive((i) => (i + 1) % steps.length), CYCLE_MS);
    return () => clearInterval(id);
  }, [shown, paused, steps.length]);

  return (
    <div ref={ref} className={cn("grid gap-5 sm:gap-6 lg:grid-cols-3", className)}>
      {steps.map((step, i) => {
        const Icon = ICONS[step.icon];
        const art = ILLUSTRATIONS[step.icon];
        const isActive = active === i;
        return (
          <div
            key={step.title}
            onPointerEnter={() => {
              setPaused(true);
              setActive(i);
            }}
            onPointerLeave={() => setPaused(false)}
            onFocusCapture={() => {
              setPaused(true);
              setActive(i);
            }}
            onBlurCapture={() => setPaused(false)}
            className={cn(
              "group relative flex h-full flex-col gap-3.5 overflow-hidden rounded-2xl border p-6 transition-all duration-500 ease-out hover:-translate-y-1 hover:border-border-strong hover:shadow-card",
              shown
                ? isActive
                  ? "-translate-y-1 opacity-100"
                  : "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0",
              isActive ? "border-lime bg-lime-soft/40 shadow-card" : "border-border bg-white"
            )}
            style={{ transitionDelay: shown ? `${i * 120}ms` : "0ms" }}
          >
            <div className="flex items-center justify-between">
              <span
                className={cn(
                  "text-xs font-bold tracking-[0.2em] transition-colors",
                  isActive ? "text-lime-deep" : "text-muted-2"
                )}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-xl bg-lime-soft text-ink transition-colors duration-300 group-hover:bg-lime",
                  isActive && "bg-lime"
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              </div>
            </div>

            <h3 className="text-base font-semibold text-ink">{step.title}</h3>
            <p className="text-sm leading-relaxed text-muted">{step.description}</p>

            {/* Corner illustration */}
            <div className="relative mt-auto h-28 w-full">
              <Image
                src={art.src}
                alt=""
                fill
                sizes="220px"
                className={cn(
                  "select-none object-contain object-right-bottom transition-transform duration-500 group-hover:scale-105",
                  isActive && "scale-105"
                )}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
