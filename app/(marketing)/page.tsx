import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  Clock,
  Globe2,
  Target,
  GraduationCap,
  Heart,
  UsersRound,
  ArrowRight,
  BarChart3,
  MessageCircle,
  TrendingUp,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { ImageSlot } from "@/components/ui/ImageSlot";
import { VideoHero } from "@/components/ui/VideoHero";
import { SubjectCard } from "@/components/ui/SubjectCard";
import { ClassBandCard } from "@/components/ui/ClassBandCard";
import { MentorCard } from "@/components/ui/MentorCard";
import { StepsList } from "@/components/ui/StepsList";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Marquee } from "@/components/ui/Marquee";
import { TransformationCompare } from "@/components/ui/TransformationCompare";
import { AssessmentVisual } from "@/components/ui/AssessmentVisual";
import { AssessmentJourney } from "@/components/ui/AssessmentJourney";
import { PromoBanner } from "@/components/ui/PromoBanner";
import { BannerSlot } from "@/components/ui/BannerSlot";
import { iconMap } from "@/lib/icon-map";
import { subjects } from "@/lib/content/subjects";
import { classBands } from "@/lib/content/classes";
import { skills } from "@/lib/content/skills";
import { mentorPreviews } from "@/lib/content/mentors";
import { generalFaqs } from "@/lib/content/faqs";
import { buildMetadata } from "@/lib/seo";
import { publicAsset } from "@/lib/assets";
import { prisma } from "@/lib/db/prisma";
import { BlogPostCard, type BlogPostPreview } from "@/components/ui/BlogPostCard";

export const metadata = buildMetadata({
  title: "Personalized 1-to-1 Learning, Remedial Classes & Mentorship",
  description:
    "Remedial One is a personalized learning platform that uses learning gap assessments to match students with qualified 1-to-1 mentors — for remedial education, exam preparation, and skills beyond the classroom.",
  path: "/",
});

export const revalidate = 300;

async function getLatestPosts(): Promise<BlogPostPreview[]> {
  const posts = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: 3,
    select: {
      slug: true,
      title: true,
      excerpt: true,
      coverImageUrl: true,
      category: true,
      publishedAt: true,
      content: true,
      author: { select: { name: true, avatarUrl: true } },
    },
  });

  return posts.map((post) => {
    const wordCount = post.content.replace(/<[^>]+>/g, " ").trim().split(/\s+/).filter(Boolean).length;
    return {
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      coverImageUrl: post.coverImageUrl,
      category: post.category,
      publishedAt: post.publishedAt ? post.publishedAt.toISOString() : null,
      readTimeMinutes: Math.max(1, Math.ceil(wordCount / 200)),
      author: post.author,
    };
  });
}

const heroFeatures = [
  { icon: ShieldCheck, label: "Verified Mentors" },
  { icon: GraduationCap, label: "1-to-1 Sessions" },
  { icon: BarChart3, label: "Track Your Progress" },
  { icon: Globe2, label: "Learn Anytime" },
];

const trustPoints = [
  { icon: GraduationCap, label: "Qualified Mentors", description: "Every mentor is reviewed before they teach." },
  { icon: Target, label: "Personalized Learning", description: "Sessions built around your goals, pace, and learning gaps." },
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

const assessmentSteps = [
  {
    icon: "search",
    title: "Identify learning gaps",
    description: "Chapter- and topic-level assessments pinpoint exactly which concepts a student hasn't fully grasped yet — not just which subject.",
    detail: "You leave the assessment with a ranked list of concepts to revisit first.",
  },
  {
    icon: "clipboard",
    title: "Get a personalized learning plan",
    description: "Mentors evaluate results and focus sessions on the specific gaps the assessment surfaces, instead of re-teaching an entire syllabus.",
    detail: "Every session targets a named gap, in the order that unblocks the most learning.",
  },
  {
    icon: "trending",
    title: "Track progress over time",
    description: "Chapter, topic, and skill-level metrics update as students improve, so growth is visible in the dashboard, not just felt.",
    detail: "Chapter, topic and skill scores trend on the dashboard after every session.",
  },
] as const;

const tuitionHighlights = [
  "Choose your subject and class level",
  "Discover mentors matched to your goals",
  "Book sessions on your own schedule",
  "Learn 1-to-1 in a dedicated online room",
  "Track progress after every session",
];

const steps = [
  {
    title: "Tell us what you want to learn",
    description: "Share your subject, class, and learning goals.",
    icon: publicAsset("landing-page/how-it-works/one.png"),
  },
  {
    title: "Discover the right mentor",
    description: "Browse mentors matched to your needs and pace.",
    icon: publicAsset("landing-page/how-it-works/two.png"),
  },
  {
    title: "Book your session",
    description: "Pick a time that fits your schedule, not a fixed batch.",
    icon: publicAsset("landing-page/how-it-works/third.png"),
  },
  {
    title: "Learn 1-to-1",
    description: "Meet your mentor in a focused, dedicated online session.",
    icon: publicAsset("landing-page/how-it-works/forth.png"),
  },
  {
    title: "Track your progress",
    description: "See growth after every session, not just at exam time.",
    icon: publicAsset("landing-page/how-it-works/fifth.png"),
  },
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

export default async function HomePage() {
  const latestPosts = await getLatestPosts();

  return (
    <>
      {/* Hero */}
      <Section
        tone="surface"
        className="relative overflow-x-clip pt-6 pb-10 sm:pt-8 sm:pb-12 lg:flex lg:min-h-[calc(100svh-4.5rem)] lg:max-h-[calc(100svh-4.5rem)] lg:flex-col lg:justify-center lg:overflow-hidden lg:py-6"
        containerClassName="w-full max-w-[1760px] px-5 sm:px-8 lg:px-[6%] xl:px-[8%] 2xl:px-[9%]"
      >
        {/* Ambient corner glows — section-wide, behind all content */}
        <div
          className="pointer-events-none absolute -right-[10%] -top-[14%] h-[280px] w-[280px] rounded-full bg-lime-soft opacity-70 blur-3xl sm:h-[380px] sm:w-[380px] lg:-right-[6%] lg:-top-[16%] lg:h-[480px] lg:w-[480px]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -left-[12%] bottom-[-10%] hidden h-[280px] w-[280px] rounded-full bg-lime-soft opacity-60 blur-3xl sm:block lg:h-[380px] lg:w-[380px]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-[8%] bottom-[-14%] hidden h-[220px] w-[220px] rounded-full bg-lime-soft opacity-50 blur-3xl sm:block lg:h-[300px] lg:w-[300px]"
          aria-hidden
        />

        <div className="relative grid w-full gap-8 sm:gap-10 lg:grid-cols-12 lg:items-center lg:gap-6">
          {/* Text column */}
          <div className="flex w-full min-w-0 flex-col items-start gap-4 sm:gap-5 lg:col-span-5">
            <Badge tone="outline-lime" dot>
              Personalized 1-to-1 Learning
            </Badge>
            <h1 className="max-w-[16ch] text-[clamp(2rem,1.4rem+2.6vw,3.5rem)] font-semibold leading-[1.08] tracking-tight text-ink sm:leading-[1.05] lg:leading-[1]">
              <span className="text-lime-ink">One</span> Student.
              <br />
              <span className="text-lime-ink">One</span> Mentor.
              <br />
              <span className="text-lime-ink">One</span>{" "}
              <span className="relative inline-block italic">
                Journey.
                <svg
                  viewBox="0 0 240 26"
                  className="pointer-events-none absolute -bottom-1 left-0 h-4 w-[104%] text-lime sm:-bottom-2 sm:h-5"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M3 16C46 6 110 4 160 10C190 14 214 9 236 5"
                    stroke="currentColor"
                    strokeWidth="7"
                    strokeLinecap="round"
                  />
                  <path
                    d="M6 22C50 16 108 15 150 19C178 22 204 18 224 15"
                    stroke="currentColor"
                    strokeWidth="5"
                    strokeLinecap="round"
                    opacity="0.55"
                  />
                </svg>
              </span>
            </h1>
            <p className="max-w-[520px] text-sm leading-relaxed text-muted sm:text-base">
              Personalized learning that identifies your learning gaps and adapts to you. Learn better. Grow smarter. Achieve more.
            </p>
            <div className="flex w-full flex-col gap-3 pt-1 sm:flex-row sm:flex-wrap">
              <Button href="/book-counselling" variant="primary-black" size="lg" className="w-full gap-2 sm:w-auto">
                Book Counselling
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
              <Button href="/one-to-one-tuition" variant="secondary-outline" size="lg" className="w-full gap-2 sm:w-auto">
                Explore Learning
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
            </div>

            <div className="grid w-full grid-cols-2 gap-x-4 gap-y-3.5 pt-1 sm:grid-cols-4">
              {heroFeatures.map((feature) => (
                <div key={feature.label} className="relative flex flex-col items-start gap-1.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-lime-soft text-ink">
                    <feature.icon className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
                  </div>
                  <span className="text-xs font-medium leading-tight text-muted">
                    {feature.label}
                  </span>
                  {feature.label === "Track Your Progress" ? (
                    <Image
                      src="/images/hero/doted.png"
                      alt=""
                      width={1536}
                      height={1024}
                      className="pointer-events-none absolute -right-6 -top-5 hidden w-10 rotate-12 sm:block"
                      aria-hidden
                    />
                  ) : null}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 border-t border-border pt-4">
              <div className="flex -space-x-3">
                {[1, 2, 3].map((n) => (
                  <Avatar
                    key={n}
                    src={publicAsset(`images/hero/avatar-${n}.jpg`)}
                    alt="Remedial One student"
                    size="sm"
                  />
                ))}
              </div>
              <p className="max-w-[10rem] text-xs leading-snug text-muted">
                Trusted by students across India and beyond
              </p>
            </div>
          </div>

          {/* Photo column */}
          <div className="relative flex items-center justify-center py-4 lg:col-span-7 lg:py-0">
            {/* Dot grid, rotated to a vertical strip and windowed down to a
                center-cropped portion of the pattern (overflow-hidden crop
                around a centered, oversized image — guaranteed to show actual
                dots regardless of exact pixel math, unlike clipping to an
                edge that might land on the source image's own padding). */}
            <div
              className="pointer-events-none absolute -top-6 -right-2 h-10 w-10 overflow-hidden sm:-top-8 sm:-right-4 sm:h-14 sm:w-14 lg:-top-10 lg:-right-6 lg:h-16 lg:w-16"
              aria-hidden
            >
              <div className="absolute left-1/2 top-1/2 h-16 w-24 -translate-x-1/2 -translate-y-1/2 sm:h-24 sm:w-36 lg:h-28 lg:w-40">
                <Image src="/images/hero/dots.png" alt="" fill className="rotate-[90deg] object-contain opacity-90" />
              </div>
            </div>
            <div
              className="pointer-events-none absolute -bottom-4 -left-4 hidden h-12 w-12 overflow-hidden sm:block sm:h-16 sm:w-16 lg:h-20 lg:w-20"
              aria-hidden
            >
              <div className="absolute left-1/2 top-1/2 h-20 w-28 -translate-x-1/2 -translate-y-1/2 lg:h-20 lg:w-32">
                <Image src="/images/hero/dots.png" alt="" fill className="rotate-[90deg] object-contain opacity-80" />
              </div>
            </div>

            <Image
              src="/images/hero/doted.png"
              alt=""
              width={1536}
              height={1024}
              className="pointer-events-none absolute bottom-28 right-16 hidden w-16 -rotate-6 sm:block sm:right-20 sm:w-20 lg:w-24"
              aria-hidden
            />

            <div className="relative w-full max-w-[17rem] translate-y-2 sm:max-w-sm sm:translate-y-4 lg:max-w-md lg:translate-y-2 xl:max-w-lg">
              {/* Background circle cluster — anchored to the student's head
                  (not the whole image box), so it reads as a halo behind her
                  rather than floating in the middle of the frame. */}
              <div
                className="pointer-events-none absolute left-[45%] top-[19%] -translate-x-1/2 -translate-y-1/2"
                aria-hidden
              >
                <div className="relative flex items-center justify-center">
                  <div className="h-[190px] w-[190px] rounded-full bg-lime-soft opacity-60 sm:h-[250px] sm:w-[250px] lg:h-[320px] lg:w-[320px]" />
                  <div className="absolute h-[165px] w-[165px] rounded-full border-2 border-dashed border-lime-ink/25 sm:h-[218px] sm:w-[218px] lg:h-[278px] lg:w-[278px]" />
                  <div className="absolute h-[140px] w-[140px] rounded-full bg-lime opacity-35 sm:h-[184px] sm:w-[184px] lg:h-[238px] lg:w-[238px]" />
                </div>
              </div>
              <ImageSlot
                src={publicAsset("images/hero/student.png")}
                alt="Student learning with Remedial One"
                label="Add student.png"
                recommendedSize="~1000×1300, transparent PNG"
                fit="contain"
                priority
                className="relative aspect-[1224/1285] w-full [-webkit-mask-image:linear-gradient(to_bottom,black_72%,transparent_98%)] [mask-image:linear-gradient(to_bottom,black_72%,transparent_98%)]"
              />
            </div>
          </div>
        </div>
      </Section>

      {/* Video — full width, directly below the hero */}
      <Section className="pt-0 pb-14 sm:pb-16">
        <ScrollReveal>
          <VideoHero className="shadow-lift" />
        </ScrollReveal>
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
        <TransformationCompare
          className="mt-12"
          traditional={comparisonTraditional}
          remedial={comparisonRemedial}
        />
        <div className="mt-10 flex justify-center">
          <Link href="/personalized-learning" className="text-sm font-semibold text-ink underline underline-offset-4">
            Read more about the personalized learning approach
          </Link>
        </div>
      </Section>

      {/* Learning gap assessment */}
      <Section tone="surface">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:gap-16">
          <ScrollReveal>
            <SectionHeading
              eyebrow="Learning Gap Assessment"
              title="Every learning journey starts with knowing where you stand."
              description="Before a mentor teaches, Remedial One's assessment engine helps identify learning gaps at the chapter and topic level — so remedial support targets exactly what a student needs, not a generic revision of the whole syllabus."
            />
          </ScrollReveal>
          <ScrollReveal delay={120} className="flex justify-center lg:justify-end">
            <AssessmentVisual />
          </ScrollReveal>
        </div>

        <AssessmentJourney steps={assessmentSteps} className="mt-12" />

        <div className="mt-12 flex flex-col items-center gap-4">
          <Button href="/learning-gap-assessment" variant="primary-black" size="lg" className="gap-2">
            See How the Assessment Works
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Button>
          <Link
            href="/remedial-classes"
            className="group inline-flex items-center gap-1.5 text-sm font-semibold text-ink underline-offset-4 hover:underline"
          >
            Explore remedial classes built around your gaps
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </Link>
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
            ctaHref="/one-to-one-tuition#how-it-works"
            image={publicAsset("landing-page/learnfromanywhere.png")}
            imageAlt="A student in a focused 1-to-1 online session from home"
            imageLabel="Learn-from-anywhere illustration"
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
                Explore 1-to-1 Tuition
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
          <Button href="/one-to-one-tuition#subjects" variant="secondary-outline" size="lg">
            View All Subjects
          </Button>
        </div>
      </Section>

      {/* Campaign banner slot */}
      <Section className="py-10 sm:py-12">
        <ScrollReveal>
          <BannerSlot
            src="/landing-page/campaign-banner.png"
            alt="Remedial One campaign — book a counselling session"
            href="/book-counselling"
          />
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

      {/* Skills beyond academics */}
      <Section id="skills" tone="surface">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,300px)] lg:items-center lg:gap-16">
          <ScrollReveal className="flex flex-col items-start gap-4">
            <Badge tone="lime">Beyond Academics</Badge>
            <h2 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
              Learn Beyond
              <br />
              the <span className="text-lime-ink">Classroom.</span>
            </h2>
            <p className="max-w-xl text-base leading-relaxed text-muted sm:text-lg">
              Communication, confidence, and life skills — built through the same
              1-to-1 approach, with a mentor who works on the student&apos;s real talks,
              decisions, and habits.
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted">
              {["8 skill tracks", "One mentor, one student", "Progress notes every session"].map(
                (point) => (
                  <span key={point} className="inline-flex items-center gap-2">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-lime" aria-hidden />
                    {point}
                  </span>
                )
              )}
            </div>
          </ScrollReveal>

          {/* Decorative doodle composition — echoes the chat / growth / checklist
              motifs from the concept art without depending on an image asset. */}
          <ScrollReveal
            delay={120}
            className="relative mx-auto hidden aspect-square w-full max-w-[300px] lg:block"
          >
            <div className="absolute inset-[14%] rounded-full bg-lime-soft blur-2xl" aria-hidden />
            <div
              className="absolute inset-[8%] rounded-full border border-dashed border-lime/40"
              aria-hidden
            />
            <div
              className="absolute inset-[24%] rounded-full border border-border bg-white"
              aria-hidden
            />
            <div className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl bg-ink text-lime shadow-lift">
              <Sparkles className="h-7 w-7" strokeWidth={1.75} aria-hidden />
            </div>
            <div className="absolute right-[2%] top-[8%] inline-flex items-center gap-2 rounded-xl border border-border bg-white px-3 py-2 text-xs font-medium text-ink shadow-card">
              <MessageCircle className="h-4 w-4 text-lime-deep" strokeWidth={1.75} aria-hidden />
              Speak up
            </div>
            <div className="absolute bottom-[18%] left-[-4%] inline-flex items-center gap-2 rounded-xl border border-border bg-white px-3 py-2 text-xs font-medium text-ink shadow-card">
              <TrendingUp className="h-4 w-4 text-lime-deep" strokeWidth={1.75} aria-hidden />
              Grow steadily
            </div>
            <div className="absolute bottom-[2%] right-[12%] inline-flex items-center gap-2 rounded-xl border border-border bg-white px-3 py-2 text-xs font-medium text-ink shadow-card">
              <CheckCircle2 className="h-4 w-4 text-lime-deep" strokeWidth={1.75} aria-hidden />
              Decide well
            </div>
          </ScrollReveal>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {skills.slice(0, 8).map((skill, index) => {
            const Icon = iconMap[skill.icon];
            return (
              <ScrollReveal key={skill.slug} delay={(index % 4) * 60}>
                <Link
                  href={`/skills/${skill.slug}`}
                  className="group flex h-full flex-col gap-4 rounded-2xl border border-border bg-white p-5 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-ink/15 hover:shadow-lift"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink text-lime">
                    {Icon ? <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden /> : null}
                  </div>
                  <div className="flex flex-1 flex-col gap-1.5">
                    <h3 className="text-[15px] font-semibold text-ink">{skill.name}</h3>
                    <p className="text-[13px] leading-relaxed text-muted">{skill.description}</p>
                  </div>
                  <span
                    className="flex h-8 w-8 items-center justify-center self-end rounded-full border border-border-strong text-muted transition-colors duration-300 group-hover:border-ink group-hover:bg-ink group-hover:text-lime"
                    aria-hidden
                  >
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </ScrollReveal>
            );
          })}
        </div>

        <div className="mt-12 flex justify-center">
          <Button
            href="/one-to-one-tuition#skills"
            variant="primary-black"
            size="lg"
            className="gap-3 pr-3"
          >
            Explore Skills
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
              <ArrowRight className="h-4 w-4" aria-hidden />
            </span>
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
            eyebrow="Parent Dashboard"
            title="Visibility into every step of the journey."
            description="The parent dashboard shows session history, mentor feedback, and subject-wise progress against identified learning gaps — so you always know how learning is actually going, not just what the report card says."
            ctaLabel="Learn More"
            ctaHref="/about"
            image={publicAsset("landing-page/parentDashboard.png")}
            imageAlt="Parent dashboard showing session history, mentor feedback, and subject-wise progress"
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

      {/* From the blog */}
      {latestPosts.length > 0 ? (
        <Section tone="surface">
          <ScrollReveal>
            <SectionHeading
              eyebrow="From the Blog"
              title="Notes on remedial learning, done well."
              description="Practical guidance on closing learning gaps, study habits, and personalized 1-to-1 education — for students, parents, and mentors."
            />
          </ScrollReveal>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {latestPosts.map((post, index) => (
              <ScrollReveal key={post.slug} delay={index * 80}>
                <BlogPostCard post={post} />
              </ScrollReveal>
            ))}
          </div>
          <div className="mt-10 flex justify-center">
            <Button href="/blog" variant="secondary-outline" size="lg">
              Read the Blog
            </Button>
          </div>
        </Section>
      ) : null}

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
