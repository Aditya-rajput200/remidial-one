import { z } from "zod";

export const ALL_ROLES = [
  "STUDENT",
  "MENTOR",
  "PARENT",
  "ADMIN",
  "SUPER_ADMIN",
  "CONTENT_MANAGER",
  "SUPPORT_AGENT",
  "FINANCE_MANAGER",
  "MODERATOR",
] as const;

// Permission keys are validated against ALL_PERMISSION_KEYS (lib/auth/permissions.ts)
// in the route handler, not here — that catalog can grow without this file
// needing to track it.
export const updateUserAccessSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("change_role"), role: z.enum(ALL_ROLES) }),
  z.object({
    action: z.literal("grant_permission"),
    permissionKey: z.string().min(1),
    reason: z.string().trim().max(500).optional(),
  }),
  z.object({
    action: z.literal("revoke_permission"),
    permissionKey: z.string().min(1),
    reason: z.string().trim().max(500).optional(),
  }),
  z.object({ action: z.literal("remove_override"), permissionKey: z.string().min(1) }),
]);
