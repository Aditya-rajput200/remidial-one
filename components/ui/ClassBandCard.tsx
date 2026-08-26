import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ClassBand } from "@/lib/content/classes";
import { Card } from "@/components/ui/Card";

export function ClassBandCard({ band }: { band: ClassBand }) {
  return (
    <Link href={`/classes/${band.slug}`} className="group block h-full">
      <Card interactive className="flex h-full flex-col gap-5">
        <span className="text-sm font-semibold uppercase tracking-wide text-muted">
          {band.tagline}
        </span>
        <h3 className="text-2xl font-semibold tracking-tight text-ink">{band.name}</h3>
        <p className="flex-1 text-sm leading-relaxed text-muted">{band.description}</p>
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink">
          View details
          <ArrowRight
            className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
            aria-hidden
          />
        </span>
      </Card>
    </Link>
  );
}
