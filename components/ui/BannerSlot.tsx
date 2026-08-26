import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Pure placeholder banner slot — no real content. Drop campaign creative
 * (image, illustration, or seasonal promo) in here later; nothing else
 * needs to change since this is a dumb, replaceable block.
 */
export function BannerSlot({
  label = "Banner placeholder",
  recommendedSize = "Recommended: 1600 × 480",
  className,
}: {
  label?: string;
  recommendedSize?: string;
  className?: string;
}) {
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
