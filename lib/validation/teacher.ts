import { z } from "zod";
import { TECH_ASSESSMENT_ITEMS, TECH_ASSESSMENT_STATES, DEMO_RATING_CATEGORIES } from "@/lib/teacher/constants";

// Honeypot — see lib/validation/leads.ts for the rationale.
const honeypot = z.string().max(0).optional().or(z.literal(""));

// ---------------------------------------------------------------------------
// Public "Become a Mentor" application form -> TeacherLead
// ---------------------------------------------------------------------------

export const teacherLeadSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name.").max(120),
  email: z.string().trim().email("Enter a valid email address.").max(200),
  phone: z.string().trim().min(7, "Enter a valid phone number.").max(30),
  whatsapp: z.string().trim().max(30).optional(),
  city: z.string().trim().max(80).optional(),
  state: z.string().trim().max(80).optional(),
  interestedSubjects: z.array(z.string().trim().max(80)).max(20).default([]),
  interestedGrades: z.array(z.string().trim().max(80)).max(20).default([]),
  message: z.string().trim().max(2000).optional(),
  website: honeypot,
});

// ---------------------------------------------------------------------------
// Admin/counselor lead management
// ---------------------------------------------------------------------------

export const TEACHER_LEAD_STATUSES = [
  "NEW",
  "CONTACTED",
  "FORM_SENT",
  "FORM_SUBMITTED",
  "DOCUMENTS_PENDING",
  "UNDER_REVIEW",
  "COUNSELING_PENDING",
  "COUNSELING_COMPLETED",
  "DEMO_PENDING",
  "DEMO_COMPLETED",
  "ASSESSMENT_PENDING",
  "ASSESSMENT_COMPLETED",
  "VERIFICATION_PENDING",
  "APPROVED",
  "REJECTED",
  "ONBOARDED",
  "INACTIVE",
] as const;

export const updateTeacherLeadSchema = z.object({
  status: z.enum(TEACHER_LEAD_STATUSES).optional(),
  assignedToId: z.string().trim().max(40).nullable().optional(),
  internalNotes: z.string().trim().max(4000).optional(),
});

export const logTeacherLeadActivitySchema = z.object({
  outcome: z.enum([
    "CALL_NO_ANSWER",
    "CALL_CONNECTED",
    "EMAILED",
    "WHATSAPP_SENT",
    "SCHEDULED_CALL",
    "NOT_INTERESTED",
    "CONVERTED",
    "OTHER",
  ]),
  note: z.string().trim().max(1000).optional(),
  nextFollowUpAt: z.coerce.date().optional(),
  status: z.enum(TEACHER_LEAD_STATUSES).optional(),
});

export const convertTeacherLeadSchema = z.object({
  // Optional overrides — default to the lead's own values.
  name: z.string().trim().min(1).max(120).optional(),
  email: z.string().trim().email().max(200).optional(),
});

// ---------------------------------------------------------------------------
// Teacher onboarding information form (Module 2) — submitted by the teacher
// ---------------------------------------------------------------------------

const optionalString = (max: number) => z.string().trim().max(max).optional();

export const teacherOnboardingFormSchema = z.object({
  // Personal
  phone: z.string().trim().min(7).max(30),
  whatsapp: optionalString(30),
  dateOfBirth: z.coerce.date().optional(),
  gender: optionalString(30),
  addressLine: optionalString(240),
  city: optionalString(80),
  state: optionalString(80),
  pincode: optionalString(12),
  // Professional
  highestQualification: optionalString(120),
  degree: optionalString(120),
  institution: optionalString(160),
  qualificationYear: z.coerce.number().int().min(1950).max(new Date().getFullYear() + 1).optional(),
  yearsExperience: z.coerce.number().int().min(0).max(70).optional(),
  currentOccupation: optionalString(120),
  previousExperience: optionalString(2000),
  employmentType: z.enum(["FULL_TIME", "PART_TIME"]).optional(),
  availabilityHoursPerWeek: z.coerce.number().int().min(1).max(80).optional(),
  bio: optionalString(2000),
  teachingStyle: optionalString(2000),
  qualifications: optionalString(2000),
  languages: z.array(z.string().trim().max(40)).max(20).default([]),
  boards: z.array(z.string().trim().max(40)).max(20).default([]),
  subjectSlugs: z.array(z.string().trim().max(80)).max(30).default([]),
  gradeSlugs: z.array(z.string().trim().max(80)).max(30).default([]),
  // Preferences
  preferredMode: z.enum(["ONLINE", "OFFLINE", "BOTH"]).optional(),
  preferredStudentAgeGroup: optionalString(60),
  preferredClassDurationMin: z.coerce.number().int().min(15).max(240).optional(),
  preferredDays: z.array(z.string().trim().max(12)).max(7).default([]),
  preferredHours: optionalString(120),
  expectedRate: z.coerce.number().min(0).max(100000).optional(),
  // Technical readiness — free-form bag validated loosely
  techSetup: z.record(z.string(), z.union([z.boolean(), z.string().max(120), z.number()])).optional(),
  // true = final submit (locks FORM stage); false/absent = save draft
  submit: z.boolean().default(false),
});

// ---------------------------------------------------------------------------
// Documents
// ---------------------------------------------------------------------------

export const TEACHER_DOCUMENT_TYPES = [
  "AADHAAR",
  "PAN",
  "QUALIFICATION_CERTIFICATE",
  "EXPERIENCE_CERTIFICATE",
  "PHOTO",
  "OTHER",
] as const;

const ALLOWED_DOC_MIME = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);
const MAX_DOC_BYTES = 10 * 1024 * 1024;

export function validateTeacherDocumentFile(file: { type: string; size: number }): { ok: true } | { ok: false; error: string } {
  if (!ALLOWED_DOC_MIME.has(file.type)) {
    return { ok: false, error: "Only PDF, JPEG, PNG, or WebP files are allowed." };
  }
  if (file.size > MAX_DOC_BYTES) {
    return { ok: false, error: "File is larger than the 10 MB limit." };
  }
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Counseling (Step 3)
// ---------------------------------------------------------------------------

export const teacherCounselingSchema = z.object({
  scheduledAt: z.coerce.date().optional(),
  mode: optionalString(40),
  notes: optionalString(4000),
  teacherExpectations: optionalString(2000),
  subjectDiscussion: optionalString(2000),
  experienceVerified: z.boolean().optional(),
  communicationNotes: optionalString(2000),
  availabilityNotes: optionalString(2000),
  compensationNotes: optionalString(2000),
  recommendation: optionalString(2000),
  outcome: z.enum(["PASS", "HOLD", "REQUIRES_FOLLOW_UP", "REJECT"]).optional(),
  // true = mark this counseling record complete (advances the stage)
  complete: z.boolean().default(false),
});

// ---------------------------------------------------------------------------
// Demo (Step 4)
// ---------------------------------------------------------------------------

export const teacherDemoScheduleSchema = z.object({
  scheduledAt: z.coerce.date().refine((d) => d.getTime() > Date.now() - 60_000, "Pick a future time."),
  subject: optionalString(80),
  gradeLabel: optionalString(80),
  topic: optionalString(160),
  durationMinutes: z.coerce.number().int().min(10).max(180).optional(),
  meetingLink: z.string().trim().url().max(500).optional().or(z.literal("")),
  evaluatorId: z.string().trim().max(40).optional(),
  notes: optionalString(2000),
});

const ratingShape = Object.fromEntries(
  DEMO_RATING_CATEGORIES.map((c) => [c.key, z.coerce.number().int().min(1).max(5).optional()]),
);

export const teacherDemoEvaluationSchema = z.object({
  result: z.enum(["PASS", "FAIL", "REDEMO_REQUIRED"]),
  ratings: z.object(ratingShape).partial().optional(),
  evaluatorComments: optionalString(4000),
});

// ---------------------------------------------------------------------------
// Technical assessment (Step 5)
// ---------------------------------------------------------------------------

const techItemShape = Object.fromEntries(
  TECH_ASSESSMENT_ITEMS.map((i) => [i.key, z.enum(TECH_ASSESSMENT_STATES).optional()]),
);

export const teacherTechAssessmentSchema = z.object({
  items: z.object(techItemShape).partial(),
  adminNotes: optionalString(4000),
  complete: z.boolean().default(false),
});

// ---------------------------------------------------------------------------
// Super admin verification (Step 6)
// ---------------------------------------------------------------------------

export const teacherVerificationSchema = z
  .object({
    action: z.enum(["APPROVE", "REJECT", "SEND_BACK", "REQUEST_INFO"]),
    reason: z.string().trim().max(4000).optional(),
  })
  .refine((v) => v.action === "APPROVE" || (v.reason && v.reason.length > 0), {
    message: "A reason is required to reject, send back, or request more information.",
    path: ["reason"],
  });

export const overrideStageSchema = z.object({
  key: z.enum([
    "CONTACT",
    "FORM",
    "DOCUMENTS",
    "COUNSELING",
    "DEMO",
    "ASSESSMENT",
    "VERIFICATION",
    "APPROVAL",
    "PROFILE",
    "ONBOARDED",
  ]),
  state: z.enum(["PENDING", "CURRENT", "COMPLETED", "FAILED", "SKIPPED"]),
  notes: z.string().trim().max(2000).optional(),
});
