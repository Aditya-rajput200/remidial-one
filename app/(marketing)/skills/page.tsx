import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { iconMap } from "@/lib/icon-map";
import { skillPages } from "@/lib/content/skillPages";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { JsonLd } from "@/components/ui/JsonLd";
import { buildMetadata, itemListJsonLd } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Skills Beyond Academics — 1-to-1 Classes for Students",
  description:
    "One-to-one online classes in the skills school rarely teaches directly — public speaking, confidence, critical thinking, leadership, life skills, and more. Each with its own mentor.",
  path: "/skills",
});

export default function SkillsPage() {
  return (
    <>
      <JsonLd
        data={itemListJsonLd({
          name: "Skills Beyond Academics",
          items: skillPages.map((skill) => ({
            name: skill.name,
            path: `/skills/${skill.slug}`,
          })),
        })}
      />

      <Section className="pb-10 pt-10 sm:pt-14">
        <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Skills", path: "/skills" }]} />
        <div className="mt-6 max-w-2xl">
          <SectionHeading
            as="h1"
            eyebrow="Beyond Academics"
            title="The skills that carry past the syllabus."
            description="Communication, confidence, judgement, and everyday systems — taught the same way as our academic tuition: one mentor, one student, built around where the student actually is."
          />
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="/book-counselling" variant="primary-lime" size="lg">
              Book a Demo
            </Button>
            <Button href="/learn" variant="secondary-outline" size="lg">
              Explore the Learn Library
            </Button>
          </div>
        </div>
      </Section>

      <Section tone="surface" className="pt-0">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {skillPages.map((skill) => {
            const Icon = iconMap[skill.icon];
            return (
              <Link key={skill.slug} href={`/skills/${skill.slug}`} className="group">
                <Card interactive className="flex h-full flex-col gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink text-lime">
                    <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                  </div>
                  <div className="flex flex-1 flex-col gap-2">
                    <h2 className="text-lg font-semibold text-ink">{skill.name}</h2>
                    <p className="text-sm leading-relaxed text-muted">{skill.description}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-ink transition-colors group-hover:text-lime-deep">
                    Explore
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </span>
                </Card>
              </Link>
            );
          })}
        </div>
      </Section>

      <Section tone="ink">
        <div className="flex flex-col items-center gap-5 text-center">
          <h2 className="max-w-xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Not sure which skill to start with?
          </h2>
          <p className="max-w-lg text-base leading-relaxed text-white/70">
            A free demo is the quickest way to work out where 1-to-1 sessions would help most.
          </p>
          <Button href="/book-counselling" variant="primary-lime" size="lg">
            Book a Demo
          </Button>
        </div>
      </Section>
    </>
  );
}
