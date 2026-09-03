import { cn } from "@/lib/cn";
import { ImageSlot } from "@/components/ui/ImageSlot";

export type ShowcaseImage = {
  /** Resolve with publicAsset() — falls back to a dashed placeholder until the file lands. */
  src?: string;
  alt: string;
  label?: string;
  recommendedSize?: string;
};

/**
 * A bento strip of image slots for a page's "see it for yourself" moment.
 * The first image runs tall on desktop so the block has a focal point;
 * every slot degrades to a labelled placeholder until real creative lands.
 */
export function ShowcaseGallery({ images }: { images: ShowcaseImage[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:auto-rows-[210px]">
      {images.map((image, index) => (
        <ImageSlot
          key={image.alt}
          src={image.src}
          alt={image.alt}
          label={image.label ?? "Add photo"}
          recommendedSize={image.recommendedSize ?? "~720×720, JPG"}
          className={cn(
            "w-full overflow-hidden rounded-3xl shadow-card",
            index === 0
              ? "aspect-[4/5] sm:col-span-2 sm:aspect-[16/10] lg:col-span-2 lg:row-span-2 lg:aspect-auto lg:h-full"
              : "aspect-square lg:aspect-auto lg:h-full"
          )}
        />
      ))}
    </div>
  );
}
