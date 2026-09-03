import { redirect } from "next/navigation";

// Direct booking is disabled under the counselor-gated assignment model —
// classes are scheduled by an advisor against a subject requirement. Kept as
// a redirect so old links don't 404.
export default async function BookMentorPage() {
  redirect("/student/dashboard");
}
