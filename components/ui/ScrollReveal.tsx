"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export function ScrollReveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Fallback timer guarantees content is never stuck invisible — covers
    // browsers without IntersectionObserver, missed callbacks around full-page
    // screenshot/print rendering, and any other timing edge case.
    const fallback = setTimeout(() => setVisible(true), 1200);

    if (typeof IntersectionObserver === "undefined") {
      return () => clearTimeout(fallback);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
          clearTimeout(fallback);
        }
      },
      { threshold: 0.05, rootMargin: "400px 0px" }
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
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
      className={cn(
        "opacity-0 translate-y-6 transition-all duration-700 ease-out",
        visible && "opacity-100 translate-y-0",
        className
      )}
    >
      {children}
    </div>
  );
}
