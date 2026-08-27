import { z } from "zod";

export const createBookingSchema = z.object({
  mentorId: z.string().min(1),
  subjectSlug: z.string().min(1),
  gradeLabel: z.string().trim().max(100).optional(),
  scheduledAt: z.coerce.date().refine((d) => d.getTime() > Date.now(), { message: "scheduledAt must be in the future" }),
  durationMinutes: z.number().int().min(15).max(180).default(60),
  studentNotes: z.string().trim().max(1000).optional(),
});

export const cancelBookingSchema = z.object({
  reason: z.string().trim().max(500).optional(),
});

export const rescheduleBookingSchema = z.object({
  scheduledAt: z.coerce.date().refine((d) => d.getTime() > Date.now(), { message: "scheduledAt must be in the future" }),
});
