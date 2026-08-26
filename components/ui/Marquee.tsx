import { cn } from "@/lib/cn";

export function Marquee({
  items,
  className,
}: {
  items: string[];
  className?: string;
}) {
  const track = [...items, ...items];

  return (
    <div
      className={cn(
        "group relative overflow-hidden border-y border-border bg-white py-5",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-white to-transparent sm:w-32" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-white to-transparent sm:w-32" />
      <div className="flex w-max animate-marquee gap-10 group-hover:[animation-play-state:paused]">
        {track.map((item, index) => (
          <span
            key={`${item}-${index}`}
            className="flex items-center gap-10 text-lg font-semibold text-muted-2 sm:text-xl"
          >
            {item}
            <span className="h-1.5 w-1.5 rounded-full bg-lime" aria-hidden />
          </span>
        ))}
      </div>
    </div>
  );
}
