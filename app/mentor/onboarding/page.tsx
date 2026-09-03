import { PageHeader } from "@/components/dashboard/PageHeader";
import { TeacherOnboardingForm } from "@/components/forms/TeacherOnboardingForm";

// Logged-in view of the same application form (for a mentor who signed up
// directly, or is editing after "send back for correction"). The primary
// path is the no-login /apply/<token> link generated from the admin Leads
// page — both write to the same MentorProfile.
export default function MentorOnboardingPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Your application" description="Track your onboarding and keep your details up to date." />
      <TeacherOnboardingForm stateUrl="/api/mentors/me/onboarding" docsUrl="/api/mentors/me/documents" />
    </div>
  );
}
