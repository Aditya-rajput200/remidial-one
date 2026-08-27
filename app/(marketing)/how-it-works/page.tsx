import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StepsList } from "@/components/ui/StepsList";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { generalFaqs } from "@/lib/content/faqs";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "How It Works",
  description:
    "See exactly how personalized 1-to-1 learning works on Remedial One, from choosing a subject to tracking your progress.",
  path: "/how-it-works",
});

const steps = [
  { title: "Tell us what you want to learn", description: "Share your subject, class, and learning goals — academic or beyond." },
  { title: "Discover the right mentor", description: "Browse mentor profiles matched to your subject, class, and pace." },
  { title: "Book your session", description: "Choose a time that fits your schedule. No fixed batch, no waiting." },
  { title: "Learn 1-to-1", description: "Meet your mentor in a focused, dedicated online learning room." },
  { title: "Track your progress", description: "Review session history, mentor feedback, and progress in your dashboard." },
];

export default function HowItWorksPage() {
  return (
    <>
      <Section className="pb-10 pt-10 sm:pt-14">
        <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "How It Works", path: "/how-it-works" }]} />
        <div className="mt-6">
          <SectionHeading
            eyebrow="How It Works"
            title="From first search to real progress."
            description="Getting started with personalized learning shouldn't be complicated. Here's exactly what happens, step by step."
          />
        </div>
      </Section>

      <Section tone="surface" className="pt-0">
        <StepsList steps={steps} />
      </Section>

      <Section>
        <SectionHeading eyebrow="FAQ" title="Questions about getting started" />
        <div className="mt-8 max-w-3xl">
          <FaqAccordion faqs={generalFaqs} />
        </div>
      </Section>

      <Section tone="ink">
        <div className="flex flex-col items-center gap-5 text-center">
          <h2 className="max-w-xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Ready to find your mentor?
          </h2>
          <Button href="/mentors" variant="primary-lime" size="lg">
            Get Started
          </Button>
        </div>
      </Section>
    </>
  );
}
