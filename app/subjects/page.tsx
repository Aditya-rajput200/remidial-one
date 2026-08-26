import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SubjectCard } from "@/components/ui/SubjectCard";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { subjects } from "@/lib/content/subjects";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Subjects for 1-to-1 Tutoring",
  description:
    "Explore every subject available for personalized 1-to-1 tutoring on Remedial One, from core academics to communication skills.",
  path: "/subjects",
});

export default function SubjectsPage() {
  return (
    <>
      <Section className="pb-10 pt-10 sm:pt-14">
        <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Subjects", path: "/subjects" }]} />
        <div className="mt-6">
          <SectionHeading
            eyebrow="Subjects"
            title="Every subject, taught 1-to-1."
            description="Pick a subject to see what a personalized learning journey looks like — what you'll learn, which classes it covers, and how sessions are structured."
          />
        </div>
      </Section>
      <Section tone="surface" className="pt-0">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {subjects.map((subject) => (
            <SubjectCard key={subject.slug} subject={subject} />
          ))}
        </div>
      </Section>
    </>
  );
}
