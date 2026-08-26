import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Resources",
  description:
    "Practical guidance for students and parents on personalized learning, study habits, and getting the most out of 1-to-1 mentorship.",
  path: "/resources",
});

const resources = [
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

export default function ResourcesPage() {
  return (
    <>
      <Section className="pb-10 pt-10 sm:pt-14">
        <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Resources", path: "/resources" }]} />
        <div className="mt-6">
          <SectionHeading
            eyebrow="Resources"
            title="Practical guidance for learning well."
            description="Short, practical guidance for students and parents navigating personalized learning."
          />
        </div>
      </Section>

      <Section tone="surface" className="pt-0">
        <div className="mx-auto flex max-w-3xl flex-col gap-6">
          {resources.map((resource) => (
            <article key={resource.title} className="rounded-2xl border border-border bg-white p-6 sm:p-8">
              <h2 className="text-xl font-semibold text-ink">{resource.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">{resource.body}</p>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
