import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { ImageSlot } from "@/components/ui/ImageSlot";

export type JourneyStep = {
  title: string;
  description: string;
  icon: LucideIcon;
  /** Resolve with publicAsset() — falls back to a dashed placeholder until the file lands. */
  imageSrc?: string;
  imageAlt: string;
  imageLabel?: string;
  recommendedSize?: string;
};

// Brand triad rotated across the step nodes — lime tint, ink, deep forest —
// so the rail reads as one system rather than three unrelated colours.
const nodeTints = [
  "bg-lime-soft text-lime-deep",
  "bg-ink text-lime",
  "bg-forest text-forest-soft",
];

/**
 * Vertical, numbered "how it works" journey with an image beside every step.
 * A dashed rail threads the step nodes together; each row leaves a framed
 * slot for real photography (session, dashboard, mentor call, …).
 */
export function JourneyTimeline({ steps }: { steps: JourneyStep[] }) {
  return (
    <ol className="relative flex flex-col gap-12 sm:gap-16">
      {/* Rail — sits under the centre of the number nodes, hidden on mobile
          where the layout collapses to a single column. */}
      <span
        className="pointer-events-none absolute left-[19px] top-3 bottom-3 hidden border-l border-dashed border-border-strong sm:block"
        aria-hidden
      />

      {steps.map((step, index) => (
        <li
          key={step.title}
          className="relative grid gap-x-6 gap-y-5 sm:grid-cols-[40px_minmax(0,1fr)] lg:grid-cols-[40px_minmax(0,1fr)_minmax(0,46%)] lg:items-center lg:gap-x-12"
        >
          {/* Number node */}
          <div
            className={cn(
              "z-10 flex h-10 w-10 items-center justify-center rounded-xl text-xs font-bold shadow-card",
              nodeTints[index % nodeTints.length]
            )}
          >
            {String(index + 1).padStart(2, "0")}
          </div>

          {/* Copy */}
          <div className="flex flex-col gap-3 sm:pt-1">
            <span className="inline-flex items-center gap-2 text-lime-deep">
              <step.icon className="h-4 w-4" strokeWidth={2} aria-hidden />
              <span className="text-xs font-semibold uppercase tracking-wide">
                Step {index + 1}
              </span>
            </span>
            <h3 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">
              {step.title}
            </h3>
            <p className="max-w-xl text-sm leading-relaxed text-muted sm:text-base">
              {step.description}
            </p>
          </div>

          {/* Image slot — soft lime halo behind, so the frame feels designed
              even while it's still a placeholder. */}
          <div className="relative sm:col-start-2 lg:col-start-3 lg:row-start-1">
            <div
              className="pointer-events-none absolute -inset-3 -z-10 rounded-[2rem] bg-lime-soft/60 blur-2xl"
              aria-hidden
            />
            <ImageSlot
              src={step.imageSrc}
              alt={step.imageAlt}
              label={step.imageLabel ?? `Add image — ${step.title}`}
              recommendedSize={step.recommendedSize ?? "~900×675, JPG or PNG"}
              className="aspect-[4/3] w-full overflow-hidden rounded-3xl shadow-card"
            />
          </div>
        </li>
      ))}
    </ol>
  );
}
