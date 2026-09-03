import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { iconMap } from "@/lib/icon-map";
import { subjects } from "@/lib/content/subjects";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { JsonLd } from "@/components/ui/JsonLd";
import { buildMetadata, itemListJsonLd } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Subjects — 1-to-1 Tuition for Students",
  description:
    "Explore every subject taught 1-to-1 at Remedial One — Maths, Physics, Chemistry, Biology, English, Computer Science, and more. Each with a mentor who genuinely knows the subject.",
  path: "/subjects",
});

export default function SubjectsPage() {
  return (
    <>
      <JsonLd
        data={itemListJsonLd({
          name: "Subjects taught 1-to-1",
          items: subjects.map((subject) => ({
            name: subject.name,
            path: `/subjects/${subject.slug}`,
          })),
        })}
      />

      <Section className="pb-10 pt-10 sm:pt-14">
        <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Subjects", path: "/subjects" }]} />
        <div className="mt-6 max-w-2xl">
          <SectionHeading
            as="h1"
            eyebrow="Subjects"
            title="Every subject, taught one student at a time."
            description="Core academics and beyond — each subject paced to a real learning-gap assessment, with a mentor matched to it. Pick a subject to see what sessions cover."
          />
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="/book-counselling" variant="primary-lime" size="lg">
              Book a Demo
            </Button>
            <Button href="/online-tuition" variant="secondary-outline" size="lg">
              How Online Tuition Works
            </Button>
          </div>
        </div>
      </Section>

      <Section tone="surface" className="pt-0">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => {
            const Icon = iconMap[subject.icon];
            return (
              <Link key={subject.slug} href={`/subjects/${subject.slug}`} className="group">
                <Card interactive className="flex h-full flex-col gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-lime-soft text-ink">
                    <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                  </div>
                  <div className="flex flex-1 flex-col gap-2">
                    <h2 className="text-lg font-semibold text-ink">{subject.name}</h2>
                    <p className="text-sm leading-relaxed text-muted">{subject.shortDescription}</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {subject.classesCovered.map((cls) => (
                      <Badge key={cls} tone="outline">
                        {cls}
                      </Badge>
                    ))}
                  </div>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-ink transition-colors group-hover:text-lime-deep">
                    View subject
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
            See exactly how sessions would work.
          </h2>
          <p className="max-w-lg text-base leading-relaxed text-white/70">
            Book a free demo and we will walk through the gaps and show how a 1-to-1 plan targets them, subject by subject.
          </p>
          <Button href="/book-counselling" variant="primary-lime" size="lg">
            Book a Demo
          </Button>
        </div>
      </Section>
    </>
  );
}
