import { Suspense } from "react";
import { AuthShell } from "@/components/layout/AuthShell";
import { ResetPasswordForm } from "@/components/forms/ResetPasswordForm";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Reset Password",
  description: "Choose a new password for your Remedial One account.",
  path: "/reset-password",
  noIndex: true,
});

export default function ResetPasswordPage() {
  return (
    <AuthShell
      eyebrow="Account recovery"
      title="Choose a new password."
      description="Pick something strong you haven't used before."
    >
      <Suspense fallback={null}>
        <ResetPasswordForm />
      </Suspense>
    </AuthShell>
  );
}
