import { Mail, MapPin } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ContactForm } from "@/components/forms/ContactForm";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Contact Us — Free Guidance for Students & Parents",
  description:
    "Get in touch with the Remedial One team for free guidance on personalized learning, choosing a subject or mentor, or becoming a mentor yourself.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <Section className="pb-10 pt-10 sm:pt-14">
        <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Contact", path: "/contact" }]} />
        <div className="mt-6">
          <SectionHeading
            as="h1"
            eyebrow="Contact"
            title="We'd love to hear from you."
            description="Not sure which subject, class, or learning path fits best? Reach out for free guidance — questions about personalized learning, mentorship, or becoming a mentor are all welcome, and our team will get back to you."
          />
        </div>
      </Section>

      <Section tone="surface" className="pt-0">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-start">
          <div className="flex flex-col gap-6">
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-5 w-5 text-ink" aria-hidden />
              <div>
                <p className="text-sm font-semibold text-ink">Email</p>
                <p className="text-sm text-muted">hello@remedialone.com</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 text-ink" aria-hidden />
              <div>
                <p className="text-sm font-semibold text-ink">Based in</p>
                <p className="text-sm text-muted">India — serving students globally</p>
              </div>
            </div>
          </div>
          <ContactForm />
        </div>
      </Section>
    </>
  );
}
