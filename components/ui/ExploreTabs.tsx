"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/cn";

export type ExploreItem = {
  label: string;
  description: string;
  href: string;
};

export type ExploreGroup = {
  id: string;
  label: string;
  blurb: string;
  items: ExploreItem[];
};

/**
 * Tabbed explorer for the homepage — one tab per way of entering the catalogue
 * (board / class / subject), each a grid of cards that link into the
 * /online-tuition service pages. Client-only for the tab state; every item is a
 * real crawlable <Link>, and non-active panels stay in the DOM (hidden) so the
 * internal links are always present for crawlers.
 */
export function ExploreTabs({ groups }: { groups: ExploreGroup[] }) {
  const [activeId, setActiveId] = useState(groups[0]?.id);
  const baseId = useId();

  return (
    <div>
      <div
        role="tablist"
        aria-label="Explore online tuition"
        className="inline-flex flex-wrap gap-1 rounded-full border border-border bg-white p-1"
      >
        {groups.map((group) => {
          const active = group.id === activeId;
          return (
            <button
              key={group.id}
              type="button"
              role="tab"
              id={`${baseId}-tab-${group.id}`}
              aria-selected={active}
              aria-controls={`${baseId}-panel-${group.id}`}
              onClick={() => setActiveId(group.id)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                active ? "bg-ink text-white" : "text-muted hover:text-ink"
              )}
            >
              {group.label}
            </button>
          );
        })}
      </div>

      {groups.map((group) => {
        const active = group.id === activeId;
        return (
          <div
            key={group.id}
            role="tabpanel"
            id={`${baseId}-panel-${group.id}`}
            aria-labelledby={`${baseId}-tab-${group.id}`}
            hidden={!active}
            className="mt-8"
          >
            <p className="max-w-2xl text-sm leading-relaxed text-muted">{group.blurb}</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex flex-col gap-2 rounded-2xl border border-border bg-white p-5 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-ink/15 hover:shadow-lift"
                >
                  <span className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-ink">{item.label}</span>
                    <ArrowUpRight
                      className="h-4 w-4 text-muted transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-ink"
                      aria-hidden
                    />
                  </span>
                  <span className="text-sm leading-relaxed text-muted">{item.description}</span>
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
