import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SkillCard } from "@/components/ui/SkillCard";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { skills } from "@/lib/content/skills";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Skills Beyond Academics",
  description:
    "Communication, confidence, leadership, and life skills — built 1-to-1, the same way academic mentoring works on Remedial One.",
  path: "/skills",
});

export default function SkillsPage() {
  return (
    <>
      <Section className="pb-10 pt-10 sm:pt-14">
        <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Skills", path: "/skills" }]} />
        <div className="mt-6">
          <SectionHeading
            eyebrow="Beyond Academics"
            title="Learn Beyond the Classroom."
            description="Remedial One isn't only about subjects and exams. Mentors also help students build the communication, confidence, and life skills that carry far beyond school."
          />
        </div>
      </Section>
      <Section tone="surface" className="pt-0">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {skills.map((skill) => (
            <SkillCard key={skill.slug} skill={skill} />
          ))}
        </div>
      </Section>
      <Section tone="ink">
        <div className="flex flex-col items-center gap-5 text-center">
          <h2 className="max-w-xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Skills grow the same way subjects do — 1-to-1.
          </h2>
          <Button href="/mentors" variant="primary-lime" size="lg">
            Find a Mentor
          </Button>
        </div>
      </Section>
    </>
  );
}
