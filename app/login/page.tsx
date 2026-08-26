import { AuthShell } from "@/components/layout/AuthShell";
import { LoginForm } from "@/components/forms/LoginForm";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Login",
  description: "Log in to your Remedial One account.",
  path: "/login",
  noIndex: true,
});

export default function LoginPage() {
  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Pick up your learning journey right where you left off."
      description="Log in to view your sessions, mentors, and progress."
    >
      <LoginForm />
    </AuthShell>
  );
}
