import Link from "next/link";
import { Check } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { JsonLd } from "@/components/ui/JsonLd";
import { buildMetadata, serviceJsonLd, faqJsonLd, itemListJsonLd } from "@/lib/seo";
import {
  coreServicePage,
  serviceSubjects,
  serviceGrades,
  serviceBoards,
} from "@/lib/content/onlineTuition";
import { learnSubjects } from "@/lib/content/learn";

const page = coreServicePage;

export function generateMetadata() {
  return buildMetadata({
    title: page.title,
    description: page.metaDescription,
    path: "/online-tuition",
  });
}

export default function OnlineTuitionPage() {
  return (
    <>
      <JsonLd
        data={serviceJsonLd({
          name: "Online Tuition — 1-to-1",
          description: page.metaDescription,
          path: "/online-tuition",
        })}
      />
      <JsonLd data={faqJsonLd(page.faqs)} />
      <JsonLd
        data={itemListJsonLd({
          name: "Online tuition service pages",
          items: [
            ...serviceSubjects.map((s) => ({ name: s.h1, path: `/online-tuition/${s.slug}` })),
            ...serviceGrades.map((s) => ({ name: s.h1, path: `/online-tuition/${s.slug}` })),
            ...serviceBoards.map((s) => ({ name: s.h1, path: `/online-tuition/${s.slug}` })),
          ],
        })}
      />

      <Section className="pb-10 pt-10 sm:pt-14">
        <Breadcrumbs
          items={[
            { name: "Home", path: "/" },
            { name: "Online Tuition", path: "/online-tuition" },
          ]}
        />
        <div className="mt-6 flex max-w-2xl flex-col gap-5">
          <h1 className="text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            {page.h1}
          </h1>
          <p className="text-lg font-medium text-ink">{page.usp}</p>
          <p className="text-lg leading-relaxed text-muted">{page.intro}</p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button href="/learning-gap-assessment" variant="primary-lime" size="lg">
              Start a Free Assessment
            </Button>
            <Button href="/book-counselling" variant="secondary-outline" size="lg">
              Book Free Counselling
            </Button>
          </div>
        </div>
      </Section>

      <Section tone="surface">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="What it covers" title="Every core subject, class and board" />
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
            <SectionHeading eyebrow="Why 1-to-1" title="One student, one mentor, one plan" />
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

      <Section>
        <SectionHeading eyebrow="By subject" title="Online tuition by subject" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {serviceSubjects.map((s) => (
            <Link key={s.slug} href={`/online-tuition/${s.slug}`}>
              <Card interactive className="h-full">
                <h3 className="text-lg font-semibold text-ink">{s.h1}</h3>
                <p className="mt-2 text-sm text-muted">{s.usp}</p>
              </Card>
            </Link>
          ))}
        </div>
      </Section>

      <Section tone="surface">
        <SectionHeading eyebrow="By class" title="Online tuition by class" />
        <div className="mt-8 flex flex-wrap gap-3">
          {serviceGrades.map((s) => (
            <Button key={s.slug} href={`/online-tuition/${s.slug}`} variant="secondary-outline" size="md">
              Class {s.slug.replace("class-", "")}
            </Button>
          ))}
        </div>
        <div className="mt-10">
          <SectionHeading eyebrow="By board" title="Online tuition by board" />
          <div className="mt-6 flex flex-wrap gap-3">
            {serviceBoards.map((s) => (
              <Button key={s.slug} href={`/online-tuition/${s.slug}`} variant="secondary-outline" size="md">
                {s.h1.replace(" Online Tuition, 1-to-1", "")}
              </Button>
            ))}
          </div>
        </div>
      </Section>

      <Section>
        <SectionHeading
          eyebrow="Free student resources"
          title="Learn a concept now — free"
          description="Our /learn library answers the questions students actually search for, from squares and cubes to unit conversions and formulas."
        />
        <div className="mt-8 flex flex-wrap gap-3">
          {learnSubjects.map((s) => (
            <Button key={s.slug} href={`/learn/${s.slug}`} variant="ghost" size="md">
              {s.name} →
            </Button>
          ))}
        </div>
      </Section>

      <Section tone="surface">
        <SectionHeading eyebrow="FAQ" title="Questions about online tuition" />
        <div className="mt-8 max-w-3xl">
          <FaqAccordion faqs={page.faqs} />
        </div>
      </Section>

      <Section tone="ink">
        <div className="flex flex-col items-center gap-5 text-center">
          <h2 className="max-w-xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            See exactly where your child stands — free.
          </h2>
          <p className="max-w-lg text-white/70">
            Start with a learning-gap assessment or a free counselling call. No commitment, just clarity.
          </p>
          <Button href="/learning-gap-assessment" variant="primary-lime" size="lg">
            Start a Free Assessment
          </Button>
        </div>
      </Section>
    </>
  );
}
