import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Container } from "@/components/ui/Container";

type Tone = "white" | "surface" | "ink" | "lime" | "forest";

const toneClasses: Record<Tone, string> = {
  white: "bg-white text-ink",
  surface: "bg-surface text-ink",
  ink: "bg-ink text-white",
  lime: "bg-brand-gradient text-white",
  forest: "bg-forest text-white",
};

export function Section({
  children,
  className,
  containerClassName,
  tone = "white",
  as: Tag = "section",
  id,
}: {
  children: ReactNode;
  className?: string;
  containerClassName?: string;
  tone?: Tone;
  as?: "section" | "div";
  id?: string;
}) {
  return (
    <Tag id={id} className={cn("py-16 sm:py-20 lg:py-28", toneClasses[tone], className)}>
      <Container className={containerClassName}>{children}</Container>
    </Tag>
  );
}
