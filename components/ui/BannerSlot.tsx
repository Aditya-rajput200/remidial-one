import Image from "next/image";
import Link from "next/link";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Campaign banner block. Pass `src` to show real creative (optionally wrapped
 * in a link via `href`); with no `src` it falls back to a dashed placeholder
 * so the slot is visible while creative is still being produced.
 */
export function BannerSlot({
  src,
  alt = "",
  href,
  label = "Banner placeholder",
  recommendedSize = "Recommended: 1600 × 480",
  className,
}: {
  src?: string;
  alt?: string;
  href?: string;
  label?: string;
  recommendedSize?: string;
  className?: string;
}) {
  if (src) {
    const image = (
      <div
        className={cn(
          "relative aspect-[1983/793] w-full overflow-hidden rounded-3xl bg-surface shadow-card",
          className
        )}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 1024px) 100vw, 1200px"
          className="object-cover"
        />
      </div>
    );

    return href ? (
      <Link href={href} className="block transition-transform duration-300 hover:-translate-y-1">
        {image}
      </Link>
    ) : (
      image
    );
  }

  return (
    <div
      className={cn(
        "relative flex min-h-[220px] w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-3xl border-2 border-dashed border-border-strong bg-[repeating-linear-gradient(135deg,var(--color-surface)_0px,var(--color-surface)_12px,var(--color-surface-alt)_12px,var(--color-surface-alt)_24px)] px-6 text-center sm:min-h-[280px]",
        className
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-muted-2 shadow-card">
        <ImageIcon className="h-6 w-6" strokeWidth={1.5} aria-hidden />
      </div>
      <p className="text-sm font-semibold text-muted">{label}</p>
      <p className="text-xs text-muted-2">{recommendedSize} — replace with campaign creative</p>
    </div>
  );
}
