import { ShieldCheck, Clock, UserRoundCheck } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { VideoHero } from "@/components/ui/VideoHero";
import { JsonLd } from "@/components/ui/JsonLd";
import { CounsellingForm } from "@/components/forms/CounsellingForm";
import { buildMetadata, serviceJsonLd } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Book Free Counselling",
  description:
    "Book a free counselling call with the Remedial One team. Talk through your child's learning gaps and get guidance on the right subject, class, and mentor to start with.",
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
          name: "Free Learning Counselling Call",
          description:
            "A free guidance call for parents and students to discuss learning gaps, personalized learning plans, and the right subject or mentor to start with on Remedial One.",
          path: "/book-counselling",
        })}
      />

      <Section className="pb-10 pt-10 sm:pt-14">
        <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Book Counselling", path: "/book-counselling" }]} />
        <div className="mt-6">
          <SectionHeading
            as="h1"
            eyebrow="Free Counselling"
            title="Not sure where to start? Talk to us first."
            description="Book a free counselling call and we'll help you understand your child's learning gaps, then point you toward the right subject, class, and mentor — no pressure, no cost."
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
