import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { classBands, getClassBandBySlug } from "@/lib/content/classes";
import { subjects } from "@/lib/content/subjects";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SubjectCard } from "@/components/ui/SubjectCard";
import { buildMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return classBands.map((band) => ({ class: band.slug }));
}

export async function generateMetadata(props: PageProps<"/classes/[class]">) {
  const { class: slug } = await props.params;
  const band = getClassBandBySlug(slug);
  if (!band) return buildMetadata({ title: "Classes", description: "", path: "/classes" });

  return buildMetadata({
    title: `${band.name} — ${band.tagline}`,
    description: band.description,
    path: `/classes/${band.slug}`,
  });
}

export default async function ClassBandPage(props: PageProps<"/classes/[class]">) {
  const { class: slug } = await props.params;
  const band = getClassBandBySlug(slug);

  if (!band) {
    notFound();
  }

  const relevantSubjects = subjects.filter((subject) => band.subjectSlugs.includes(subject.slug));

  return (
    <>
      <Section className="pb-10 pt-10 sm:pt-14">
        <Breadcrumbs
          items={[
            { name: "Home", path: "/" },
            { name: "Classes", path: "/classes" },
            { name: band.name, path: `/classes/${band.slug}` },
          ]}
        />
        <div className="mt-6 flex flex-col gap-5">
          <span className="text-sm font-semibold uppercase tracking-wide text-lime-ink">
            {band.tagline}
          </span>
          <h1 className="text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            {band.name}
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-muted">{band.description}</p>
          <div className="pt-2">
            <Button href="/mentors" variant="primary-lime" size="lg">
              Find a Mentor
            </Button>
          </div>
        </div>
      </Section>

      <Section tone="surface">
        <SectionHeading title="What sessions focus on" />
        <ul className="mt-6 grid gap-4 sm:grid-cols-3">
          {band.focusAreas.map((item) => (
            <li
              key={item}
              className="flex items-start gap-3 rounded-2xl border border-border bg-white p-5 text-sm text-ink"
            >
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-lime-ink" aria-hidden />
              {item}
            </li>
          ))}
        </ul>
      </Section>

      {relevantSubjects.length > 0 ? (
        <Section>
          <SectionHeading eyebrow="Subjects" title={`Subjects available for ${band.name}`} />
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {relevantSubjects.map((subject) => (
              <SubjectCard key={subject.slug} subject={subject} />
            ))}
          </div>
        </Section>
      ) : null}

      <Section tone="ink">
        <div className="flex flex-col items-center gap-5 text-center">
          <h2 className="max-w-xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Ready to start learning for {band.name}?
          </h2>
          <Button href="/mentors" variant="primary-lime" size="lg">
            Find Your Mentor
          </Button>
        </div>
      </Section>
    </>
  );
}
