import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Privacy Policy",
  description:
    "How Remedial One collects, uses, shares, and protects your personal information across the platform.",
  path: "/privacy-policy",
});

const sections = [
  {
    title: "Information We Collect",
    body: "We collect information you provide directly — name, email, phone number, and profile details when you create an account, book a session, or apply as a mentor. We also collect information generated through your use of the platform, such as session history, assessment results, progress metrics, and messages exchanged with mentors or support.",
  },
  {
    title: "How We Use Your Information",
    body: "We use your information to match students with mentors, run and record 1-to-1 sessions, generate progress and learning-gap insights, process bookings, communicate updates, and improve the platform. Assessment and session data is used to personalize mentoring, not for any purpose unrelated to your learning.",
  },
  {
    title: "Cookies & Similar Technologies",
    body: "We use cookies and similar technologies to keep you signed in, remember preferences, and understand how the platform is used, so we can improve it. You can control cookies through your browser settings; disabling them may affect parts of the platform that require you to be signed in.",
  },
  {
    title: "How We Share Information",
    body: "We share the minimum information necessary for the platform to work: a student's relevant profile and progress details with their assigned mentor, a mentor's profile with prospective students, and account information with service providers who host our infrastructure or process payments on our behalf, under contractual confidentiality obligations. We do not sell personal information.",
  },
  {
    title: "Data Retention",
    body: "We retain account and session data for as long as your account is active, and for a limited period afterward as needed for legal, accounting, or dispute-resolution purposes. You can request deletion of your account and associated personal data at any time, subject to records we're required to keep by law.",
  },
  {
    title: "Children's Privacy",
    body: "Remedial One is used by students under 18 with a parent or guardian's involvement. Parent accounts can be linked to a student's account to provide visibility into sessions, progress, and feedback. We do not knowingly collect more information from a minor than is necessary to provide the service.",
  },
  {
    title: "Your Rights",
    body: "Depending on where you live, you may have the right to access, correct, export, or delete your personal information, and to object to or restrict certain processing. To exercise any of these rights, contact us using the details below.",
  },
  {
    title: "Security",
    body: "We use industry-standard safeguards — including encrypted connections, hashed credentials, and access controls — to protect your information. No system is completely secure, so we continuously review and improve our practices.",
  },
  {
    title: "Changes to This Policy",
    body: "We may update this policy as the platform evolves. Material changes will be reflected here with an updated effective date; continued use of Remedial One after changes take effect means you accept the revised policy.",
  },
  {
    title: "Contact Us",
    body: "Questions about this policy or your data can be sent to support@remedial-one.in, or via the Contact page.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <>
      <Section className="pb-10 pt-10 sm:pt-14">
        <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Privacy Policy", path: "/privacy-policy" }]} />
        <div className="mt-6">
          <SectionHeading
            as="h1"
            eyebrow="Privacy Policy"
            title="Your privacy, plainly explained."
            description="This policy explains what information Remedial One collects, how we use and share it, and the choices you have. Last updated August 2026."
          />
        </div>
      </Section>

      <Section tone="surface" className="pt-0">
        <div className="mx-auto flex max-w-3xl flex-col gap-6">
          {sections.map((section) => (
            <article key={section.title} className="rounded-2xl border border-border bg-white p-6 sm:p-8">
              <h2 className="text-xl font-semibold text-ink">{section.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">{section.body}</p>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
