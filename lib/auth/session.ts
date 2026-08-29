// Client-safe auth types. Real session state now lives server-side
// (httpOnly cookie + Session table) — see lib/auth/session.server.ts and
// lib/auth/SessionProvider.tsx. This file only holds shapes shared with
// client components.

export type Role = "student" | "mentor" | "parent" | "admin" | "super_admin" | "content_manager";

export type Session = {
  id: string;
  name: string;
  avatarUrl: string | null;
  email: string;
  role: Role;
  status: "PENDING_VERIFICATION" | "ACTIVE" | "SUSPENDED" | "DISABLED";
  emailVerifiedAt: string | null;
};

export type ApiRole = "STUDENT" | "MENTOR" | "PARENT" | "ADMIN" | "SUPER_ADMIN" | "CONTENT_MANAGER";

const API_TO_CLIENT_ROLE: Record<ApiRole, Role> = {
  STUDENT: "student",
  MENTOR: "mentor",
  PARENT: "parent",
  ADMIN: "admin",
  SUPER_ADMIN: "super_admin",
  CONTENT_MANAGER: "content_manager",
};

export function dashboardPathForRole(role: Role): string {
  switch (role) {
    case "mentor":
      return "/mentor/dashboard";
    case "parent":
      return "/parent/dashboard";
    case "admin":
    case "super_admin":
    case "content_manager":
      return "/admin";
    default:
      return "/student/dashboard";
  }
}

export function toClientSession(user: {
  id: string;
  name: string;
  avatarUrl?: string | null;
  email: string;
  role: ApiRole;
  status: Session["status"];
  emailVerifiedAt: string | Date | null;
}): Session {
  return {
    id: user.id,
    name: user.name,
    avatarUrl: user.avatarUrl ?? null,
    email: user.email,
    role: API_TO_CLIENT_ROLE[user.role],
    status: user.status,
    emailVerifiedAt: user.emailVerifiedAt ? new Date(user.emailVerifiedAt).toISOString() : null,
  };
}
