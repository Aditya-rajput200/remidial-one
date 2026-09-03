import Link from "next/link";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { JsonLd } from "@/components/ui/JsonLd";
import {
  buildMetadata,
  learnArticleJsonLd,
  qaPageJsonLd,
  howToJsonLd,
  faqJsonLd,
} from "@/lib/seo";
import { concepts, getConcept, getLearnSubject } from "@/lib/content/learn";

// Content is authored, not live — a fixed publish date keeps Article schema
// stable. Bump when a concept page is materially revised.
const PUBLISHED_AT = "2026-09-01";
const UPDATED_AT = "2026-09-01";

export function generateStaticParams() {
  return concepts.map((c) => ({ subject: c.subjectSlug, concept: c.slug }));
}

export async function generateMetadata(props: PageProps<"/learn/[subject]/[concept]">) {
  const { subject, concept } = await props.params;
  const data = getConcept(subject, concept);
  if (!data) return buildMetadata({ title: "Learn", description: "", path: "/learn" });
  return buildMetadata({
    title: data.metaTitle,
    description: data.metaDescription,
    path: `/learn/${data.subjectSlug}/${data.slug}`,
    ogType: "article",
  });
}

export default async function ConceptPage(props: PageProps<"/learn/[subject]/[concept]">) {
  const { subject: subjectSlug, concept: conceptSlug } = await props.params;
  const concept = getConcept(subjectSlug, conceptSlug);
  if (!concept) notFound();

  const subject = getLearnSubject(subjectSlug);
  const path = `/learn/${concept.subjectSlug}/${concept.slug}`;
  const ctaPath = concept.ctaService === "" ? "/online-tuition" : `/online-tuition/${concept.ctaService}`;

  return (
    <>
      <JsonLd
        data={learnArticleJsonLd({
          title: concept.metaTitle,
          description: concept.metaDescription,
          path,
          publishedAt: PUBLISHED_AT,
          updatedAt: UPDATED_AT,
        })}
      />
      <JsonLd data={qaPageJsonLd({ question: concept.heading, answer: concept.answer, path })} />
      {concept.isConversion && concept.howToSteps ? (
        <JsonLd
          data={howToJsonLd({
            name: concept.heading,
            description: concept.metaDescription,
            path,
            steps: concept.howToSteps,
          })}
        />
      ) : null}
      <JsonLd data={faqJsonLd(concept.faqs)} />

      <Section className="pb-10 pt-10 sm:pt-14">
        <Breadcrumbs
          items={[
            { name: "Home", path: "/" },
            { name: "Learn", path: "/learn" },
            { name: subject?.name ?? "Subject", path: `/learn/${concept.subjectSlug}` },
            { name: concept.heading, path },
          ]}
        />

        {/* Answer-first block — the direct answer sits in the first screen to win
            featured snippets, exactly as the strategy prescribes. */}
        <div className="mt-6 max-w-3xl">
          <h1 className="text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            {concept.heading}
          </h1>
          <div className="mt-6 rounded-2xl border border-border bg-lime-soft/40 p-6">
            <p className="text-lg leading-relaxed text-ink">{concept.answer}</p>
          </div>
        </div>

        {concept.table ? (
          <div className="mt-8 max-w-3xl overflow-x-auto">
            {concept.table.caption ? (
              <p className="mb-3 text-sm font-medium text-muted">{concept.table.caption}</p>
            ) : null}
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  {concept.table.headers.map((h) => (
                    <th
                      key={h}
                      className="border border-border bg-surface px-4 py-2 text-left font-semibold text-ink"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {concept.table.rows.map((row, i) => (
                  <tr key={i} className={i % 2 ? "bg-surface/50" : undefined}>
                    {row.map((cell, j) => (
                      <td key={j} className="border border-border px-4 py-2 text-ink">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {concept.isConversion && concept.howToSteps ? (
          <div className="mt-8 max-w-3xl">
            <h2 className="text-xl font-semibold text-ink">How to convert, step by step</h2>
            <ol className="mt-4 flex flex-col gap-3">
              {concept.howToSteps.map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-ink">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-semibold text-white">
                    {i + 1}
                  </span>
                  <span className="text-sm sm:text-base">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        ) : null}
      </Section>

      {concept.sections && concept.sections.length > 0 ? (
        <Section tone="surface">
          <div className="mx-auto flex max-w-3xl flex-col gap-8">
            {concept.sections.map((s) => (
              <div key={s.heading}>
                <h2 className="text-2xl font-semibold tracking-tight text-ink">{s.heading}</h2>
                <div className="mt-3 flex flex-col gap-3">
                  {s.body.map((p, i) => (
                    <p key={i} className="leading-relaxed text-muted">
                      {p}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {concept.workedExamples && concept.workedExamples.length > 0 ? (
        <Section>
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl font-semibold tracking-tight text-ink">Worked examples</h2>
            <div className="mt-6 flex flex-col gap-6">
              {concept.workedExamples.map((ex, i) => (
                <div key={i} className="rounded-2xl border border-border bg-white p-6 shadow-card">
                  <p className="font-semibold text-ink">{ex.prompt}</p>
                  <ol className="mt-3 flex flex-col gap-1.5">
                    {ex.steps.map((step, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-muted">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-lime-ink" aria-hidden />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </div>
        </Section>
      ) : null}

      {/* Soft CTA into the matching service page — the funnel from free traffic
          to the paid offer. */}
      <Section tone="lime">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-5 text-center">
          <p className="text-xl font-medium text-white sm:text-2xl">{concept.ctaLabel}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button href="/learning-gap-assessment" variant="primary-black" size="lg">
              Start a Free Assessment
            </Button>
            <Button href={ctaPath} variant="secondary-outline" size="lg" className="border-white/40 text-white">
              Explore Tuition
            </Button>
          </div>
        </div>
      </Section>

      {concept.related && concept.related.length > 0 ? (
        <Section>
          <h2 className="text-2xl font-semibold tracking-tight text-ink">Related concepts</h2>
          <div className="mt-6 flex flex-wrap gap-3">
            {concept.related.map((r) => (
              <Link
                key={`${r.subjectSlug}/${r.slug}`}
                href={`/learn/${r.subjectSlug}/${r.slug}`}
                className="rounded-full border border-border px-4 py-2 text-sm text-ink transition-colors hover:border-ink/40"
              >
                {r.label} →
              </Link>
            ))}
          </div>
        </Section>
      ) : null}

      <Section tone="surface">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-semibold tracking-tight text-ink">
            Frequently asked questions
          </h2>
          <div className="mt-6">
            <FaqAccordion faqs={concept.faqs} />
          </div>
        </div>
      </Section>
    </>
  );
}
