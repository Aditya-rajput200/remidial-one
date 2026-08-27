import { BookMarked, Landmark, Scale, Sparkles } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Knowledge & Values",
  description:
    "Educational, respectful, age-appropriate learning on Indian heritage, history, and everyday ethics — presented as perspective, not preaching.",
  path: "/knowledge",
});

const topics = [
  {
    icon: BookMarked,
    title: "Stories & Epics",
    description:
      "Age-appropriate explorations of stories from the Ramayana, Mahabharata, and Bhagavad Gita — framed as narrative and perspective, not doctrine.",
  },
  {
    icon: Landmark,
    title: "Historical Knowledge",
    description:
      "Context and events from Indian and world history, taught to build understanding rather than memorized dates.",
  },
  {
    icon: Scale,
    title: "Ethics & Life Lessons",
    description:
      "Everyday ethical reasoning and life lessons drawn from stories, history, and lived experience.",
  },
  {
    icon: Sparkles,
    title: "Cultural Knowledge",
    description:
      "Respectful, inclusive learning about cultural traditions and heritage that shape identity and perspective.",
  },
];

export default function KnowledgePage() {
  return (
    <>
      <Section className="pb-10 pt-10 sm:pt-14">
        <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Knowledge & Values", path: "/knowledge" }]} />
        <div className="mt-6">
          <SectionHeading
            eyebrow="Knowledge, Values & Perspective"
            title="Learning that goes beyond the syllabus."
            description="Alongside academics, Remedial One introduces students to knowledge, values, and cultural perspective — presented respectfully, age-appropriately, and inclusively, never as religious or political instruction."
          />
        </div>
      </Section>

      <Section tone="surface" className="pt-0">
        <div className="grid gap-6 sm:grid-cols-2">
          {topics.map((topic) => (
            <div key={topic.title} className="flex flex-col gap-4 rounded-2xl border border-border bg-white p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-lime-soft text-ink">
                <topic.icon className="h-6 w-6" strokeWidth={1.75} aria-hidden />
              </div>
              <h3 className="text-xl font-semibold text-ink">{topic.title}</h3>
              <p className="text-sm leading-relaxed text-muted sm:text-base">{topic.description}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeading
          eyebrow="Our Approach"
          title="Perspective, not preaching."
          description="Every module is designed to build understanding and reflection, not to promote a single belief system. Content is written to be respectful of every student's background."
        />
      </Section>

      <Section tone="ink">
        <div className="flex flex-col items-center gap-5 text-center">
          <h2 className="max-w-xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Learning that shapes character, not just report cards.
          </h2>
          <Button href="/mentors" variant="primary-lime" size="lg">
            Find a Mentor
          </Button>
        </div>
      </Section>
    </>
  );
}
