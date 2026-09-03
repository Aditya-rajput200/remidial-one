"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Visual for the Learning Gap Assessment section: the brain-bg.png backdrop
 * that fades / scales in on scroll and keeps a soft ambient float. A blurred
 * lime halo drifts behind it at a different phase for a touch of depth.
 * All motion is neutralised by the global prefers-reduced-motion reset.
 */
export function AssessmentVisual({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const fallback = setTimeout(() => setInView(true), 1200);
    if (typeof IntersectionObserver === "undefined") return () => clearTimeout(fallback);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
          clearTimeout(fallback);
        }
      },
      { threshold: 0.3 }
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
        "relative mx-auto aspect-[3/2] w-full max-w-[460px] transition-all duration-700 ease-out",
        inView ? "scale-100 opacity-100" : "scale-95 opacity-0",
        className
      )}
    >
      {/* Drifting halo behind the artwork */}
      <div
        className="pointer-events-none absolute inset-[14%] rounded-full bg-lime-soft/60 blur-3xl animate-assess-bob"
        style={{ animationDelay: "0.9s", animationDuration: "5s" }}
        aria-hidden
      />
      {/* Floating backdrop */}
      <div className="absolute inset-0 animate-assess-bob">
        <Image
          src="/landing-page/brain-bg.png"
          alt=""
          fill
          priority
          sizes="(max-width: 1024px) 90vw, 460px"
          className="select-none object-contain"
        />
      </div>
    </div>
  );
}
