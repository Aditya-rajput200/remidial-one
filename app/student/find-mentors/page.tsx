import { redirect } from "next/navigation";

// Self-serve mentor discovery is retired under the counselor-gated
// assignment model — an advisor assigns a teacher per subject. Kept as a
// redirect so any old links/bookmarks land somewhere sensible.
export default function FindMentorsPage() {
  redirect("/student/mentors");
}
