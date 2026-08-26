import { CalendarCheck, Search, UserRoundSearch, Video, LineChart, MessageSquareText } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { subjects } from "@/lib/content/subjects";
import { SubjectCard } from "@/components/ui/SubjectCard";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "1-to-1 Tuition",
  description:
    "Book personalized 1-to-1 tutoring sessions with qualified mentors — subject selection, mentor discovery, flexible booking, and progress tracking, all in one place.",
  path: "/one-to-one-tuition",
});

const flow = [
  { icon: Search, title: "Select a subject & class", description: "Start with what you want to learn and your current class level." },
  { icon: UserRoundSearch, title: "Discover a mentor", description: "Browse mentor profiles matched to your subject and goals." },
  { icon: CalendarCheck, title: "Book your session", description: "Choose a time that fits your schedule — no fixed batch timing." },
  { icon: Video, title: "Learn online, 1-to-1", description: "Meet your mentor in a focused, dedicated online learning room." },
  { icon: MessageSquareText, title: "Get feedback", description: "Receive mentor feedback after every session." },
  { icon: LineChart, title: "Track your progress", description: "Watch your progress build session over session in your dashboard." },
];

export default function OneToOneTuitionPage() {
  return (
    <>
      <Section className="pb-10 pt-10 sm:pt-14">
        <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "1-to-1 Tuition", path: "/one-to-one-tuition" }]} />
        <div className="mt-6">
          <SectionHeading
            eyebrow="1-to-1 Tuition"
            title="One Student. One Mentor. One Learning Journey."
            description="Every session on Remedial One is built around a single student and a single mentor. No shared pace, no waiting for a room to catch up — just focused, personalized learning, booked on your schedule."
          />
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="/mentors" variant="primary-lime" size="lg">
              Find a Mentor
            </Button>
            <Button href="/subjects" variant="secondary-outline" size="lg">
              Browse Subjects
            </Button>
          </div>
        </div>
      </Section>

      <Section tone="surface">
        <SectionHeading eyebrow="How It Works" title="From subject to session, in six steps." />
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

      <Section>
        <SectionHeading eyebrow="Subjects" title="Choose from a growing range of subjects." />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {subjects.slice(0, 8).map((subject) => (
            <SubjectCard key={subject.slug} subject={subject} />
          ))}
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
