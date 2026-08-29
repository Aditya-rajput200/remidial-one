import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Badge } from "@/components/ui/Badge";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  tone = "ink",
  as: Heading = "h2",
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  tone?: "ink" | "white";
  as?: "h1" | "h2";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" && "items-center text-center",
        className
      )}
    >
      {eyebrow ? (
        <Badge tone={tone === "white" ? "outline" : "lime"} className={tone === "white" ? "border-white/20 text-white/70" : undefined}>
          {eyebrow}
        </Badge>
      ) : null}
      <Heading
        className={cn(
          "text-3xl font-semibold tracking-tight sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]",
          tone === "white" ? "text-white" : "text-ink"
        )}
      >
        {title}
      </Heading>
      {description ? (
        <p
          className={cn(
            "max-w-2xl text-base leading-relaxed sm:text-lg",
            tone === "white" ? "text-white/70" : "text-muted"
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
