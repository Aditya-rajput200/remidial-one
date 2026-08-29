import { AuthShell } from "@/components/layout/AuthShell";
import { ForgotPasswordForm } from "@/components/forms/ForgotPasswordForm";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Forgot Password",
  description: "Reset your Remedial One account password.",
  path: "/forgot-password",
  noIndex: true,
});

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      eyebrow="Account recovery"
      title="We'll help you get back in."
      description="Enter your email and we'll send you a link to reset your password."
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
