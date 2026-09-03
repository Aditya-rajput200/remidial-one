import { ShieldCheck, Clock, UserRoundCheck } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { VideoHero } from "@/components/ui/VideoHero";
import { JsonLd } from "@/components/ui/JsonLd";
import { CounsellingForm } from "@/components/forms/CounsellingForm";
import { buildMetadata, serviceJsonLd } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Book a Free Demo",
  description:
    "Book a free demo with the Remedial One team. We'll talk through your child's learning gaps and show how personalized 1-to-1 sessions work — including the right subject, class, and mentor to start with.",
  path: "/book-counselling",
});

const reassurances = [
  { icon: ShieldCheck, label: "Completely free, no obligation" },
  { icon: Clock, label: "Takes less than 2 minutes to request" },
  { icon: UserRoundCheck, label: "A real person calls you back" },
];

export default function BookCounsellingPage() {
  return (
    <>
      <JsonLd
        data={serviceJsonLd({
          name: "Free Demo Session",
          description:
            "A free demo for parents and students to discuss learning gaps, see how personalized 1-to-1 sessions work, and find the right subject or mentor to start with on Remedial One.",
          path: "/book-counselling",
        })}
      />

      <Section className="pb-10 pt-10 sm:pt-14">
        <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Book a Demo", path: "/book-counselling" }]} />
        <div className="mt-6">
          <SectionHeading
            as="h1"
            eyebrow="Free Demo"
            title="Not sure where to start? Book a free demo."
            description="We'll walk you through your child's learning gaps and show how personalized 1-to-1 sessions would work — including the right subject, class, and mentor to start with. No pressure, no cost."
          />
        </div>
        <ul className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
          {reassurances.map((item) => (
            <li key={item.label} className="flex items-center gap-2 text-sm font-medium text-muted">
              <item.icon className="h-4 w-4 text-lime-ink" aria-hidden />
              {item.label}
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="surface" className="pt-0">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start lg:gap-12">
          <VideoHero className="shadow-lift" />
          <CounsellingForm />
        </div>
      </Section>
    </>
  );
}
