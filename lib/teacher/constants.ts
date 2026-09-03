// Client-safe teacher-onboarding constants + pure helpers. NO "server-only",
// NO prisma runtime import — this module is imported by client components
// (admin pages, forms) as well as server code. The stage engine that does
// touch the database lives in lib/teacher/onboarding.ts, which re-exports
// everything here for server callers.

export const ONBOARDING_STAGES = [
  { key: "CONTACT", label: "Contact received" },
  { key: "FORM", label: "Information form" },
  { key: "DOCUMENTS", label: "Documents verified" },
  { key: "COUNSELING", label: "Counseling" },
  { key: "DEMO", label: "Demo class" },
  { key: "ASSESSMENT", label: "Technical assessment" },
  { key: "VERIFICATION", label: "Super admin review" },
  { key: "APPROVAL", label: "Approved" },
  { key: "PROFILE", label: "Profile completed" },
  { key: "ONBOARDED", label: "Teacher onboarded" },
] as const;

export type OnboardingStageKey = (typeof ONBOARDING_STAGES)[number]["key"];

export const ONBOARDING_STAGE_ORDER = ONBOARDING_STAGES.map((s) => s.key) as OnboardingStageKey[];

export const TECH_ASSESSMENT_ITEMS: { key: string; label: string }[] = [
  { key: "laptop", label: "Laptop" },
  { key: "desktop", label: "Desktop" },
  { key: "tablet", label: "Tablet" },
  { key: "penTablet", label: "Pen tablet" },
  { key: "smartphone", label: "Smartphone" },
  { key: "headphones", label: "Headphones" },
  { key: "microphone", label: "Microphone" },
  { key: "webcam", label: "Webcam" },
  { key: "internet", label: "Stable internet" },
  { key: "internetSpeed", label: "Adequate internet speed" },
  { key: "backupInternet", label: "Backup internet" },
  { key: "powerBackup", label: "Power backup" },
  { key: "quietEnvironment", label: "Quiet teaching environment" },
  { key: "requiredSoftware", label: "Required software / tools" },
];

export const TECH_ASSESSMENT_STATES = ["AVAILABLE", "NOT_AVAILABLE", "NEEDS_VERIFICATION"] as const;
export type TechAssessmentState = (typeof TECH_ASSESSMENT_STATES)[number];

export const DEMO_RATING_CATEGORIES: { key: string; label: string }[] = [
  { key: "subjectKnowledge", label: "Subject knowledge" },
  { key: "conceptClarity", label: "Concept clarity" },
  { key: "communication", label: "Communication" },
  { key: "explanationAbility", label: "Explanation ability" },
  { key: "teachingMethodology", label: "Teaching methodology" },
  { key: "studentEngagement", label: "Student engagement" },
  { key: "confidence", label: "Confidence" },
  { key: "problemSolving", label: "Problem solving" },
  { key: "qualificationSkillMatch", label: "Qualification vs actual skill" },
  { key: "onlineTeachingAbility", label: "Online teaching ability" },
  { key: "technicalReadiness", label: "Technical readiness" },
  { key: "overallPerformance", label: "Overall performance" },
];

// --- Pure view helpers (structural types so no prisma runtime import) -----

type ProfileLike = {
  phone?: string | null;
  whatsapp?: string | null;
  dateOfBirth?: Date | string | null;
  gender?: string | null;
  addressLine?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  highestQualification?: string | null;
  degree?: string | null;
  institution?: string | null;
  qualificationYear?: number | null;
  yearsExperience?: number | null;
  employmentType?: string | null;
  bio?: string | null;
  languages?: string[] | null;
  boards?: string[] | null;
  preferredMode?: string | null;
  preferredDays?: string[] | null;
  subjects?: unknown[];
  grades?: unknown[];
  documents?: unknown[];
};

const PROFILE_COMPLETION_FIELDS: { label: string; filled: (p: ProfileLike) => boolean }[] = [
  { label: "Phone number", filled: (p) => !!p.phone },
  { label: "Date of birth", filled: (p) => !!p.dateOfBirth },
  { label: "Gender", filled: (p) => !!p.gender },
  { label: "Address", filled: (p) => !!p.addressLine && !!p.city && !!p.state && !!p.pincode },
  { label: "Highest qualification", filled: (p) => !!p.highestQualification },
  { label: "Institution", filled: (p) => !!p.institution },
  { label: "Year completed", filled: (p) => !!p.qualificationYear },
  { label: "Years of experience", filled: (p) => p.yearsExperience != null },
  { label: "About you", filled: (p) => !!p.bio },
  { label: "Languages", filled: (p) => (p.languages?.length ?? 0) > 0 },
  { label: "Boards", filled: (p) => (p.boards?.length ?? 0) > 0 },
  { label: "Subjects", filled: (p) => (p.subjects?.length ?? 0) > 0 },
  { label: "Class levels", filled: (p) => (p.grades?.length ?? 0) > 0 },
  { label: "Full-time / part-time", filled: (p) => !!p.employmentType },
  { label: "Preferred teaching mode", filled: (p) => !!p.preferredMode },
  { label: "Preferred days", filled: (p) => (p.preferredDays?.length ?? 0) > 0 },
  { label: "Documents uploaded", filled: (p) => (p.documents?.length ?? 0) > 0 },
];

// ---------------------------------------------------------------------------
// Hard "can this application be submitted?" gate — enforced client-side (to
// disable the Submit button) AND server-side in applyOnboardingForm.
// ---------------------------------------------------------------------------

const REQUIRED_FIELDS: { key: string; label: string }[] = [
  { key: "phone", label: "Phone number" },
  { key: "gender", label: "Gender" },
  { key: "city", label: "City" },
  { key: "state", label: "State" },
  { key: "highestQualification", label: "Highest qualification" },
  { key: "institution", label: "College / university" },
  { key: "yearsExperience", label: "Years of experience" },
  { key: "bio", label: "About you" },
  { key: "employmentType", label: "Full-time / part-time" },
  { key: "preferredMode", label: "Preferred mode" },
];

export const REQUIRED_DOC_TYPES = ["AADHAAR", "PAN", "PHOTO"] as const;
export const REQUIRED_DOC_LABELS: Record<string, string> = {
  AADHAAR: "Aadhaar card",
  PAN: "PAN card",
  PHOTO: "Profile photo",
};

export function missingRequiredApplicationFields(
  v: Record<string, unknown> & { subjectsCount: number; gradesCount: number; daysCount: number },
): string[] {
  const missing = REQUIRED_FIELDS.filter((r) => String(v[r.key] ?? "").trim() === "").map((r) => r.label);
  if (v.subjectsCount < 1) missing.push("At least one subject");
  if (v.gradesCount < 1) missing.push("At least one class level");
  if (v.daysCount < 1) missing.push("At least one available day");
  return missing;
}

export function computeProfileCompletion(profile: ProfileLike): { percent: number; missing: string[] } {
  const missing: string[] = [];
  let filled = 0;
  for (const field of PROFILE_COMPLETION_FIELDS) {
    if (field.filled(profile)) filled += 1;
    else missing.push(field.label);
  }
  return { percent: Math.round((filled / PROFILE_COMPLETION_FIELDS.length) * 100), missing };
}

type StageLike = {
  key: string;
  state: string;
  enteredAt?: Date | string | null;
  completedAt?: Date | string | null;
  notes?: string | null;
};

export function stageTimelineDto(stages: StageLike[]) {
  const byKey = new Map(stages.map((s) => [s.key, s]));
  return ONBOARDING_STAGES.map(({ key, label }) => {
    const row = byKey.get(key);
    return {
      key,
      label,
      state: row?.state ?? "PENDING",
      enteredAt: row?.enteredAt ?? null,
      completedAt: row?.completedAt ?? null,
      notes: row?.notes ?? null,
    };
  });
}
