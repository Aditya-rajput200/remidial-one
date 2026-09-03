import Link from "next/link";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { iconMap } from "@/lib/icon-map";
import { skillPages, getSkillPage } from "@/lib/content/skillPages";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { JsonLd } from "@/components/ui/JsonLd";
import { buildMetadata, serviceJsonLd, courseJsonLd, faqJsonLd } from "@/lib/seo";

export function generateStaticParams() {
  return skillPages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata(props: PageProps<"/skills/[slug]">) {
  const { slug } = await props.params;
  const page = getSkillPage(slug);
  if (!page) return buildMetadata({ title: "Skills", description: "", path: "/skills" });
  return buildMetadata({
    title: page.title,
    description: page.metaDescription,
    path: `/skills/${page.slug}`,
  });
}

export default async function SkillDetailPage(props: PageProps<"/skills/[slug]">) {
  const { slug } = await props.params;
  const page = getSkillPage(slug);
  if (!page) notFound();

  const path = `/skills/${page.slug}`;
  const Icon = iconMap[page.icon];
  const relatedPages = page.related
    .map((r) => getSkillPage(r))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <>
      <JsonLd data={serviceJsonLd({ name: page.h1, description: page.metaDescription, path })} />
      <JsonLd data={courseJsonLd({ name: page.h1, description: page.metaDescription, path })} />
      <JsonLd data={faqJsonLd(page.faqs)} />

      <Section className="pb-10 pt-10 sm:pt-14">
        <Breadcrumbs
          items={[
            { name: "Home", path: "/" },
            { name: "Skills", path: "/skills" },
            { name: page.name, path },
          ]}
        />
        <div className="mt-6 flex max-w-2xl flex-col gap-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ink text-lime">
            <Icon className="h-7 w-7" strokeWidth={1.75} aria-hidden />
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-ink sm:text-5xl">{page.h1}</h1>
          <p className="text-lg font-medium text-ink">{page.usp}</p>
          <p className="text-lg leading-relaxed text-muted">{page.intro}</p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button href="/book-counselling" variant="primary-lime" size="lg">
              Book a Demo
            </Button>
            <Button href="/one-to-one-tuition" variant="secondary-outline" size="lg">
              How Sessions Work
            </Button>
          </div>
        </div>
      </Section>

      <Section tone="surface">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="In sessions" title="What the student works on" />
            <ul className="mt-6 flex flex-col gap-3">
              {page.whatYouLearn.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-ink sm:text-base">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-lime-ink" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <SectionHeading eyebrow="Over time" title="What tends to change" />
            <ul className="mt-6 flex flex-col gap-3">
              {page.outcomes.map((item) => (
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
        <SectionHeading
          eyebrow="How it works"
          title="How 1-to-1 skill sessions are structured"
          description="Every mentor adapts the details, but the shape of the sessions is consistent."
        />
        <ol className="mt-8 grid gap-6 sm:grid-cols-3">
          {page.howItWorks.map((step, index) => (
            <li key={step} className="flex flex-col gap-3 rounded-2xl border border-border bg-white p-6">
              <span className="text-sm font-bold text-lime-ink">{String(index + 1).padStart(2, "0")}</span>
              <p className="text-sm leading-relaxed text-muted">{step}</p>
            </li>
          ))}
        </ol>
      </Section>

      {relatedPages.length > 0 ? (
        <Section tone="surface">
          <SectionHeading eyebrow="Related" title="Other skills students work on" />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {relatedPages.map((p) => (
              <Link key={p.slug} href={`/skills/${p.slug}`}>
                <Card interactive className="h-full">
                  <h3 className="text-base font-semibold text-ink">{p.name}</h3>
                  <p className="mt-2 text-sm text-muted">{p.description}</p>
                </Card>
              </Link>
            ))}
          </div>
        </Section>
      ) : null}

      <Section>
        <SectionHeading eyebrow="FAQ" title={`Questions about ${page.name.toLowerCase()}`} />
        <div className="mt-8 max-w-3xl">
          <FaqAccordion faqs={page.faqs} />
        </div>
      </Section>

      <Section tone="ink">
        <div className="flex flex-col items-center gap-5 text-center">
          <h2 className="max-w-xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Start with a free demo.
          </h2>
          <Button href="/book-counselling" variant="primary-lime" size="lg">
            Book a Demo
          </Button>
        </div>
      </Section>
    </>
  );
}
