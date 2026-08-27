import { notFound } from "next/navigation";
import { UserRound, Info } from "lucide-react";
import { mentorPreviews, getMentorPreviewBySlug } from "@/lib/content/mentors";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { buildMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return mentorPreviews.map((mentor) => ({ mentor: mentor.slug }));
}

export async function generateMetadata(props: PageProps<"/mentors/[mentor]">) {
  const { mentor: slug } = await props.params;
  const mentor = getMentorPreviewBySlug(slug);
  if (!mentor) return buildMetadata({ title: "Mentor", description: "", path: "/mentors", noIndex: true });

  return buildMetadata({
    title: `${mentor.displayName} — Sample Mentor Profile`,
    description: "A preview of the mentor profile layout on Remedial One.",
    path: `/mentors/${mentor.slug}`,
    noIndex: true,
  });
}

const profileFields = [
  { label: "Qualifications", value: "Displayed once mentor verification is complete." },
  { label: "Experience", value: "Displayed once mentor verification is complete." },
  { label: "Languages", value: "Displayed once mentor verification is complete." },
  { label: "Availability", value: "Displayed once mentor sets their schedule." },
];

export default async function MentorProfilePage(props: PageProps<"/mentors/[mentor]">) {
  const { mentor: slug } = await props.params;
  const mentor = getMentorPreviewBySlug(slug);

  if (!mentor) {
    notFound();
  }

  return (
    <>
      <Section className="pb-10 pt-10 sm:pt-14">
        <Breadcrumbs
          items={[
            { name: "Home", path: "/" },
            { name: "Mentors", path: "/mentors" },
            { name: mentor.displayName, path: `/mentors/${mentor.slug}` },
          ]}
        />

        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-border-strong bg-surface p-4 text-sm text-muted">
          <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <p>
            This is a sample profile that previews the mentor page layout. No real mentors have
            been onboarded yet.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-surface text-muted-2">
            <UserRound className="h-10 w-10" strokeWidth={1.5} aria-hidden />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                {mentor.displayName}
              </h1>
              <Badge tone="outline">Sample profile</Badge>
            </div>
            <p className="text-base font-medium text-muted">{mentor.role}</p>
          </div>
        </div>
      </Section>

      <Section tone="surface">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading title="About this mentor" />
            <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">{mentor.bio}</p>
            <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
              {mentor.teachingStyle}
            </p>
          </div>
          <div>
            <SectionHeading title="Profile details" />
            <dl className="mt-4 flex flex-col gap-4">
              {profileFields.map((field) => (
                <div key={field.label} className="rounded-xl border border-border bg-white p-4">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-2">
                    {field.label}
                  </dt>
                  <dd className="mt-1 text-sm text-muted">{field.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </Section>

      <Section tone="ink">
        <div className="flex flex-col items-center gap-5 text-center">
          <h2 className="max-w-xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Want to be one of our first mentors?
          </h2>
          <Button href="/become-a-mentor" variant="primary-lime" size="lg">
            Apply as a Mentor
          </Button>
        </div>
      </Section>
    </>
  );
}
