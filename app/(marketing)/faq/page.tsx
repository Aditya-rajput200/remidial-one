import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { Button } from "@/components/ui/Button";
import { JsonLd } from "@/components/ui/JsonLd";
import { generalFaqs, becomeMentorFaqs } from "@/lib/content/faqs";
import { buildMetadata, faqJsonLd } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Frequently Asked Questions",
  description: "Answers to common questions about learning, mentors, and how Remedial One works.",
  path: "/faq",
});

const allFaqs = [...generalFaqs, ...becomeMentorFaqs];

export default function FaqPage() {
  return (
    <>
      <JsonLd data={faqJsonLd(allFaqs)} />
      <Section className="pb-10 pt-10 sm:pt-14">
        <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "FAQ", path: "/faq" }]} />
        <div className="mt-6">
          <SectionHeading
            as="h1"
            eyebrow="FAQ"
            title="Frequently asked questions."
            description="Can't find what you're looking for? Reach out and we'll get back to you."
          />
        </div>
      </Section>

      <Section tone="surface" className="pt-0">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">
            For students & parents
          </h2>
          <FaqAccordion faqs={generalFaqs} />
        </div>
      </Section>

      <Section>
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">
            For mentors
          </h2>
          <FaqAccordion faqs={becomeMentorFaqs} />
        </div>
      </Section>

      <Section tone="ink">
        <div className="flex flex-col items-center gap-5 text-center">
          <h2 className="max-w-xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Still have questions?
          </h2>
          <Button href="/contact" variant="primary-lime" size="lg">
            Contact Us
          </Button>
        </div>
      </Section>
    </>
  );
}
