import { Skeleton } from "@/components/ui/Skeleton";

/** Placeholder grid matching StatCard's shape (icon box + value + label). */
export function SkeletonStatCards({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col gap-3 rounded-2xl border border-border bg-white p-5">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-7 w-16" />
            <Skeleton className="h-3.5 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Placeholder grid matching the mentor/student Card layout (avatar + name + actions). */
export function SkeletonCardGrid({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col gap-4 rounded-2xl border border-border bg-white p-6">
          <Skeleton className="h-14 w-14 rounded-full" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3.5 w-1/2" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-24 rounded-full" />
            <Skeleton className="h-8 w-20 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Placeholder matching SessionCard's shape (title row, meta row, actions row). */
export function SkeletonSessionList({ count = 2 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col gap-4 rounded-2xl border border-border bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-3.5 w-56" />
            </div>
          </div>
          <div className="flex gap-4">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-3.5 w-16" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-28 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Placeholder matching a divided-row list (resources, earnings, notifications). */
export function SkeletonList({ rows = 4 }: { rows?: number }) {
  return (
    <div className="flex flex-col divide-y divide-border rounded-2xl border border-border bg-white">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 sm:p-5">
          <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Placeholder matching an admin data table. */
export function SkeletonTable({ rows = 6, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-white">
      <div className="flex items-center gap-6 border-b border-border px-4 py-3">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-3 w-16" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-6 border-b border-border px-4 py-4 last:border-0">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className={c === 0 ? "h-4 w-32" : "h-4 w-16"} />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Placeholder matching a detail page's profile header (avatar + badges + text). */
export function SkeletonDetailHeader() {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-border bg-white p-6">
      <Skeleton className="h-16 w-16 shrink-0 rounded-full" />
      <div className="flex flex-1 flex-col gap-3">
        <div className="flex gap-1.5">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-24 rounded-full" />
        </div>
        <Skeleton className="h-3.5 w-full max-w-md" />
        <Skeleton className="h-3.5 w-2/3 max-w-sm" />
      </div>
    </div>
  );
}

/** Placeholder matching a label+input form. */
export function SkeletonForm({ fields = 4 }: { fields?: number }) {
  return (
    <div className="flex max-w-xl flex-col gap-5 rounded-2xl border border-border bg-white p-6">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      ))}
      <Skeleton className="h-10 w-32 rounded-full" />
    </div>
  );
}

/** Placeholder matching the two-pane calendar page (calendar block + day list). */
export function SkeletonCalendar() {
  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <Skeleton className="h-[360px] w-full rounded-2xl" />
      <div className="flex flex-col gap-4">
        <Skeleton className="h-5 w-48" />
        <SkeletonSessionList count={2} />
      </div>
    </div>
  );
}

/** Placeholder matching the two-pane messages layout (thread list + chat panel). */
export function SkeletonThreads() {
  return (
    <div className="grid gap-4 lg:grid-cols-[280px_1fr]" style={{ minHeight: "480px" }}>
      <div className="flex flex-col gap-2 rounded-2xl border border-border bg-white p-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-xl p-2.5">
            <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
            <div className="flex flex-1 flex-col gap-1.5">
              <Skeleton className="h-3.5 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
      <Skeleton className="rounded-2xl" />
    </div>
  );
}
