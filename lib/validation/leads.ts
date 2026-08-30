import { z } from "zod";

// `website` is a honeypot: a hidden field real visitors never see or fill,
// so a non-empty value marks the submission as a bot. Route handlers check
// it explicitly (see app/api/counselling-requests, app/api/contact-messages)
// and respond as if the submission succeeded without writing or emailing
// anything — silently dropping it, rather than a validation error, so bots
// don't learn to leave the field blank.
const honeypot = z.string().max(0).optional().or(z.literal(""));

export const counsellingRequestSchema = z.object({
  parentName: z.string().trim().min(1, "Please enter a parent or guardian name.").max(120),
  studentName: z.string().trim().min(1, "Please enter the student's name.").max(120),
  relation: z.enum(["parent", "student", "other"]).default("parent"),
  email: z.string().trim().email("Enter a valid email address.").max(200),
  phone: z.string().trim().min(7, "Enter a valid phone number.").max(30),
  classBand: z.string().trim().max(60).optional(),
  focusArea: z.string().trim().max(200).optional(),
  preferredTime: z.enum(["morning", "afternoon", "evening"]).optional(),
  message: z.string().trim().max(2000).optional(),
  website: honeypot,
});

export const contactMessageSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name.").max(120),
  email: z.string().trim().email("Enter a valid email address.").max(200),
  reason: z.enum(["student", "mentor", "other"]).default("student"),
  message: z.string().trim().min(1, "Tell us a little about what you need.").max(2000),
  website: honeypot,
});

export const updateLeadStatusSchema = z.object({
  status: z.enum(["NEW", "CONTACTED", "SCHEDULED", "CLOSED"]).optional(),
  internalNotes: z.string().trim().max(2000).optional(),
});

export const logLeadActivitySchema = z.object({
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
  // Cleared (set to null on the lead) when omitted — logging an activity
  // resolves whatever the previous follow-up reminder was for; a new date
  // here schedules the next one, no date means there's nothing pending.
  nextFollowUpAt: z.coerce.date().optional(),
  status: z.enum(["NEW", "CONTACTED", "SCHEDULED", "CLOSED"]).optional(),
});
