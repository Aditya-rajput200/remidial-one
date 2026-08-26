import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ClassBandCard } from "@/components/ui/ClassBandCard";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { classBands } from "@/lib/content/classes";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Classes & Grades",
  description:
    "Explore 1-to-1 learning by class — from foundation years through board-exam preparation.",
  path: "/classes",
});

export default function ClassesPage() {
  return (
    <>
      <Section className="pb-10 pt-10 sm:pt-14">
        <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Classes", path: "/classes" }]} />
        <div className="mt-6">
          <SectionHeading
            eyebrow="Classes"
            title="Learning built for every stage."
            description="From foundation years to board-exam preparation, find the learning path that matches where you are right now."
          />
        </div>
      </Section>
      <Section tone="surface" className="pt-0">
        <div className="grid gap-6 sm:grid-cols-3">
          {classBands.map((band) => (
            <ClassBandCard key={band.slug} band={band} />
          ))}
        </div>
      </Section>
    </>
  );
}
