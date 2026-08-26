import { Compass } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <Section tone="surface" className="min-h-[60vh] flex items-center">
      <EmptyState
        icon={Compass}
        title="We couldn't find that page"
        description="The page you're looking for may have moved or doesn't exist. Let's get you back on track."
        action={
          <div className="flex flex-wrap justify-center gap-3">
            <Button href="/" variant="primary-black">
              Back to home
            </Button>
            <Button href="/contact" variant="secondary-outline">
              Contact us
            </Button>
          </div>
        }
      />
    </Section>
  );
}
