"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { MegaPanel as MegaPanelData, MegaItem } from "@/lib/content/nav";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

/**
 * Presentational body of a desktop mega-menu dropdown. Open/close state and
 * positioning live in Header; this just lays the columns out.
 */
export function MegaPanel({
  panel,
  onNavigate,
}: {
  panel: MegaPanelData;
  onNavigate: () => void;
}) {
  const wide = panel.columns.length >= 4;

  return (
    <div
      className={cn(
        "mx-auto grid max-w-7xl gap-x-10 gap-y-8 px-4 py-8 sm:grid-cols-2",
        wide ? "lg:grid-cols-4" : "lg:grid-cols-3"
      )}
    >
      {panel.columns.map((col) => (
        <div key={col.heading} className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <col.icon className="h-4 w-4 text-lime-deep" strokeWidth={2} aria-hidden />
            <span className="text-sm font-semibold text-ink">{col.heading}</span>
          </div>

          {col.variant === "chips" ? (
            <div className="grid grid-cols-2 gap-2 xl:grid-cols-3">
              {col.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className="rounded-xl border border-border px-3 py-2 text-center text-sm font-medium text-ink/80 transition-colors duration-200 hover:border-lime/40 hover:bg-lime-soft/50 hover:text-ink"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          ) : (
            <ul className="flex flex-col gap-0.5">
              {col.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    className="flex items-start gap-3 rounded-xl px-2.5 py-2 transition-colors duration-200 hover:bg-surface"
                  >
                    {col.variant === "logos" ? <BoardLogo item={item} /> : null}
                    <span className="flex flex-col gap-0.5">
                      <span className="flex items-center gap-2 text-sm font-medium text-ink">
                        {item.label}
                        {item.tag ? (
                          <span className="rounded-full bg-lime-soft px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-lime-deep">
                            {item.tag}
                          </span>
                        ) : null}
                      </span>
                      {item.sub ? (
                        <span className="text-xs leading-snug text-muted">{item.sub}</span>
                      ) : null}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {col.seeAll ? (
            <Link
              href={col.seeAll.href}
              onClick={onNavigate}
              className="mt-auto inline-flex items-center gap-1 pt-1 text-xs font-semibold text-ink underline underline-offset-4 transition-colors duration-200 hover:text-lime-deep"
            >
              {col.seeAll.label}
              <ArrowRight className="h-3 w-3" aria-hidden />
            </Link>
          ) : null}
        </div>
      ))}

      <div className="col-span-full flex flex-col items-start justify-between gap-3 border-t border-border pt-5 sm:flex-row sm:items-center">
        <p className="text-sm text-muted">{panel.footer.text}</p>
        <Button
          href={panel.footer.ctaHref}
          variant="primary-lime"
          size="sm"
          className="gap-1.5"
          onClick={onNavigate}
        >
          {panel.footer.ctaLabel}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Button>
      </div>
    </div>
  );
}

/** Exam-board logo tile, with a text fallback until the PNG is dropped in. */
function BoardLogo({ item }: { item: MegaItem }) {
  return (
    <span className="flex h-9 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-white">
      {item.image ? (
        <Image
          src={item.image}
          alt={`${item.label} logo`}
          width={44}
          height={24}
          className="h-6 w-auto object-contain"
        />
      ) : (
        <span className="text-[10px] font-bold uppercase tracking-wide text-muted-2">
          {item.label.slice(0, 4)}
        </span>
      )}
    </span>
  );
}
