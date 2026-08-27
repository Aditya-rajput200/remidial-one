import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { iconMap } from "@/lib/icon-map";
import { subjects, getSubjectBySlug } from "@/lib/content/subjects";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { JsonLd } from "@/components/ui/JsonLd";
import { buildMetadata, courseJsonLd } from "@/lib/seo";

export function generateStaticParams() {
  return subjects.map((subject) => ({ subject: subject.slug }));
}

export async function generateMetadata(props: PageProps<"/subjects/[subject]">) {
  const { subject: slug } = await props.params;
  const subject = getSubjectBySlug(slug);
  if (!subject) return buildMetadata({ title: "Subject", description: "", path: "/subjects" });

  return buildMetadata({
    title: `${subject.name} Tuition — 1-to-1 Mentoring`,
    description: `${subject.shortDescription} Personalized 1-to-1 ${subject.name} sessions with qualified mentors.`,
    path: `/subjects/${subject.slug}`,
  });
}

const subjectFaqs = (name: string) => [
  {
    question: `How do 1-to-1 ${name} sessions work?`,
    answer: `You're matched with a mentor for ${name}, then book sessions at times that fit your schedule. Every session is one mentor, one student — paced around what you actually need.`,
  },
  {
    question: `Can sessions be adjusted to my level?`,
    answer:
      "Yes. Mentors adapt pace and depth based on where you're genuinely starting from, not a fixed classroom timeline.",
  },
  {
    question: "Is progress tracked over time?",
    answer:
      "Every session contributes to a visible progress record in your dashboard, including mentor feedback.",
  },
];

export default async function SubjectPage(props: PageProps<"/subjects/[subject]">) {
  const { subject: slug } = await props.params;
  const subject = getSubjectBySlug(slug);

  if (!subject) {
    notFound();
  }

  const Icon = iconMap[subject.icon];

  return (
    <>
      <JsonLd
        data={courseJsonLd({
          name: `${subject.name} — 1-to-1 Tuition`,
          description: subject.shortDescription,
          path: `/subjects/${subject.slug}`,
        })}
      />

      <Section className="pb-10 pt-10 sm:pt-14">
        <Breadcrumbs
          items={[
            { name: "Home", path: "/" },
            { name: "Subjects", path: "/subjects" },
            { name: subject.name, path: `/subjects/${subject.slug}` },
          ]}
        />
        <div className="mt-6 flex flex-col gap-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-lime-soft text-ink">
            <Icon className="h-7 w-7" strokeWidth={1.75} aria-hidden />
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            {subject.name} Tuition, 1-to-1.
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-muted">
            {subject.shortDescription}
          </p>
          <div className="flex flex-wrap gap-2">
            {subject.classesCovered.map((cls) => (
              <Badge key={cls} tone="outline">
                {cls}
              </Badge>
            ))}
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button href="/mentors" variant="primary-lime" size="lg">
              Find a {subject.name} Mentor
            </Button>
            <Button href="/how-it-works" variant="secondary-outline" size="lg">
              How Sessions Work
            </Button>
          </div>
        </div>
      </Section>

      <Section tone="surface">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading title="What you'll learn" />
            <ul className="mt-6 flex flex-col gap-3">
              {subject.whatYouLearn.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-ink sm:text-base">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-lime-ink" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <SectionHeading title="What you'll gain" />
            <ul className="mt-6 flex flex-col gap-3">
              {subject.outcomes.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-ink sm:text-base">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-lime-ink" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section>
        <SectionHeading
          eyebrow="Why 1-to-1"
          title={`The ${subject.name} advantage of learning one-on-one.`}
          description="No shared pace, no waiting for a room full of students to catch up. Just focused time with a mentor who adapts to you."
        />
        <div className="mt-8">
          <Button href="/one-to-one-tuition" variant="primary-black" size="lg">
            Explore 1-to-1 Tuition
          </Button>
        </div>
      </Section>

      <Section tone="surface">
        <SectionHeading eyebrow="FAQ" title="Questions about this subject" />
        <div className="mt-8 max-w-3xl">
          <FaqAccordion faqs={subjectFaqs(subject.name)} />
        </div>
      </Section>

      <Section tone="ink">
        <div className="flex flex-col items-center gap-5 text-center">
          <h2 className="max-w-xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Ready to start learning {subject.name}?
          </h2>
          <Button href="/mentors" variant="primary-lime" size="lg">
            Find Your Mentor
          </Button>
        </div>
      </Section>
    </>
  );
}
