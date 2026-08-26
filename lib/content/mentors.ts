export type MentorPreview = {
  slug: string;
  displayName: string;
  role: string;
  subjects: string[];
  bio: string;
  teachingStyle: string;
  isPreview: true;
};

/**
 * No real mentors are onboarded yet. These two entries exist only to preview
 * the MentorCard / mentor-profile layout and are always rendered with an
 * explicit "Sample profile" badge — never presented as real people.
 */
export const mentorPreviews: MentorPreview[] = [
  {
    slug: "sample-mathematics-mentor",
    displayName: "Sample Mentor",
    role: "Mathematics Mentor",
    subjects: ["Mathematics"],
    bio: "This is a placeholder profile showing how a mentor's introduction, qualifications, and teaching approach will appear once real mentors are onboarded.",
    teachingStyle: "Illustrative only — real teaching-style details will appear here.",
    isPreview: true,
  },
  {
    slug: "sample-communication-mentor",
    displayName: "Sample Mentor",
    role: "Communication Skills Mentor",
    subjects: ["Communication Skills"],
    bio: "This is a placeholder profile showing how a mentor's introduction, qualifications, and teaching approach will appear once real mentors are onboarded.",
    teachingStyle: "Illustrative only — real teaching-style details will appear here.",
    isPreview: true,
  },
];

export function getMentorPreviewBySlug(slug: string) {
  return mentorPreviews.find((mentor) => mentor.slug === slug);
}
