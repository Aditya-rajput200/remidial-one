import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/cn";

export function ImageSlot({
  src,
  alt,
  label = "Image placeholder",
  recommendedSize,
  fit = "cover",
  className,
}: {
  src?: string;
  alt: string;
  label?: string;
  recommendedSize?: string;
  fit?: "cover" | "contain";
  className?: string;
}) {
  if (src) {
    return (
      <div className={cn("relative", className)}>
        <Image
          src={src}
          alt={alt}
          fill
          className={fit === "contain" ? "object-contain" : "object-cover"}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center gap-2 overflow-hidden rounded-3xl border-2 border-dashed border-border-strong bg-[repeating-linear-gradient(135deg,var(--color-surface)_0px,var(--color-surface)_12px,var(--color-surface-alt)_12px,var(--color-surface-alt)_24px)] px-6 text-center",
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-muted-2 shadow-card">
        <ImageIcon className="h-5 w-5" strokeWidth={1.5} aria-hidden />
      </div>
      <p className="text-xs font-semibold text-muted">{label}</p>
      {recommendedSize ? <p className="text-[11px] text-muted-2">{recommendedSize}</p> : null}
    </div>
  );
}
