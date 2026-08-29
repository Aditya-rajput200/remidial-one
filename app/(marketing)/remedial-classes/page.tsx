import Link from "next/link";
import {
  Search,
  ClipboardList,
  TrendingUp,
  Check,
  X as XIcon,
  AlertCircle,
  BookOpen,
  Repeat,
  MessageSquareWarning,
  Clock3,
} from "lucide-react";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { JsonLd } from "@/components/ui/JsonLd";
import { StepsList } from "@/components/ui/StepsList";
import { generalFaqs } from "@/lib/content/faqs";
import { buildMetadata, serviceJsonLd, faqJsonLd } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Remedial Classes Online — Personalized 1-to-1 Remedial Teaching",
  description:
    "Remedial classes with Remedial One start with a learning gap assessment, then pair your child with a 1-to-1 mentor for focused remedial teaching — online, from anywhere.",
  path: "/remedial-classes",
});

const signs = [
  {
    icon: Repeat,
    title: "The same mistakes keep coming back",
    description: "A student keeps getting a type of question wrong even after it's explained — usually a sign the concept underneath was never fully understood, not just forgotten.",
  },
  {
    icon: AlertCircle,
    title: "Grades don't match effort",
    description: "Hours of studying producing inconsistent results is a common signal of a specific, hidden learning gap rather than a lack of effort.",
  },
  {
    icon: MessageSquareWarning,
    title: "Avoiding a subject or topic",
    description: "Reluctance to start homework in one subject, or going quiet when a certain topic comes up, often points to a concept the student never got comfortable with.",
  },
  {
    icon: Clock3,
    title: "Falling behind after time away",
    description: "A gap after illness, a school transfer, or a missed unit can compound quietly — each new chapter builds on the one the student never fully caught up on.",
  },
];

const process = [
  {
    icon: Search,
    title: "Assess, don't assume",
    description: "A chapter- and topic-level learning gap assessment shows exactly which concepts need remedial attention, instead of guessing which chapter to re-teach.",
  },
  {
    icon: ClipboardList,
    title: "Match a mentor to the gap",
    description: "A qualified 1-to-1 mentor reviews the assessment and builds sessions around the specific concepts that need remedial teaching — not the whole syllabus again.",
  },
  {
    icon: TrendingUp,
    title: "Track the gap closing",
    description: "Chapter and topic-level progress updates after every session, so you can see the specific gap narrowing, not just wait for the next report card.",
  },
];

const comparisonGeneric = [
  "Repeats the whole chapter or subject",
  "Same pace and material as a group batch",
  "No clear way to see which concept was the problem",
  "Extra classes added on top of an already full schedule",
];

const comparisonRemedial = [
  "Targets the exact concept behind the gap",
  "Paced to how this student learns, 1-to-1",
  "Starts from an assessment, not a guess",
  "One focused mentor, session by session",
];

const remedialFaqs = [
  {
    question: "What is remedial teaching, exactly?",
    answer:
      "Remedial teaching is focused instruction aimed at a specific concept or skill a student hasn't fully grasped — a learning gap — rather than a general repeat of an entire subject or chapter. It's diagnostic first, then targeted.",
  },
  {
    question: "Does 'remedial' mean my child is behind or weak?",
    answer:
      "No. A learning gap is normal and specific — it can happen to a strong student in one topic within a subject they're otherwise good at. Remedial teaching just means finding that exact concept and closing it, not labeling the student.",
  },
  {
    question: "How are remedial classes on Remedial One different from a regular tuition class?",
    answer:
      "Regular tuition often follows a fixed syllabus at a group pace. Remedial classes on Remedial One start with a learning gap assessment, then a mentor builds 1-to-1 sessions specifically around the concepts that assessment surfaces.",
  },
  {
    question: "Are these remedial classes held online?",
    answer:
      "Yes. Every remedial session happens 1-to-1 in a dedicated online learning room, so a student can get focused remedial teaching from a qualified mentor from anywhere, without needing a class 'near me.'",
  },
];

export default function RemedialClassesPage() {
  return (
    <>
      <JsonLd
        data={serviceJsonLd({
          name: "Remedial Classes & 1-to-1 Remedial Teaching",
          description:
            "Assessment-led remedial classes that identify a student's specific learning gaps and close them through personalized 1-to-1 remedial teaching with a qualified mentor.",
          path: "/remedial-classes",
        })}
      />
      <JsonLd data={faqJsonLd(remedialFaqs)} />

      <Section className="pb-10 pt-10 sm:pt-14">
        <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Remedial Classes", path: "/remedial-classes" }]} />
        <div className="mt-6">
          <SectionHeading
            as="h1"
            eyebrow="Remedial Classes"
            title="Remedial classes built around one student's actual gaps."
            description="Not every struggling topic needs a whole subject re-taught. Remedial One's remedial classes start with a learning gap assessment, then pair a student with a 1-to-1 mentor who teaches to the specific concept that needs it — online, from anywhere."
          />
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="/mentors" variant="primary-lime" size="lg">
              Find a Remedial Mentor
            </Button>
            <Button href="/learning-gap-assessment" variant="secondary-outline" size="lg">
              See How Assessment Works
            </Button>
          </div>
        </div>
      </Section>

      <Section tone="surface">
        <SectionHeading
          eyebrow="Signs to Look For"
          title="How to tell a learning gap needs remedial attention."
          description="Learning gaps rarely announce themselves as a single bad test score. A few patterns are worth watching for."
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {signs.map((sign) => (
            <div key={sign.title} className="flex flex-col gap-4 rounded-2xl border border-border bg-white p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-lime-soft text-ink">
                <sign.icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              </div>
              <h3 className="text-base font-semibold text-ink">{sign.title}</h3>
              <p className="text-sm leading-relaxed text-muted">{sign.description}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeading
          eyebrow="How It Works"
          title="Remedial teaching, assessment-led."
          description="Three steps from 'something isn't clicking' to a visible, closing gap."
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {process.map((step) => (
            <div key={step.title} className="flex flex-col gap-4 rounded-2xl border border-border bg-white p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink text-lime">
                <step.icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              </div>
              <h3 className="text-base font-semibold text-ink">{step.title}</h3>
              <p className="text-sm leading-relaxed text-muted">{step.description}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link href="/learning-gap-assessment" className="text-sm font-semibold text-ink underline underline-offset-4">
            Read more about how the learning gap assessment works
          </Link>
        </div>
      </Section>

      <Section tone="surface">
        <SectionHeading
          eyebrow="Remedial Classes vs. Generic Extra Classes"
          title="More classes isn't always the fix. The right class is."
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-white p-8">
            <h3 className="mb-6 text-sm font-semibold uppercase tracking-wide text-muted">
              Generic extra classes
            </h3>
            <ul className="flex flex-col gap-4">
              {comparisonGeneric.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-muted">
                  <XIcon className="mt-0.5 h-4 w-4 shrink-0 text-muted-2" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-ink bg-ink p-8">
            <h3 className="mb-6 text-sm font-semibold uppercase tracking-wide text-lime">
              Remedial One
            </h3>
            <ul className="flex flex-col gap-4">
              {comparisonRemedial.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-white">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-lime" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section>
        <SectionHeading
          eyebrow="Who It's For"
          title="Remedial teaching across classes 5–12 and every core subject."
          description="Remedial classes work the same way whether the gap is in one chapter of one subject or spread across a term — the assessment finds it, the mentor closes it."
        />
        <div className="mt-10">
          <StepsList
            steps={[
              { title: "Take the assessment", description: "A short, topic-level assessment for the subject in question." },
              { title: "Get matched", description: "A mentor reviews the results and plans the first session around them." },
              { title: "Learn 1-to-1", description: "Focused remedial sessions in a dedicated online room, on your schedule." },
              { title: "See the gap close", description: "Progress tracked at the chapter and topic level, session over session." },
            ]}
          />
        </div>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button href="/classes" variant="secondary-outline" size="lg">
            Browse by Class
          </Button>
          <Button href="/one-to-one-tuition#subjects" variant="secondary-outline" size="lg">
            Browse Subjects
          </Button>
        </div>
      </Section>

      <Section tone="surface">
        <SectionHeading eyebrow="FAQ" title="Questions about remedial classes" />
        <div className="mt-8 max-w-3xl">
          <FaqAccordion faqs={[...remedialFaqs, ...generalFaqs.slice(0, 2)]} />
        </div>
      </Section>

      <Section tone="ink">
        <div className="flex flex-col items-center gap-5 text-center">
          <BookOpen className="h-8 w-8 text-lime" aria-hidden />
          <h2 className="max-w-xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Find the gap. Close the gap. One mentor at a time.
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            <Button href="/mentors" variant="primary-lime" size="lg">
              Find a Mentor
            </Button>
            <Button
              href="/book-counselling"
              variant="secondary-outline"
              size="lg"
              className="border-white/20 text-white hover:border-white/40"
            >
              Book Free Counselling
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
