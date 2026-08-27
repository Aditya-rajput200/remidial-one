import Image from "next/image";
import { UserRound } from "lucide-react";
import { cn } from "@/lib/cn";

const sizeClasses = {
  sm: "h-9 w-9",
  md: "h-14 w-14",
  lg: "h-20 w-20",
};

export function Avatar({
  src,
  alt,
  size = "md",
  className,
}: {
  src?: string;
  alt: string;
  size?: keyof typeof sizeClasses;
  className?: string;
}) {
  if (src) {
    return (
      <div
        className={cn(
          "relative shrink-0 overflow-hidden rounded-full border-2 border-white shadow-card",
          sizeClasses[size],
          className
        )}
      >
        <Image src={src} alt={alt} fill className="object-cover" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full border-2 border-white bg-surface text-muted-2 shadow-card",
        sizeClasses[size],
        className
      )}
    >
      <UserRound className="h-1/2 w-1/2" strokeWidth={1.5} aria-hidden />
    </div>
  );
}
