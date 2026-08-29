import { Suspense } from "react";
import { AuthShell } from "@/components/layout/AuthShell";
import { VerifyEmailStatus } from "@/components/forms/VerifyEmailStatus";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Verify Email",
  description: "Confirm your email address to activate your Remedial One account.",
  path: "/verify-email",
  noIndex: true,
});

export default function VerifyEmailPage() {
  return (
    <AuthShell
      eyebrow="Almost there"
      title="Confirming your email."
      description="One quick step before you can start booking sessions."
    >
      <Suspense fallback={null}>
        <VerifyEmailStatus />
      </Suspense>
    </AuthShell>
  );
}
