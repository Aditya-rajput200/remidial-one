"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, X as XIcon } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * "Traditional vs Remedial One" comparison where the transition itself is the
 * hero: a large central VS / → medallion with ambient motion, flanked by the
 * two cards (the Remedial One card stays black). On scroll into view the cards
 * slide in from either side and the medallion springs up between them; list
 * rows stagger in after. Motion is CSS-only and respects the global
 * prefers-reduced-motion reset in globals.css.
 */
export function TransformationCompare({
  traditional,
  remedial,
  className,
}: {
  traditional: string[];
  remedial: string[];
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const fallback = setTimeout(() => setInView(true), 1200);

    if (typeof IntersectionObserver === "undefined") {
      return () => clearTimeout(fallback);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
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

  return (
    <div
      ref={ref}
      className={cn(
        "relative grid gap-8 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-center md:gap-4 lg:gap-8",
        className
      )}
    >
      {/* Flow line threaded behind the medallion — desktop only. */}
      <svg
        viewBox="0 0 360 40"
        className="pointer-events-none absolute left-1/2 top-1/2 hidden h-10 w-[360px] max-w-[62%] -translate-x-1/2 -translate-y-1/2 text-lime-ink/60 md:block"
        fill="none"
        aria-hidden
      >
        <path
          d="M4 20 H356"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="1 11"
          className={cn(
            "origin-left transition-transform duration-700 ease-out",
            inView ? "scale-x-100" : "scale-x-0",
            inView && "animate-vs-flow"
          )}
        />
      </svg>

      {/* Traditional learning */}
      <div
        className={cn(
          "relative z-[1] rounded-2xl border border-border bg-surface p-8 transition-all duration-700 ease-out",
          inView ? "translate-x-0 opacity-100" : "-translate-x-6 opacity-0 md:-translate-x-12"
        )}
      >
        <h3 className="mb-6 text-sm font-semibold uppercase tracking-wide text-muted">
          Traditional learning
        </h3>
        <ul className="flex flex-col gap-4">
          {traditional.map((item, i) => (
            <li
              key={item}
              style={{ transitionDelay: inView ? `${380 + i * 70}ms` : "0ms" }}
              className={cn(
                "flex items-start gap-3 text-sm text-muted transition-all duration-500 ease-out",
                inView ? "translate-y-0 opacity-100" : "translate-y-1.5 opacity-0"
              )}
            >
              <XIcon className="mt-0.5 h-4 w-4 shrink-0 text-muted-2" aria-hidden />
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* VS / → medallion — the hero of the section */}
      <div
        style={{ transitionDelay: inView ? "260ms" : "0ms" }}
        className={cn(
          "relative z-10 mx-auto my-1 flex h-24 w-24 items-center justify-center transition-all duration-700 sm:h-28 sm:w-28 lg:h-32 lg:w-32 md:my-0 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)]",
          inView ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-50 opacity-0"
        )}
      >
        {/* Pulsing halo */}
        <span
          className="absolute inset-0 rounded-full bg-lime-soft animate-vs-pulse"
          aria-hidden
        />
        {/* Rotating dashed ring */}
        <span
          className="absolute -inset-2 rounded-full border-2 border-dashed border-lime-ink/40 animate-vs-spin"
          aria-hidden
        />
        {/* Core */}
        <span className="relative flex h-full w-full flex-col items-center justify-center rounded-full bg-ink text-white shadow-lift">
          <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-lime">
            vs
          </span>
          <ArrowRight
            className="h-7 w-7 rotate-90 text-lime sm:h-8 sm:w-8 md:rotate-0"
            strokeWidth={2.5}
            aria-hidden
          />
        </span>
      </div>

      {/* Remedial One — stays black */}
      <div
        style={{ transitionDelay: inView ? "120ms" : "0ms" }}
        className={cn(
          "relative z-[1] rounded-2xl border border-ink bg-ink p-8 transition-all duration-700 ease-out",
          inView ? "translate-x-0 opacity-100" : "translate-x-6 opacity-0 md:translate-x-12"
        )}
      >
        <h3 className="mb-6 text-sm font-semibold uppercase tracking-wide text-lime">
          Remedial One
        </h3>
        <ul className="flex flex-col gap-4">
          {remedial.map((item, i) => (
            <li
              key={item}
              style={{ transitionDelay: inView ? `${500 + i * 70}ms` : "0ms" }}
              className={cn(
                "flex items-start gap-3 text-sm text-white transition-all duration-500 ease-out",
                inView ? "translate-y-0 opacity-100" : "translate-y-1.5 opacity-0"
              )}
            >
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-lime" aria-hidden />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
