import Link from "next/link";
import { UserRound } from "lucide-react";
import type { MentorPreview } from "@/lib/content/mentors";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export function MentorCard({ mentor }: { mentor: MentorPreview }) {
  return (
    <Link href={`/mentors/${mentor.slug}`} className="block h-full">
      <Card interactive className="flex h-full flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface text-muted-2">
            <UserRound className="h-7 w-7" strokeWidth={1.5} aria-hidden />
          </div>
          {mentor.isPreview ? <Badge tone="outline">Sample profile</Badge> : null}
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-semibold text-ink">{mentor.displayName}</h3>
          <p className="text-sm font-medium text-muted">{mentor.role}</p>
        </div>
        <p className="text-sm leading-relaxed text-muted">{mentor.bio}</p>
      </Card>
    </Link>
  );
}
