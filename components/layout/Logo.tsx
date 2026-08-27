import Link from "next/link";
import { cn } from "@/lib/cn";

export function Logo({ className, dark = false }: { className?: string; dark?: boolean }) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex items-center gap-2 text-lg font-bold tracking-tight",
        dark ? "text-white" : "text-ink",
        className
      )}
    >
      <span
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-lg",
          dark ? "bg-white/10 text-lime" : "bg-ink text-lime"
        )}
      >
        <span className="text-sm font-bold">R1</span>
      </span>
      <span>
        REMEDIAL <span className={dark ? "text-lime" : "text-lime-ink"}>ONE</span>
      </span>
    </Link>
  );
}
