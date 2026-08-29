import Link from "next/link";
import Image from "next/image";
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
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
          dark && "bg-white/10 p-1"
        )}
      >
        <Image
          src="/web-app-manifest-192x192.png"
          alt=""
          width={192}
          height={192}
          className="h-full w-full object-contain"
        />
      </span>
      <span>
        REMEDIAL <span className={dark ? "text-lime" : "text-lime-ink"}>ONE</span>
      </span>
    </Link>
  );
}
