import Link from "next/link";
import {
  Search,
  ClipboardList,
  TrendingUp,
  FileQuestion,
  ListTree,
  BarChart3,
  UserCheck,
  RotateCcw,
} from "lucide-react";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { JsonLd } from "@/components/ui/JsonLd";
import { buildMetadata, serviceJsonLd, faqJsonLd } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Learning Gap Assessment — Diagnostic Student Assessment",
  description:
    "See exactly which chapters and topics a student hasn't grasped yet. Remedial One's learning gap assessment is a topic-level diagnostic that shapes every 1-to-1 mentor session.",
  path: "/learning-gap-assessment",
});

const measures = [
  {
    icon: ListTree,
    title: "Chapter and topic level, not just subject level",
    description: "Instead of 'weak in Math,' the assessment shows exactly which chapter and which topic inside it needs attention.",
  },
  {
    icon: BarChart3,
    title: "Strengths alongside gaps",
    description: "The result isn't only a list of problems. It also shows what a student has already mastered, so sessions don't waste time re-teaching what's solid.",
  },
  {
    icon: UserCheck,
    title: "Reviewed by a mentor, not just auto-scored",
    description: "A qualified mentor reviews assessment results before the first session, so the learning plan reflects real judgment, not just a raw score.",
  },
  {
    icon: RotateCcw,
    title: "Repeatable over time",
    description: "Assessments can be revisited periodically, so progress is measured against the same topic-level baseline, not a different test each time.",
  },
];

const process = [
  {
    icon: FileQuestion,
    title: "Take a topic-level assessment",
    description: "A short, focused assessment for the subject and class in question — not a generic aptitude test.",
  },
  {
    icon: Search,
    title: "Learning gaps get identified",
    description: "Results are broken down by chapter and topic, showing precisely where understanding is solid and where it isn't yet.",
  },
  {
    icon: ClipboardList,
    title: "A mentor builds a personalized plan",
    description: "Instead of a generic curriculum, session focus is set by what the assessment actually found.",
  },
  {
    icon: TrendingUp,
    title: "Progress is tracked against the baseline",
    description: "Chapter, topic, and skill-level progress updates in the student dashboard as sessions continue.",
  },
];

const assessmentFaqs = [
  {
    question: "What is a learning gap assessment?",
    answer:
      "It's a short, topic-level diagnostic assessment that shows exactly which concepts a student has and hasn't grasped in a subject — used to shape 1-to-1 mentor sessions around real gaps instead of a generic syllabus.",
  },
  {
    question: "How is this different from a school test or exam?",
    answer:
      "A school exam is designed to grade a whole class against a syllabus and produce one mark. A learning gap assessment is designed to diagnose one student's specific understanding, chapter by chapter and topic by topic, so a mentor knows exactly what to teach next.",
  },
  {
    question: "Will my child be marked or graded on this?",
    answer:
      "The assessment isn't about a pass/fail score — it's diagnostic. The output that matters is which topics need remedial focus, not a percentage to compare against classmates.",
  },
  {
    question: "How often should a student be assessed?",
    answer:
      "There's no fixed rule, but periodic assessment against the same topic-level baseline is how progress gets measured over time — your mentor will guide the right cadence based on the subject and how the student is progressing.",
  },
  {
    question: "Do I need to take an assessment before every mentor session?",
    answer:
      "No. Assessments are used to establish a baseline and check progress periodically. Most sessions are direct 1-to-1 teaching time, guided by what earlier assessments already told the mentor.",
  },
];

export default function LearningGapAssessmentPage() {
  return (
    <>
      <JsonLd
        data={serviceJsonLd({
          name: "Learning Gap Assessment & Student Diagnostic Assessment",
          description:
            "A topic-level diagnostic student assessment that identifies specific learning gaps and shapes personalized 1-to-1 mentor sessions on Remedial One.",
          path: "/learning-gap-assessment",
        })}
      />
      <JsonLd data={faqJsonLd(assessmentFaqs)} />

      <Section className="pb-10 pt-10 sm:pt-14">
        <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Learning Gap Assessment", path: "/learning-gap-assessment" }]} />
        <div className="mt-6">
          <SectionHeading
            as="h1"
            eyebrow="Student Assessment"
            title="You can't close a gap you can't see."
            description="Before a mentor teaches, Remedial One's learning gap assessment finds out exactly which chapters and topics a student hasn't fully understood — so every session that follows targets something real, not a guess."
          />
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="/book-counselling" variant="primary-lime" size="lg">
              Book a Free Counselling Call
            </Button>
            <Button href="/mentors" variant="secondary-outline" size="lg">
              Find a Mentor
            </Button>
          </div>
        </div>
      </Section>

      <Section tone="surface">
        <SectionHeading
          eyebrow="What a Learning Gap Is"
          title="A learning gap isn't the same thing as a bad grade."
          description="A grade tells you the outcome. A learning gap tells you the cause — the specific concept, buried inside a topic a student otherwise does fine in, that hasn't clicked yet. Two students with the same grade in a subject can have completely different gaps, which is exactly why a generic revision plan often doesn't help either of them."
        />
      </Section>

      <Section>
        <SectionHeading
          eyebrow="What the Assessment Measures"
          title="More than a score."
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {measures.map((item) => (
            <div key={item.title} className="flex flex-col gap-4 rounded-2xl border border-border bg-white p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-lime-soft text-ink">
                <item.icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              </div>
              <h3 className="text-base font-semibold text-ink">{item.title}</h3>
              <p className="text-sm leading-relaxed text-muted">{item.description}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="surface">
        <SectionHeading
          eyebrow="How It Works"
          title="From assessment to a personalized learning plan."
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {process.map((step, index) => (
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
        <div className="mt-8 text-center">
          <Link href="/remedial-classes" className="text-sm font-semibold text-ink underline underline-offset-4">
            See how assessment results turn into remedial classes
          </Link>
        </div>
      </Section>

      <Section>
        <SectionHeading
          eyebrow="Why It Matters"
          title="Personalized learning starts with an honest baseline."
          description="A mentor can only personalize a session as well as they understand the student. That's what makes the assessment the real starting point of a personalized learning journey, not a formality before it."
        />
        <div className="mt-8">
          <Link href="/personalized-learning" className="text-sm font-semibold text-ink underline underline-offset-4">
            Read more about the personalized learning approach
          </Link>
        </div>
      </Section>

      <Section tone="surface">
        <SectionHeading eyebrow="FAQ" title="Questions about the assessment" />
        <div className="mt-8 max-w-3xl">
          <FaqAccordion faqs={assessmentFaqs} />
        </div>
      </Section>

      <Section tone="ink">
        <div className="flex flex-col items-center gap-5 text-center">
          <h2 className="max-w-xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Find the gap before you try to close it.
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            <Button href="/book-counselling" variant="primary-lime" size="lg">
              Book Free Counselling
            </Button>
            <Button
              href="/mentors"
              variant="secondary-outline"
              size="lg"
              className="border-white/20 text-white hover:border-white/40"
            >
              Find a Mentor
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
