import { ArrowRight } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { publicAsset } from "@/lib/assets";

export function BecomeMentorCard({ className }: { className?: string }) {
  const photoSrc = publicAsset("images/hero/mentor.jpg");

  return (
    <div className={`flex flex-col gap-4 rounded-3xl border border-border bg-white p-6 shadow-lift ${className ?? ""}`}>
      <div className="flex items-center gap-4">
        <Avatar src={photoSrc} alt="Mentor" size="lg" />
        <div className="flex flex-col gap-0.5">
          <h3 className="text-base font-semibold text-ink">Become a Mentor</h3>
          <p className="text-sm leading-snug text-muted">
            Teach what you know. Inspire what comes next.
          </p>
        </div>
      </div>
      <Button href="/become-a-mentor" variant="primary-lime" size="md" className="w-full gap-2">
        Apply Now
        <ArrowRight className="h-4 w-4" aria-hidden />
      </Button>
    </div>
  );
}
