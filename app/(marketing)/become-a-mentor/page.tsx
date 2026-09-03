import { Globe2, Clock, GraduationCap, ShieldCheck } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { StepsList } from "@/components/ui/StepsList";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { becomeMentorFaqs } from "@/lib/content/faqs";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Become a Mentor",
  description:
    "Teach what you know on Remedial One. Apply to become a verified mentor and teach students 1-to-1, on your own schedule.",
  path: "/become-a-mentor",
});

const benefits = [
  { icon: Clock, title: "Flexible teaching", description: "Set your own availability and teach around your schedule." },
  { icon: Globe2, title: "Global students", description: "Teach students in India today, and globally as we expand." },
  { icon: GraduationCap, title: "Your own profile", description: "Showcase your qualifications, subjects, and teaching style." },
  { icon: ShieldCheck, title: "Verified platform", description: "Join a platform built around trust, safety, and quality." },
];

const applicationSteps = [
  { title: "Apply", description: "Share your background, qualifications, and subjects." },
  { title: "Verification", description: "We review your qualifications and teaching experience." },
  { title: "Set up your profile", description: "Add your subjects, classes, languages, and availability." },
  { title: "Start teaching", description: "Go live and start accepting 1-to-1 sessions." },
];

export default function BecomeAMentorPage() {
  return (
    <>
      <Section className="pb-10 pt-10 sm:pt-14">
        <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Become a Mentor", path: "/become-a-mentor" }]} />
        <div className="mt-6">
          <SectionHeading
            as="h1"
            eyebrow="Become a Mentor"
            title="Teach What You Know. Inspire What Comes Next."
            description="Remedial One is built around genuine 1-to-1 mentorship. If you have the qualifications, subject expertise, or teaching experience, we'd love to have you as one of our first mentors."
          />
          <div className="mt-8">
            <Button href="/contact" variant="primary-lime" size="lg">
            Get in touch
          </Button>
          </div>
        </div>
      </Section>

      <Section tone="surface">
        <SectionHeading eyebrow="Why Join" title="What mentors get on Remedial One." />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => (
            <div key={benefit.title} className="flex flex-col gap-4 rounded-2xl border border-border bg-white p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-lime-soft text-ink">
                <benefit.icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              </div>
              <h3 className="text-base font-semibold text-ink">{benefit.title}</h3>
              <p className="text-sm leading-relaxed text-muted">{benefit.description}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeading eyebrow="Application Process" title="How it works to get started." />
        <div className="mt-10">
          <StepsList steps={applicationSteps} />
        </div>
      </Section>

      <Section tone="surface">
        <SectionHeading eyebrow="FAQ" title="Questions from prospective mentors" />
        <div className="mt-8 max-w-3xl">
          <FaqAccordion faqs={becomeMentorFaqs} />
        </div>
      </Section>

      <Section tone="ink">
        <div className="flex flex-col items-center gap-5 text-center">
          <h2 className="max-w-xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Ready to become one of our first mentors?
          </h2>
          <Button href="/contact" variant="primary-lime" size="lg">
            Get in touch
          </Button>
        </div>
      </Section>
    </>
  );
}
