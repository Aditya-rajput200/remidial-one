import { z } from "zod";

const slot = z
  .object({
    dayOfWeek: z.number().int().min(0).max(6),
    startHour: z.number().int().min(0).max(23),
    endHour: z.number().int().min(1).max(24),
  })
  .refine((s) => s.endHour > s.startHour, { message: "endHour must be after startHour", path: ["endHour"] });

export const setAvailabilitySchema = z.object({
  slots: z.array(slot).max(50),
});
