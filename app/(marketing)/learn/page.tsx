import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { JsonLd } from "@/components/ui/JsonLd";
import { buildMetadata, itemListJsonLd } from "@/lib/seo";
import { learnSubjects, conceptsForSubject } from "@/lib/content/learn";

export function generateMetadata() {
  return buildMetadata({
    title: "Learn — Free Concepts, Tables & Solved Problems",
    description:
      "Free, answer-first explainers for the concepts students search for most — squares, cubes, prime numbers, unit conversions, formulas and grammar. Then learn them 1-to-1.",
    path: "/learn",
  });
}

export default function LearnHubPage() {
  return (
    <>
      <JsonLd
        data={itemListJsonLd({
          name: "Learn — subject hubs",
          items: learnSubjects.map((s) => ({ name: s.name, path: `/learn/${s.slug}` })),
        })}
      />

      <Section className="pb-10 pt-10 sm:pt-14">
        <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Learn", path: "/learn" }]} />
        <div className="mt-6 flex max-w-2xl flex-col gap-5">
          <h1 className="text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            Learn any concept, free.
          </h1>
          <p className="text-lg leading-relaxed text-muted">
            Clear, direct answers to the questions students actually search — with the method
            shown, not just the result. When a concept needs more than a page, a 1-to-1 mentor is a
            click away.
          </p>
        </div>
      </Section>

      <Section tone="surface">
        <div className="grid gap-6 lg:grid-cols-2">
          {learnSubjects.map((subject) => {
            const items = conceptsForSubject(subject.slug);
            return (
              <Card key={subject.slug} className="flex h-full flex-col">
                <h2 className="text-xl font-semibold text-ink">
                  <Link href={`/learn/${subject.slug}`} className="hover:underline">
                    {subject.name}
                  </Link>
                </h2>
                <p className="mt-2 text-sm text-muted">{subject.description}</p>
                <ul className="mt-4 flex flex-col gap-2">
                  {items.map((c) => (
                    <li key={c.slug}>
                      <Link
                        href={`/learn/${subject.slug}/${c.slug}`}
                        className="text-sm text-ink hover:text-lime-ink hover:underline"
                      >
                        {c.heading}
                      </Link>
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-5">
                  <Button href={`/learn/${subject.slug}`} variant="ghost" size="sm">
                    All {subject.name} →
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </Section>

      <Section tone="ink">
        <div className="flex flex-col items-center gap-5 text-center">
          <h2 className="max-w-xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Reading is a start. Understanding is 1-to-1.
          </h2>
          <Button href="/online-tuition" variant="primary-lime" size="lg">
            Explore Online Tuition
          </Button>
        </div>
      </Section>
    </>
  );
}
