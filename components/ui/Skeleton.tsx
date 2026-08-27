import { cn } from "@/lib/cn";

/** Base loading placeholder block. Compose into shapes via className. */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-surface-alt", className)} aria-hidden />;
}
