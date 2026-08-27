import { AuthShell } from "@/components/layout/AuthShell";
import { SignupForm } from "@/components/forms/SignupForm";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Sign Up",
  description: "Create a Remedial One account and start your personalized learning journey.",
  path: "/signup",
  noIndex: true,
});

export default function SignupPage() {
  return (
    <AuthShell
      eyebrow="Get started"
      title="Learning, designed around you, starts here."
      description="Create an account to find your mentor and begin your 1-to-1 learning journey."
    >
      <SignupForm />
    </AuthShell>
  );
}
