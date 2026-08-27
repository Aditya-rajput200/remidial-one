import type { User } from "@/lib/generated/prisma/client";

/** Strips server-only fields (passwordHash) before a user record leaves the API. */
export function toPublicUser(user: User) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    emailVerifiedAt: user.emailVerifiedAt,
    timezone: user.timezone,
    locale: user.locale,
    country: user.country,
    createdAt: user.createdAt,
  };
}
