import Link from "next/link";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { JsonLd } from "@/components/ui/JsonLd";
import { buildMetadata, serviceJsonLd, courseJsonLd, faqJsonLd } from "@/lib/seo";
import { servicePages, getServicePage } from "@/lib/content/onlineTuition";
import { getLearnSubject } from "@/lib/content/learn";

export function generateStaticParams() {
  return servicePages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(props: PageProps<"/online-tuition/[slug]">) {
  const { slug } = await props.params;
  const page = getServicePage(slug);
  if (!page) return buildMetadata({ title: "Online Tuition", description: "", path: "/online-tuition" });
  return buildMetadata({
    title: page.title,
    description: page.metaDescription,
    path: `/online-tuition/${page.slug}`,
  });
}

export default async function ServicePage(props: PageProps<"/online-tuition/[slug]">) {
  const { slug } = await props.params;
  const page = getServicePage(slug);
  if (!page) notFound();

  const path = `/online-tuition/${page.slug}`;
  const relatedPages = (page.related ?? [])
    .map((r) => (r === "" ? null : getServicePage(r)))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));
  const learnHubs = (page.learnSubjects ?? [])
    .map((s) => getLearnSubject(s))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));

  return (
    <>
      <JsonLd data={serviceJsonLd({ name: page.h1, description: page.metaDescription, path })} />
      <JsonLd data={courseJsonLd({ name: page.h1, description: page.metaDescription, path })} />
      <JsonLd data={faqJsonLd(page.faqs)} />

      <Section className="pb-10 pt-10 sm:pt-14">
        <Breadcrumbs
          items={[
            { name: "Home", path: "/" },
            { name: "Online Tuition", path: "/online-tuition" },
            { name: page.h1, path },
          ]}
        />
        <div className="mt-6 flex max-w-2xl flex-col gap-5">
          <h1 className="text-4xl font-semibold tracking-tight text-ink sm:text-5xl">{page.h1}</h1>
          <p className="text-lg font-medium text-ink">{page.usp}</p>
          <p className="text-lg leading-relaxed text-muted">{page.intro}</p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button href="/learning-gap-assessment" variant="primary-lime" size="lg">
              Start a Free Assessment
            </Button>
            <Button href="/mentors" variant="secondary-outline" size="lg">
              Find a Mentor
            </Button>
          </div>
        </div>
      </Section>

      <Section tone="surface">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="What it covers" title="What these sessions cover" />
            <ul className="mt-6 flex flex-col gap-3">
              {page.covers.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-ink sm:text-base">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-lime-ink" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <SectionHeading eyebrow="Why 1-to-1" title="Why one-on-one wins here" />
            <ul className="mt-6 flex flex-col gap-3">
              {page.whyOneToOne.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-ink sm:text-base">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-lime-ink" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {learnHubs.length > 0 ? (
        <Section>
          <SectionHeading
            eyebrow="Free to explore"
            title="Related concepts in our /learn library"
            description="Free, answer-first explainers your student can use right now."
          />
          <div className="mt-8 flex flex-wrap gap-3">
            {learnHubs.map((s) => (
              <Button key={s.slug} href={`/learn/${s.slug}`} variant="ghost" size="md">
                {s.name} →
              </Button>
            ))}
          </div>
        </Section>
      ) : null}

      {relatedPages.length > 0 ? (
        <Section tone="surface">
          <SectionHeading eyebrow="Related" title="Related online tuition pages" />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {relatedPages.map((p) => (
              <Link key={p.slug} href={`/online-tuition/${p.slug}`}>
                <Card interactive className="h-full">
                  <h3 className="text-base font-semibold text-ink">{p.h1}</h3>
                  <p className="mt-2 text-sm text-muted">{p.usp}</p>
                </Card>
              </Link>
            ))}
          </div>
        </Section>
      ) : null}

      <Section>
        <SectionHeading eyebrow="FAQ" title={`Questions about ${page.h1.toLowerCase()}`} />
        <div className="mt-8 max-w-3xl">
          <FaqAccordion faqs={page.faqs} />
        </div>
      </Section>

      <Section tone="ink">
        <div className="flex flex-col items-center gap-5 text-center">
          <h2 className="max-w-xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Book a free learning-gap assessment.
          </h2>
          <Button href="/learning-gap-assessment" variant="primary-lime" size="lg">
            Start Now
          </Button>
        </div>
      </Section>
    </>
  );
}
