import { TeacherOnboardingForm } from "@/components/forms/TeacherOnboardingForm";

export default async function ApplyPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Your teacher application</h1>
        <p className="mt-1 text-sm text-muted">
          Fill in your details and upload your documents. Your progress is saved as you go — you can come back
          to this link any time.
        </p>
      </div>
      <TeacherOnboardingForm
        stateUrl={`/api/apply/${token}`}
        docsUrl={`/api/apply/${token}/documents`}
        showTimeline={false}
      />
    </div>
  );
}
