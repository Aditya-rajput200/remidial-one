import { cn } from "@/lib/cn";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ImageSlot } from "@/components/ui/ImageSlot";

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
  image,
  imageAlt,
  imageSide = "right",
  tone = "surface",
  imageLabel = "Banner image placeholder",
  recommendedSize,
}: {
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  /** Resolve with publicAsset() — degrades to the dashed placeholder until the file lands. */
  image?: string;
  imageAlt?: string;
  imageSide?: "left" | "right";
  tone?: Tone;
  imageLabel?: string;
  recommendedSize?: string;
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

      <ImageSlot
        src={image}
        alt={imageAlt ?? title}
        label={imageLabel}
        recommendedSize={recommendedSize}
        className={cn(
          "aspect-[4/3] w-full overflow-hidden rounded-2xl",
          imageSide === "left" && "lg:order-1"
        )}
      />
    </div>
  );
}
