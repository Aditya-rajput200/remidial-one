import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/db/prisma";
import { ForbiddenError, UnauthenticatedError } from "@/lib/auth/errors";
import { getCurrentUser } from "@/lib/auth/session.server";
import type { PermissionKey } from "@/lib/auth/permissions";
import type { Role, User } from "@/lib/generated/prisma/client";

/**
 * Resolves the effective permission set for a user: role defaults from
 * RolePermission, with per-user GRANT/REVOKE overrides from UserPermission
 * applied on top.
 *
 * Wrapped in React `cache()` so a render that checks several permissions
 * (`requirePermission` called more than once, plus nested guards) only pays
 * for the two queries once per `(userId, role)` per request. Still fresh
 * across requests — once Redis is introduced, a short-lived cross-request
 * cache can layer on top here (permission grants change rarely).
 */
export const getEffectivePermissions = cache(async function getEffectivePermissions(
  userId: string,
  role: Role,
): Promise<Set<PermissionKey>> {
  const [rolePermissions, userPermissions] = await Promise.all([
    prisma.rolePermission.findMany({ where: { role }, select: { permission: { select: { key: true } } } }),
    prisma.userPermission.findMany({
      where: { userId },
      select: { effect: true, permission: { select: { key: true } } },
    }),
  ]);

  const effective = new Set<PermissionKey>(rolePermissions.map((rp) => rp.permission.key as PermissionKey));

  for (const override of userPermissions) {
    const key = override.permission.key as PermissionKey;
    if (override.effect === "GRANT") effective.add(key);
    else effective.delete(key);
  }

  return effective;
});

export async function userHasPermission(user: Pick<User, "id" | "role">, permission: PermissionKey): Promise<boolean> {
  const permissions = await getEffectivePermissions(user.id, user.role);
  return permissions.has(permission);
}

/** Throws UnauthenticatedError if no session, else returns the user. */
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) throw new UnauthenticatedError();
  return user;
}

/** Throws unless the current user's role is one of `roles`. */
export async function requireRole(...roles: Role[]): Promise<User> {
  const user = await requireUser();
  if (!roles.includes(user.role)) {
    throw new ForbiddenError(`This action requires one of the following roles: ${roles.join(", ")}`);
  }
  return user;
}

/** Throws unless the current user holds `permission` (via role default or override). */
export async function requirePermission(permission: PermissionKey): Promise<User> {
  const user = await requireUser();
  if (!(await userHasPermission(user, permission))) {
    throw new ForbiddenError(`Missing permission: ${permission}`);
  }
  return user;
}
