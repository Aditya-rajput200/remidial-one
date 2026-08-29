import type { Role } from "@/lib/generated/prisma/enums";

/**
 * Canonical catalog of fine-grained permission keys. This is the source of
 * truth seeded into the `Permission` table by prisma/seed.ts — add new keys
 * here first, then re-run the seed.
 *
 * Ownership-scoped access (a student reading their own sessions, a mentor
 * reading their own students) is NOT modeled as a permission — it's checked
 * directly against resource ownership in the service layer. Permissions here
 * model elevated/cross-user capabilities, which is why STUDENT/MENTOR/PARENT
 * hold no permissions by default (see DEFAULT_ROLE_PERMISSIONS below).
 */
export const PERMISSIONS = {
  "users.read": "View any user account",
  "users.create": "Create user accounts",
  "users.update": "Edit any user account",
  "users.delete": "Delete/disable any user account",
  "roles.manage": "Change a user's role or permission grants",

  "students.read": "View any student's profile and records",
  "students.manage": "Suspend, reactivate, or edit any student",

  "mentors.read": "View any mentor's profile and records",
  "mentors.approve": "Approve or reject mentor applications",
  "mentors.suspend": "Suspend or reactivate a mentor",

  "bookings.read": "View any booking",
  "bookings.manage": "Cancel, reschedule, or modify any booking",

  "meetings.read": "View meeting/session metadata",
  "meetings.join": "Join a meeting as the assigned participant",
  "meetings.join_any": "Join any live meeting as an observer/moderator",
  "meetings.moderate": "Mute/remove participants, send moderation messages",
  "meetings.end": "Forcibly end a live meeting",

  "recordings.read": "View/play any recording",
  "recordings.delete": "Delete a recording",

  "whiteboard.moderate_any": "Lock/unlock, clear, or override student permissions on any session's whiteboard",

  "attendance.read": "View attendance records",
  "attendance.correct": "Modify an attendance record (requires reason)",

  "assessments.read": "View any assessment, attempt, or assessment analytics",
  "assessments.moderate": "Override marks, force-publish results, or archive any assessment",

  "resources.manage": "Approve, hide, delete, or categorize resources",

  "payments.read": "View transactions, invoices, and refunds",
  "payments.refund": "Issue a refund",

  "notifications.send": "Send platform notifications to users",

  "support.read": "View support tickets",
  "support.manage": "Respond to and resolve support tickets",

  "cms.read": "View CMS drafts",
  "cms.update": "Edit CMS content",
  "cms.publish": "Publish CMS content to production",

  "audit.read": "View audit logs",

  "settings.manage": "Change platform settings and feature flags",
} as const;

export type PermissionKey = keyof typeof PERMISSIONS;

export const ALL_PERMISSION_KEYS = Object.keys(PERMISSIONS) as PermissionKey[];

const ADMIN_BASELINE: PermissionKey[] = [
  "users.read",
  "students.read",
  "students.manage",
  "mentors.read",
  "mentors.approve",
  "bookings.read",
  "bookings.manage",
  "meetings.read",
  "recordings.read",
  "attendance.read",
  "attendance.correct",
  "assessments.read",
  "resources.manage",
  "payments.read",
  "notifications.send",
  "support.read",
  "support.manage",
  "cms.read",
  "cms.update",
  "audit.read",
];

/**
 * Default grants per role, seeded into RolePermission. Sensitive,
 * hard-to-reverse capabilities (payments.refund, recordings.delete,
 * meetings.join_any/end, users.delete, roles.manage, settings.manage,
 * cms.publish, whiteboard.moderate_any) are intentionally withheld from
 * ADMIN by default per the project's "no unrestricted admin access
 * automatically" rule — grant them per-user via UserPermission when a
 * specific admin needs them.
 */
export const DEFAULT_ROLE_PERMISSIONS: Record<Role, PermissionKey[]> = {
  STUDENT: [],
  MENTOR: [],
  PARENT: [],
  ADMIN: ADMIN_BASELINE,
  SUPER_ADMIN: ALL_PERMISSION_KEYS,
  CONTENT_MANAGER: ["cms.read", "cms.update", "cms.publish", "resources.manage"],
  SUPPORT_AGENT: ["users.read", "students.read", "mentors.read", "support.read", "support.manage"],
  FINANCE_MANAGER: ["payments.read"],
  MODERATOR: ["meetings.read", "meetings.join_any", "meetings.moderate", "recordings.read", "whiteboard.moderate_any"],
};
