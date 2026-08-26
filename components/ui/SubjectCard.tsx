import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { iconMap } from "@/lib/icon-map";
import type { Subject } from "@/lib/content/subjects";
import { Card } from "@/components/ui/Card";

export function SubjectCard({ subject }: { subject: Subject }) {
  const Icon = iconMap[subject.icon];

  return (
    <Link href={`/subjects/${subject.slug}`} className="group block h-full">
      <Card interactive className="flex h-full flex-col gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-lime-soft text-ink">
          <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <h3 className="text-lg font-semibold text-ink">{subject.name}</h3>
          <p className="text-sm leading-relaxed text-muted">{subject.shortDescription}</p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink">
          Explore
          <ArrowRight
            className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
            aria-hidden
          />
        </span>
      </Card>
    </Link>
  );
}
