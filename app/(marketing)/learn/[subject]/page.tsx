import Link from "next/link";
import { notFound } from "next/navigation";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { JsonLd } from "@/components/ui/JsonLd";
import { buildMetadata, itemListJsonLd } from "@/lib/seo";
import { learnSubjects, getLearnSubject, conceptsForSubject } from "@/lib/content/learn";

export function generateStaticParams() {
  return learnSubjects.map((s) => ({ subject: s.slug }));
}

export async function generateMetadata(props: PageProps<"/learn/[subject]">) {
  const { subject: slug } = await props.params;
  const subject = getLearnSubject(slug);
  if (!subject) return buildMetadata({ title: "Learn", description: "", path: "/learn" });
  return buildMetadata({
    title: `${subject.name} — Free Concepts & Solved Problems`,
    description: subject.description,
    path: `/learn/${subject.slug}`,
  });
}

export default async function LearnSubjectPage(props: PageProps<"/learn/[subject]">) {
  const { subject: slug } = await props.params;
  const subject = getLearnSubject(slug);
  if (!subject) notFound();

  const items = conceptsForSubject(subject.slug);

  return (
    <>
      <JsonLd
        data={itemListJsonLd({
          name: `Learn — ${subject.name}`,
          items: items.map((c) => ({ name: c.heading, path: `/learn/${subject.slug}/${c.slug}` })),
        })}
      />

      <Section className="pb-10 pt-10 sm:pt-14">
        <Breadcrumbs
          items={[
            { name: "Home", path: "/" },
            { name: "Learn", path: "/learn" },
            { name: subject.name, path: `/learn/${subject.slug}` },
          ]}
        />
        <div className="mt-6 flex max-w-2xl flex-col gap-4">
          <h1 className="text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            {subject.heading}
          </h1>
          <p className="text-lg leading-relaxed text-muted">{subject.description}</p>
        </div>
      </Section>

      <Section tone="surface">
        <SectionHeading title={`${subject.name} concepts`} />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((c) => (
            <Link key={c.slug} href={`/learn/${subject.slug}/${c.slug}`}>
              <Card interactive className="h-full">
                <h2 className="text-lg font-semibold text-ink">{c.heading}</h2>
                <p className="mt-2 line-clamp-3 text-sm text-muted">{c.answer}</p>
              </Card>
            </Link>
          ))}
        </div>
      </Section>

      <Section tone="ink">
        <div className="flex flex-col items-center gap-5 text-center">
          <h2 className="max-w-xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Learn {subject.name} the way it finally sticks — 1-to-1.
          </h2>
          <Button href="/online-tuition" variant="primary-lime" size="lg">
            Explore Online Tuition
          </Button>
        </div>
      </Section>
    </>
  );
}
