import Link from "next/link";
import { CalendarCheck, Search, UserRoundSearch, Video, LineChart, MessageSquareText, ClipboardCheck } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { JsonLd } from "@/components/ui/JsonLd";
import { subjects } from "@/lib/content/subjects";
import { SubjectCard } from "@/components/ui/SubjectCard";
import { skills } from "@/lib/content/skills";
import { SkillCard } from "@/components/ui/SkillCard";
import { generalFaqs } from "@/lib/content/faqs";
import { buildMetadata, serviceJsonLd } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "1-to-1 Tuition — Subjects, Skills, How It Works & Resources",
  description:
    "Everything about personalized 1-to-1 tutoring on Remedial One in one place — how sessions work, every subject and skill available, and practical resources for students and parents.",
  path: "/one-to-one-tuition",
});

const resources = [
  {
    title: "What a learning gap actually is (and why closing it matters)",
    body: "A learning gap isn't the same as a bad grade — it's a specific concept or skill a student hasn't fully understood yet, often hidden inside topics they otherwise do well in. Remedial learning works by finding that exact gap through assessment, rather than re-teaching an entire subject from the beginning.",
  },
  {
    title: "Getting the most out of a 1-to-1 session",
    body: "Come with specific questions, not just 'help me with this chapter.' The more precisely you can describe where you're stuck, the more a mentor can tailor the session to close that exact gap.",
  },
  {
    title: "How to choose the right mentor",
    body: "Look beyond subject match. Consider teaching style, pace, and communication — a mentor who explains things the way you naturally understand them will help more than one with the longest resume.",
  },
  {
    title: "Building a sustainable study routine",
    body: "Short, consistent sessions beat long, irregular ones. Pair your mentor sessions with small daily review blocks so concepts have time to actually settle in.",
  },
  {
    title: "Supporting your child's learning as a parent",
    body: "Ask about what was covered, not just how they scored. Progress in 1-to-1 learning shows up gradually — in confidence and clarity — before it shows up in marks.",
  },
  {
    title: "Balancing academics and skills beyond the classroom",
    body: "Communication and confidence skills compound over time. Treating them with the same regularity as academic subjects — not as an occasional extra — makes the biggest difference.",
  },
];

const subNav = [
  { href: "#how-it-works", label: "How It Works" },
  { href: "#subjects", label: "Subjects" },
  { href: "#skills", label: "Skills" },
  { href: "#resources", label: "Resources" },
];

const relatedPages = [
  { href: "/personalized-learning", label: "What personalized learning means here" },
  { href: "/learning-gap-assessment", label: "How the learning gap assessment works" },
  { href: "/remedial-classes", label: "Remedial classes for a specific gap" },
];

const flow = [
  { icon: Search, title: "Select a subject & class", description: "Start with what you want to learn and your current class level." },
  { icon: UserRoundSearch, title: "Discover a mentor", description: "Browse mentor profiles matched to your subject and goals." },
  { icon: ClipboardCheck, title: "Take a learning gap assessment", description: "A short assessment helps your mentor see exactly which topics need remedial focus before the first session." },
  { icon: CalendarCheck, title: "Book your session", description: "Choose a time that fits your schedule — no fixed batch timing." },
  { icon: Video, title: "Learn online, 1-to-1", description: "Meet your mentor in a focused, dedicated online learning room." },
  { icon: MessageSquareText, title: "Get feedback", description: "Receive mentor feedback after every session." },
  { icon: LineChart, title: "Track your progress", description: "Watch chapter, topic, and skill-level progress build session over session in your dashboard." },
];

const tuitionFaqs = [
  {
    question: "What is a learning gap assessment?",
    answer:
      "It's a short, topic-level assessment mentors use to see exactly which concepts a student has and hasn't grasped, so remedial support can focus on real gaps instead of re-teaching an entire subject.",
  },
  {
    question: "Is this personalized education or just online tutoring?",
    answer:
      "Both. Every session is 1-to-1, and the subject matter, pace, and focus areas are shaped by assessment results and mentor feedback — not a fixed, one-size-fits-all curriculum.",
  },
  {
    question: "Do I need to take an assessment before every session?",
    answer:
      "No. Assessments are used to establish a baseline and periodically track progress; most sessions are direct 1-to-1 teaching time based on what the mentor already knows about your learning gaps.",
  },
];

export default function OneToOneTuitionPage() {
  return (
    <>
      <JsonLd
        data={serviceJsonLd({
          name: "1-to-1 Personalized Tuition & Remedial Education",
          description:
            "Personalized 1-to-1 tutoring that uses student assessment to identify learning gaps and match students with qualified mentors for remedial education and exam preparation.",
          path: "/one-to-one-tuition",
        })}
      />
      <Section className="pb-10 pt-10 sm:pt-14">
        <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "1-to-1 Tuition", path: "/one-to-one-tuition" }]} />
        <div className="mt-6">
          <SectionHeading
            as="h1"
            eyebrow="1-to-1 Tuition"
            title="One Student. One Mentor. One Learning Journey."
            description="Every session on Remedial One is built around a single student and a single mentor. No shared pace, no waiting for a room to catch up — just focused, personalized learning, booked on your schedule."
          />
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="/mentors" variant="primary-lime" size="lg">
              Find a Mentor
            </Button>
            <Button href="#subjects" variant="secondary-outline" size="lg">
              Browse Subjects
            </Button>
          </div>
        </div>
      </Section>

      <nav
        aria-label="On this page"
        className="sticky top-[72px] z-30 border-y border-border bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85"
      >
        <div className="mx-auto flex max-w-7xl flex-wrap gap-1 px-5 py-2.5 sm:px-8 lg:px-10">
          {subNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3.5 py-1.5 text-sm font-medium text-ink/70 transition-colors duration-200 hover:bg-surface hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      <Section id="how-it-works" tone="surface" className="scroll-mt-24">
        <SectionHeading eyebrow="How It Works" title="From subject to session, in seven steps." />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {flow.map((item) => (
            <div key={item.title} className="flex flex-col gap-4 rounded-2xl border border-border bg-white p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink text-lime">
                <item.icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              </div>
              <h3 className="text-base font-semibold text-ink">{item.title}</h3>
              <p className="text-sm leading-relaxed text-muted">{item.description}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section id="subjects" className="scroll-mt-24">
        <SectionHeading eyebrow="Subjects" title="Choose from a growing range of subjects." />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {subjects.map((subject) => (
            <SubjectCard key={subject.slug} subject={subject} />
          ))}
        </div>
      </Section>

      <Section id="skills" tone="surface" className="scroll-mt-24">
        <SectionHeading
          eyebrow="Beyond Academics"
          title="Learn Beyond the Classroom."
          description="Remedial One isn't only about subjects and exams. Mentors also help students build the communication, confidence, and life skills that carry far beyond school."
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {skills.map((skill) => (
            <SkillCard key={skill.slug} skill={skill} />
          ))}
        </div>
      </Section>

      <Section id="resources" className="scroll-mt-24">
        <SectionHeading
          eyebrow="Resources"
          title="Practical guidance for learning well."
          description="Short, practical guidance for students and parents navigating personalized learning."
        />
        <div className="mx-auto mt-10 flex max-w-3xl flex-col gap-6">
          {resources.map((resource) => (
            <article key={resource.title} className="rounded-2xl border border-border bg-white p-6 sm:p-8">
              <h3 className="text-xl font-semibold text-ink">{resource.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">{resource.body}</p>
            </article>
          ))}
        </div>
        <div className="mx-auto mt-8 flex max-w-3xl flex-wrap gap-x-6 gap-y-2">
          {relatedPages.map((page) => (
            <Link
              key={page.href}
              href={page.href}
              className="text-sm font-semibold text-ink underline underline-offset-4"
            >
              {page.label} →
            </Link>
          ))}
        </div>
      </Section>

      <Section tone="surface">
        <SectionHeading eyebrow="FAQ" title="Questions about getting started" />
        <div className="mt-8 max-w-3xl">
          <FaqAccordion faqs={[...tuitionFaqs, ...generalFaqs]} />
        </div>
      </Section>

      <Section tone="ink">
        <div className="flex flex-col items-center gap-5 text-center">
          <h2 className="max-w-xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Your learning, on your terms.
          </h2>
          <Button href="/mentors" variant="primary-lime" size="lg">
            Find Your Mentor
          </Button>
        </div>
      </Section>
    </>
  );
}
