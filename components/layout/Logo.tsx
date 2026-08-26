import Link from "next/link";
import { cn } from "@/lib/cn";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn("inline-flex items-center gap-2 text-lg font-bold tracking-tight text-ink", className)}
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink text-lime">
        <span className="text-sm font-bold">R1</span>
      </span>
      <span>
        REMEDIAL <span className="text-lime-ink">ONE</span>
      </span>
    </Link>
  );
}
