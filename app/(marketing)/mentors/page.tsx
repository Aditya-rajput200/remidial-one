import { UsersRound } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { MentorCard } from "@/components/ui/MentorCard";
import { mentorPreviews } from "@/lib/content/mentors";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Find a Mentor",
  description:
    "Browse mentors for personalized 1-to-1 learning on Remedial One. Mentor applications are open — profiles are launching soon.",
  path: "/mentors",
});

export default function MentorsPage() {
  return (
    <>
      <Section className="pb-10 pt-10 sm:pt-14">
        <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Mentors", path: "/mentors" }]} />
        <div className="mt-6">
          <SectionHeading
            as="h1"
            eyebrow="Mentors"
            title="Find a mentor built for how you learn."
            description="Mentor applications are open right now. Full profiles — subjects, qualifications, availability, and reviews — will appear here as mentors are verified and onboarded."
          />
        </div>
      </Section>

      <Section tone="surface" className="pt-0">
        <EmptyState
          icon={UsersRound}
          title="Mentor profiles launching soon"
          description="We're onboarding and verifying our first mentors. In the meantime, here's a preview of how mentor profiles will look."
          action={
            <Button href="/become-a-mentor" variant="primary-black" size="md">
              Become a Mentor
            </Button>
          }
        />
      </Section>

      <Section>
        <SectionHeading eyebrow="Preview" title="What a mentor profile will look like" />
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {mentorPreviews.map((mentor) => (
            <MentorCard key={mentor.slug} mentor={mentor} />
          ))}
        </div>
      </Section>
    </>
  );
}
