import Link from "next/link";
import {
  Check,
  X as XIcon,
  Gauge,
  Target,
  Sparkles,
  LineChart,
  Search,
  UsersRound,
  RefreshCcw,
} from "lucide-react";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { JsonLd } from "@/components/ui/JsonLd";
import { buildMetadata, serviceJsonLd, faqJsonLd } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Personalized Learning for Students — One Student, One Mentor",
  description:
    "Personalized learning at Remedial One means a mentor teaches to one student's pace, goals, and learning gaps — not a fixed curriculum built for a room of thirty.",
  path: "/personalized-learning",
});

const pillars = [
  {
    icon: Search,
    title: "Starts from an assessment, not an assumption",
    description: "A learning gap assessment shows what a student actually knows before a mentor decides what to teach next.",
  },
  {
    icon: Gauge,
    title: "Paced to how the student learns",
    description: "Some concepts need five minutes, others need three sessions. Personalized learning means the pace bends to the student, not the other way round.",
  },
  {
    icon: Target,
    title: "Built around real goals",
    description: "Board exam, a specific weak subject, or building confidence in a skill — sessions are shaped by what the student is actually trying to achieve.",
  },
  {
    icon: LineChart,
    title: "Adjusted as progress happens",
    description: "A learning plan isn't fixed on day one. As chapter and topic-level progress is tracked, the plan is revisited and adjusted.",
  },
];

const comparisonBatch = [
  "One pace set for the whole room",
  "Curriculum fixed regardless of individual gaps",
  "Limited time per student per session",
  "Progress measured mainly by test scores",
];

const comparisonPersonalized = [
  "Pace set by how one student actually learns",
  "Sessions shaped by that student's assessed gaps",
  "A full session, one mentor, one student",
  "Progress tracked chapter by chapter, topic by topic",
];

const journey = [
  {
    icon: Search,
    title: "Understand the student",
    description: "A learning gap assessment establishes where a student actually stands, subject by subject.",
  },
  {
    icon: UsersRound,
    title: "Match the right mentor",
    description: "Mentors are matched by subject expertise and teaching style, not just availability.",
  },
  {
    icon: Sparkles,
    title: "Personalize the sessions",
    description: "Each session is planned around the student's pace, goals, and the gaps the assessment found.",
  },
  {
    icon: RefreshCcw,
    title: "Track and adjust",
    description: "Progress is reviewed regularly, and the plan changes as the student's needs change.",
  },
];

const personalizedFaqs = [
  {
    question: "What does personalized learning actually mean at Remedial One?",
    answer:
      "It means a mentor's teaching is shaped by one student's assessed learning gaps, pace, and goals — not a fixed curriculum designed for a room of students moving at the same speed.",
  },
  {
    question: "Is personalized learning only useful for students who are struggling?",
    answer:
      "No. A learning gap assessment can also show where a student is ahead and ready to move faster, or where they need a different kind of challenge — personalized learning adapts either way, not just for remedial support.",
  },
  {
    question: "How is this different from a private tutor who already teaches 1-to-1?",
    answer:
      "1-to-1 attention is part of it, but personalization goes further — sessions are planned around assessment results and tracked progress, not just delivered one-on-one using the same generic lesson plan a tutor would use for any student.",
  },
  {
    question: "Does personalized learning replace school?",
    answer:
      "No. It's designed to work alongside school — closing specific gaps, building confidence, and supporting exam preparation around what a student is already studying in class.",
  },
];

export default function PersonalizedLearningPage() {
  return (
    <>
      <JsonLd
        data={serviceJsonLd({
          name: "Personalized Learning Programs for Students",
          description:
            "Personalized 1-to-1 learning that adapts to a student's assessed learning gaps, pace, and goals, guided by a qualified mentor.",
          path: "/personalized-learning",
        })}
      />
      <JsonLd data={faqJsonLd(personalizedFaqs)} />

      <Section className="pb-10 pt-10 sm:pt-14">
        <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Personalized Learning", path: "/personalized-learning" }]} />
        <div className="mt-6">
          <SectionHeading
            as="h1"
            eyebrow="Personalized Learning"
            title="One student. One pace. One plan built around them."
            description="Personalized learning isn't a slogan on Remedial One — it's what happens when a mentor teaches to an assessed learning gap and a real goal, instead of a syllabus timetable built for a room of thirty."
          />
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="/mentors" variant="primary-lime" size="lg">
              Find Your Mentor
            </Button>
            <Button href="/learning-gap-assessment" variant="secondary-outline" size="lg">
              Start With an Assessment
            </Button>
          </div>
        </div>
      </Section>

      <Section tone="surface">
        <SectionHeading eyebrow="What Makes It Personalized" title="Four things that have to be true for learning to be genuinely personal." />
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {pillars.map((pillar) => (
            <div key={pillar.title} className="flex flex-col gap-4 rounded-2xl border border-border bg-white p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-lime-soft text-ink">
                <pillar.icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              </div>
              <h3 className="text-base font-semibold text-ink">{pillar.title}</h3>
              <p className="text-sm leading-relaxed text-muted">{pillar.description}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeading
          eyebrow="Personalized vs. Batch Learning"
          title="A classroom is built for the average student. Personalized learning is built for this one."
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-surface p-8">
            <h3 className="mb-6 text-sm font-semibold uppercase tracking-wide text-muted">
              Batch / classroom learning
            </h3>
            <ul className="flex flex-col gap-4">
              {comparisonBatch.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-muted">
                  <XIcon className="mt-0.5 h-4 w-4 shrink-0 text-muted-2" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-ink bg-ink p-8">
            <h3 className="mb-6 text-sm font-semibold uppercase tracking-wide text-lime">
              Personalized learning
            </h3>
            <ul className="flex flex-col gap-4">
              {comparisonPersonalized.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-white">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-lime" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section tone="surface">
        <SectionHeading eyebrow="The Journey" title="How a personalized learning journey actually starts." />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {journey.map((step, index) => (
            <div key={step.title} className="flex flex-col gap-4 rounded-2xl border border-border bg-white p-6">
              <span className="text-sm font-bold text-lime-ink">{String(index + 1).padStart(2, "0")}</span>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink text-lime">
                <step.icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              </div>
              <h3 className="text-base font-semibold text-ink">{step.title}</h3>
              <p className="text-sm leading-relaxed text-muted">{step.description}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeading
          eyebrow="Where It's Used"
          title="Personalized learning across academics and skills beyond the classroom."
          description="The same personalized approach applies whether the goal is closing a specific subject gap, preparing for a board exam, or building communication and confidence skills."
        />
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/remedial-classes" className="text-sm font-semibold text-ink underline underline-offset-4">
            Personalized learning for closing a specific gap →
          </Link>
          <Link href="/classes" className="text-sm font-semibold text-ink underline underline-offset-4">
            Explore learning by class →
          </Link>
        </div>
      </Section>

      <Section tone="surface">
        <SectionHeading eyebrow="FAQ" title="Questions about personalized learning" />
        <div className="mt-8 max-w-3xl">
          <FaqAccordion faqs={personalizedFaqs} />
        </div>
      </Section>

      <Section tone="ink">
        <div className="flex flex-col items-center gap-5 text-center">
          <h2 className="max-w-xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Your learning journey starts with one student: you.
          </h2>
          <Button href="/mentors" variant="primary-lime" size="lg">
            Find Your Mentor
          </Button>
        </div>
      </Section>
    </>
  );
}
