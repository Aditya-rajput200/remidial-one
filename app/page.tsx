import Link from "next/link";
import {
  ShieldCheck,
  Clock,
  Globe2,
  Target,
  GraduationCap,
  Heart,
  Check,
  X as XIcon,
  UsersRound,
  ArrowRight,
} from "lucide-react";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { VideoHero } from "@/components/ui/VideoHero";
import { SubjectCard } from "@/components/ui/SubjectCard";
import { SkillCard } from "@/components/ui/SkillCard";
import { ClassBandCard } from "@/components/ui/ClassBandCard";
import { MentorCard } from "@/components/ui/MentorCard";
import { StepsList } from "@/components/ui/StepsList";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Marquee } from "@/components/ui/Marquee";
import { PromoBanner } from "@/components/ui/PromoBanner";
import { BannerSlot } from "@/components/ui/BannerSlot";
import { subjects } from "@/lib/content/subjects";
import { classBands } from "@/lib/content/classes";
import { skills } from "@/lib/content/skills";
import { mentorPreviews } from "@/lib/content/mentors";
import { generalFaqs } from "@/lib/content/faqs";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Remedial One — One Student. One Mentor. One Learning Journey.",
  description:
    "Personalized 1-to-1 learning from qualified mentors. Academic subjects, exam preparation, and skills beyond the classroom — paced around how you actually learn.",
  path: "/",
});

const trustPoints = [
  { icon: GraduationCap, label: "Qualified Mentors", description: "Every mentor is reviewed before they teach." },
  { icon: Target, label: "Personalized Learning", description: "Sessions built around your goals and pace." },
  { icon: Clock, label: "Flexible Sessions", description: "Book hours that actually fit your schedule." },
  { icon: ShieldCheck, label: "Safe Environment", description: "Verified mentors and responsible session design." },
  { icon: Globe2, label: "Global Accessibility", description: "Built to learn from anywhere, in any time zone." },
];

const comparisonTraditional = [
  "Same pace for everyone",
  "One-size-fits-all teaching",
  "Limited personal attention",
  "Fixed batch timetables",
];

const comparisonRemedial = [
  "Your own mentor, every session",
  "Learning paced to how you understand",
  "Personalized, goal-based sessions",
  "Flexible scheduling that fits your life",
];

const tuitionHighlights = [
  "Choose your subject and class level",
  "Discover mentors matched to your goals",
  "Book sessions on your own schedule",
  "Learn 1-to-1 in a dedicated online room",
  "Track progress after every session",
];

const steps = [
  { title: "Tell us what you want to learn", description: "Share your subject, class, and learning goals." },
  { title: "Discover the right mentor", description: "Browse mentors matched to your needs and pace." },
  { title: "Book your session", description: "Pick a time that fits your schedule, not a fixed batch." },
  { title: "Learn 1-to-1", description: "Meet your mentor in a focused, dedicated online session." },
  { title: "Track your progress", description: "See growth after every session, not just at exam time." },
];

const trustStatements = [
  {
    icon: ShieldCheck,
    title: "Built on verification",
    description: "Mentors are reviewed for qualifications and subject expertise before they teach.",
  },
  {
    icon: Heart,
    title: "Designed for genuine care",
    description: "Every session is one mentor, one student — attention isn't shared across a room.",
  },
  {
    icon: UsersRound,
    title: "Visible to parents",
    description: "Progress, sessions, and feedback stay transparent, not hidden behind a black box.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <Section className="pt-14 pb-16 sm:pt-20 lg:pt-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div className="flex flex-col gap-6">
            <Badge>Personalized 1-to-1 Learning</Badge>
            <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-6xl">
              Learning, Designed Around You.
            </h1>
            <p className="max-w-lg text-lg leading-relaxed text-muted">
              Get personalized 1-to-1 learning from qualified mentors who understand your
              goals, your pace, and the way you learn.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button href="/mentors" variant="primary-lime" size="lg">
                Find Your Mentor
              </Button>
              <Button href="/one-to-one-tuition" variant="secondary-outline" size="lg">
                Explore Learning
              </Button>
            </div>
          </div>
          <VideoHero />
        </div>
      </Section>

      {/* Trust / value proposition */}
      <Section tone="surface" className="py-14 sm:py-16">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
          {trustPoints.map((point) => (
            <div key={point.label} className="flex flex-col items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-ink shadow-card">
                <point.icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold text-ink">{point.label}</p>
                <p className="text-xs leading-relaxed text-muted">{point.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Subject ticker */}
      <Marquee items={subjects.map((subject) => subject.name)} />

      {/* Why Remedial One */}
      <Section>
        <ScrollReveal>
          <SectionHeading
            eyebrow="Why Remedial One"
            title="A different kind of learning experience."
            description="Traditional classes are built for a room. Remedial One is built for one student — you."
          />
        </ScrollReveal>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          <ScrollReveal className="rounded-2xl border border-border bg-surface p-8">
            <h3 className="mb-6 text-sm font-semibold uppercase tracking-wide text-muted">
              Traditional learning
            </h3>
            <ul className="flex flex-col gap-4">
              {comparisonTraditional.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-muted">
                  <XIcon className="mt-0.5 h-4 w-4 shrink-0 text-muted-2" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </ScrollReveal>
          <ScrollReveal delay={100} className="rounded-2xl border border-ink bg-ink p-8">
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
          </ScrollReveal>
        </div>
      </Section>

      {/* Promo banner — learn from anywhere */}
      <Section className="py-10 sm:py-12">
        <ScrollReveal>
          <PromoBanner
            eyebrow="Learn From Anywhere"
            title="Your mentor, wherever you are."
            description="Sessions happen in a dedicated online learning room — no commute, no fixed location. Just you, your mentor, and a focused hour built around your goals."
            ctaLabel="See How Sessions Work"
            ctaHref="/how-it-works"
            imageSide="right"
          />
        </ScrollReveal>
      </Section>

      {/* 1-to-1 Tuition */}
      <Section tone="surface">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          <ScrollReveal>
            <SectionHeading
              eyebrow="1-to-1 Tuition"
              title="One Student. One Mentor. One Learning Journey."
              description="Book personalized learning sessions with qualified mentors on an hourly, session-by-session basis — no batches, no fixed pace."
            />
            <div className="mt-8">
              <Button href="/one-to-one-tuition" variant="primary-black" size="lg">
                Find a Mentor
              </Button>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={100}>
            <ul className="flex flex-col gap-4 rounded-2xl border border-border bg-white p-6 sm:p-8">
              {tuitionHighlights.map((item, index) => (
                <li key={item} className="flex items-start gap-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-lime-soft text-xs font-bold text-lime-ink">
                    {index + 1}
                  </span>
                  <span className="pt-0.5 text-sm text-ink sm:text-base">{item}</span>
                </li>
              ))}
            </ul>
          </ScrollReveal>
        </div>
      </Section>

      {/* Class / Grade exploration */}
      <Section>
        <ScrollReveal>
          <SectionHeading
            eyebrow="By Class"
            title="Find learning built for your grade."
            description="From foundation years to board-exam preparation, sessions are structured around where you actually are."
          />
        </ScrollReveal>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {classBands.map((band, index) => (
            <ScrollReveal key={band.slug} delay={index * 80}>
              <ClassBandCard band={band} />
            </ScrollReveal>
          ))}
        </div>
      </Section>

      {/* Subjects */}
      <Section tone="surface">
        <ScrollReveal>
          <SectionHeading
            eyebrow="Subjects"
            title="Explore subjects taught 1-to-1."
            description="Core academics and beyond, each with mentors who genuinely know the subject."
          />
        </ScrollReveal>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {subjects.slice(0, 8).map((subject, index) => (
            <ScrollReveal key={subject.slug} delay={(index % 4) * 60}>
              <SubjectCard subject={subject} />
            </ScrollReveal>
          ))}
        </div>
        <div className="mt-10 flex justify-center">
          <Button href="/subjects" variant="secondary-outline" size="lg">
            View All Subjects
          </Button>
        </div>
      </Section>

      {/* Campaign banner slot */}
      <Section className="py-10 sm:py-12">
        <ScrollReveal>
          <BannerSlot label="Campaign banner" recommendedSize="Recommended: 1600 × 480" />
        </ScrollReveal>
      </Section>

      {/* Mentors */}
      <Section>
        <ScrollReveal>
          <SectionHeading
            eyebrow="Mentors"
            title="Meet Your Mentors"
            description="Mentor applications are open. Here's a preview of how mentor profiles will look once they go live."
          />
        </ScrollReveal>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {mentorPreviews.map((mentor, index) => (
            <ScrollReveal key={mentor.slug} delay={index * 80}>
              <MentorCard mentor={mentor} />
            </ScrollReveal>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button href="/mentors" variant="secondary-outline" size="lg">
            View All Mentors
          </Button>
          <Button href="/become-a-mentor" variant="ghost" size="lg">
            Become a Mentor
          </Button>
        </div>
      </Section>

      {/* Bold mid-page CTA in brand green */}
      <Section tone="lime" className="py-14 sm:py-16">
        <div className="flex flex-col items-center gap-5 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1 text-xs font-semibold uppercase tracking-wide text-lime">
            Start Today
          </span>
          <h2 className="max-w-xl text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            You&apos;re one mentor away from your next milestone.
          </h2>
          <Button href="/mentors" variant="primary-black" size="lg" className="gap-2">
            Find Your Mentor
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      </Section>

      {/* Skills beyond academics */}
      <Section tone="ink">
        <ScrollReveal>
          <SectionHeading
            eyebrow="Beyond Academics"
            title="Learn Beyond the Classroom."
            description="Communication, confidence, and life skills — built through the same 1-to-1 approach."
            tone="white"
          />
        </ScrollReveal>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {skills.slice(0, 8).map((skill, index) => (
            <ScrollReveal key={skill.slug} delay={(index % 4) * 60}>
              <SkillCard skill={skill} />
            </ScrollReveal>
          ))}
        </div>
        <div className="mt-10 flex justify-center">
          <Button href="/skills" variant="primary-lime" size="lg">
            Explore Skills
          </Button>
        </div>
      </Section>

      {/* Knowledge & Values */}
      <Section tone="surface">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
          <ScrollReveal>
            <SectionHeading
              eyebrow="Knowledge, Values & Perspective"
              title="Learning that goes beyond the syllabus."
              description="Stories, history, and values-based learning — from Indian heritage to everyday ethics — presented respectfully and age-appropriately."
            />
            <div className="mt-8">
              <Button href="/knowledge" variant="primary-black" size="lg">
                Explore Knowledge & Values
              </Button>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={100} className="rounded-3xl border border-border bg-white p-8 sm:p-10">
            <p className="text-lg leading-relaxed text-ink">
              &ldquo;Education isn&apos;t only about marks — it&apos;s about understanding who
              you are, where you come from, and how to carry that forward.&rdquo;
            </p>
            <p className="mt-4 text-sm font-medium text-muted">The Remedial One approach</p>
          </ScrollReveal>
        </div>
      </Section>

      {/* Promo banner — for parents */}
      <Section className="py-10 sm:py-12">
        <ScrollReveal>
          <PromoBanner
            eyebrow="For Parents"
            title="Visibility into every step of the journey."
            description="See session history, mentor feedback, and subject-wise progress — so you always know how learning is actually going, not just what the report card says."
            ctaLabel="Learn More"
            ctaHref="/about"
            imageSide="left"
            imageLabel="Parent dashboard preview placeholder"
          />
        </ScrollReveal>
      </Section>

      {/* How it works */}
      <Section>
        <ScrollReveal>
          <SectionHeading
            eyebrow="How It Works"
            title="Getting started takes five simple steps."
            align="center"
          />
        </ScrollReveal>
        <div className="mt-10">
          <StepsList steps={steps} />
        </div>
      </Section>

      {/* Trust section (replaces fabricated testimonials) */}
      <Section tone="surface">
        <ScrollReveal>
          <SectionHeading
            eyebrow="Why Families Trust Us"
            title="What guides every session."
            align="center"
          />
        </ScrollReveal>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {trustStatements.map((item, index) => (
            <ScrollReveal
              key={item.title}
              delay={index * 80}
              className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-white p-8 text-center"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-lime-soft text-ink">
                <item.icon className="h-6 w-6" strokeWidth={1.75} aria-hidden />
              </div>
              <h3 className="text-lg font-semibold text-ink">{item.title}</h3>
              <p className="text-sm leading-relaxed text-muted">{item.description}</p>
            </ScrollReveal>
          ))}
        </div>
      </Section>

      {/* FAQ */}
      <Section>
        <ScrollReveal>
          <SectionHeading eyebrow="FAQ" title="Common questions, answered." align="center" />
        </ScrollReveal>
        <div className="mx-auto mt-10 max-w-3xl">
          <FaqAccordion faqs={generalFaqs.slice(0, 5)} />
        </div>
        <div className="mt-8 flex justify-center">
          <Link href="/faq" className="text-sm font-semibold text-ink underline underline-offset-4">
            View all FAQs
          </Link>
        </div>
      </Section>

      {/* Final CTA */}
      <Section tone="ink">
        <div className="flex flex-col items-center gap-6 text-center">
          <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Your Learning Journey Starts With One Step.
          </h2>
          <p className="max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
            Find the right mentor, learn at your own pace, and build the skills that take
            you further.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Button href="/signup" variant="primary-lime" size="lg">
              Get Started
            </Button>
            <Button
              href="/mentors"
              variant="secondary-outline"
              size="lg"
              className="border-white/20 text-white hover:border-white/40"
            >
              Explore Mentors
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
