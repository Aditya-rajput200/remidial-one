import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

type Tone = "surface" | "white";

const toneClasses: Record<Tone, string> = {
  surface: "bg-surface",
  white: "bg-white border border-border",
};

export function PromoBanner({
  eyebrow,
  title,
  description,
  ctaLabel,
  ctaHref,
  imageSide = "right",
  tone = "surface",
  imageLabel = "Banner image placeholder",
}: {
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  imageSide?: "left" | "right";
  tone?: Tone;
  imageLabel?: string;
}) {
  return (
    <div
      className={cn(
        "grid gap-10 overflow-hidden rounded-3xl p-8 sm:p-10 lg:grid-cols-2 lg:items-center lg:gap-16 lg:p-14",
        toneClasses[tone]
      )}
    >
      <div
        className={cn(
          "flex flex-col gap-5",
          imageSide === "left" && "lg:order-2"
        )}
      >
        <Badge>{eyebrow}</Badge>
        <h3 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{title}</h3>
        <p className="text-base leading-relaxed text-muted">{description}</p>
        <div className="pt-1">
          <Button href={ctaHref} variant="primary-black" size="md">
            {ctaLabel}
          </Button>
        </div>
      </div>

      <div
        className={cn(
          "flex aspect-[4/3] w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border-strong bg-white/60 text-center",
          imageSide === "left" && "lg:order-1"
        )}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-muted-2 shadow-card">
          <ImageIcon className="h-5 w-5" strokeWidth={1.5} aria-hidden />
        </div>
        <p className="max-w-[180px] text-xs font-medium text-muted-2">{imageLabel}</p>
      </div>
    </div>
  );
}
