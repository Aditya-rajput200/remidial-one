import Link from "next/link";
import { Target, Globe2, ShieldCheck, Heart } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "About Us — Our Approach to Personalized Remedial Education",
  description:
    "Remedial One is a global 1-to-1 personalized learning and mentorship platform, built to identify learning gaps and give every student the individual attention a classroom can't.",
  path: "/about",
});

const values = [
  { icon: Target, title: "Personalization first", description: "Every session is designed around one student, not a syllabus timetable." },
  { icon: ShieldCheck, title: "Trust and safety", description: "Verified mentors and a responsible learning environment, by design." },
  { icon: Heart, title: "Genuine care", description: "Learning works better when someone actually pays attention to how you learn." },
  { icon: Globe2, title: "Global ambition", description: "Built in India, built to serve students anywhere in the world." },
];

export default function AboutPage() {
  return (
    <>
      <Section className="pb-10 pt-10 sm:pt-14">
        <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "About", path: "/about" }]} />
        <div className="mt-6">
          <SectionHeading
            as="h1"
            eyebrow="About Remedial One"
            title="Learning should feel personal. So we built it that way."
            description="Remedial One connects students with qualified mentors for personalized, 1-to-1 learning — academic subjects, exam preparation, and skills beyond the classroom. We started with students in India, and we're building for the world."
          />
        </div>
      </Section>

      <Section tone="surface">
        <SectionHeading
          eyebrow="Our Belief"
          title="One student. One mentor. One learning journey."
          description="Most classrooms are built for a room, not a person. We believe learning works best when it's paced around the individual — their goals, their gaps, and the way they actually understand things."
        />
        <p className="mt-6 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
          The name Remedial One reflects that belief. Remedial education, to us, isn&apos;t a label
          for students who are &ldquo;behind&rdquo; — it&apos;s the practice of identifying specific{" "}
          <Link href="/learning-gap-assessment" className="font-semibold text-ink underline underline-offset-4">
            learning gaps through assessment
          </Link>{" "}
          and closing them with a mentor who adapts to that one student, one topic at a time. Read
          more about{" "}
          <Link href="/personalized-learning" className="font-semibold text-ink underline underline-offset-4">
            what personalized learning
          </Link>{" "}
          means in practice, or see how it shapes our{" "}
          <Link href="/remedial-classes" className="font-semibold text-ink underline underline-offset-4">
            remedial classes
          </Link>
          .
        </p>
      </Section>

      <Section>
        <SectionHeading eyebrow="What We Value" title="The principles behind every session." />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((value) => (
            <div key={value.title} className="flex flex-col gap-4 rounded-2xl border border-border bg-white p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-lime-soft text-ink">
                <value.icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              </div>
              <h3 className="text-base font-semibold text-ink">{value.title}</h3>
              <p className="text-sm leading-relaxed text-muted">{value.description}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="ink">
        <div className="flex flex-col items-center gap-5 text-center">
          <h2 className="max-w-xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Join the next chapter of personalized learning.
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            <Button href="/mentors" variant="primary-lime" size="lg">
              Find a Mentor
            </Button>
            <Button
              href="/become-a-mentor"
              variant="secondary-outline"
              size="lg"
              className="border-white/20 text-white hover:border-white/40"
            >
              Become a Mentor
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
