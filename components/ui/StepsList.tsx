"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

type Step = {
  title: string;
  description: string;
  /** Resolve with publicAsset() — the numbered badge renders without it, icon is simply omitted. */
  icon?: string;
};

const CYCLE_MS = 2400;

/**
 * "How it works" steps as equal cards. Once the row scrolls into view, the
 * active step auto-advances on a loop; hovering or focusing a card takes
 * over — pausing the loop, highlighting that card, and enlarging its icon.
 * All motion is neutralised by the global prefers-reduced-motion reset.
 */
export function StepsList({ steps }: { steps: Step[] }) {
  const ref = useRef<HTMLOListElement>(null);
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
    <ol ref={ref} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
      {steps.map((step, index) => {
        const isActive = active === index;
        return (
          <li
            key={step.title}
            onPointerEnter={() => {
              setPaused(true);
              setActive(index);
            }}
            onPointerLeave={() => setPaused(false)}
            onFocusCapture={() => {
              setPaused(true);
              setActive(index);
            }}
            onBlurCapture={() => setPaused(false)}
            className={cn(
              "group flex flex-col items-start gap-4 rounded-2xl border p-6 transition-all duration-500 ease-out",
              isActive ? "-translate-y-1 border-lime bg-lime-soft/30 shadow-card" : "border-border bg-white"
            )}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-lime-soft text-sm font-bold text-ink">
              {String(index + 1).padStart(2, "0")}
            </span>
            {step.icon ? (
              <div
                className={cn(
                  "relative h-24 w-24 shrink-0 transition-transform duration-500 ease-out group-hover:scale-110 sm:h-28 sm:w-28",
                  isActive && "scale-110"
                )}
              >
                <Image src={step.icon} alt="" fill className="object-contain" aria-hidden />
              </div>
            ) : null}
            <h3 className="text-base font-semibold text-ink">{step.title}</h3>
            <p className="text-sm leading-relaxed text-muted">{step.description}</p>
          </li>
        );
      })}
    </ol>
  );
}
