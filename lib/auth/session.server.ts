import "server-only";
import { cookies, headers } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import { generateRawToken, hashToken } from "@/lib/auth/tokens";
import { SESSION_COOKIE } from "@/lib/auth/constants";
import type { User } from "@/lib/generated/prisma/client";

export { SESSION_COOKIE };
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const LAST_SEEN_THROTTLE_MS = 5 * 60 * 1000; // avoid a write on every request

export type AuthenticatedUser = User;

async function requestMeta() {
  const h = await headers();
  const forwardedFor = h.get("x-forwarded-for");
  return {
    userAgent: h.get("user-agent") ?? undefined,
    ip: forwardedFor ? forwardedFor.split(",")[0]?.trim() : undefined,
  };
}

export async function createSession(userId: string) {
  const raw = generateRawToken();
  const { userAgent, ip } = await requestMeta();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await prisma.session.create({
    data: {
      userId,
      tokenHash: hashToken(raw),
      userAgent,
      ip,
      expiresAt,
    },
  });

  const jar = await cookies();
  jar.set(SESSION_COOKIE, raw, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

/** Returns the current session row (with user) after validating it's live, or null. */
export async function getCurrentSession() {
  const jar = await cookies();
  const raw = jar.get(SESSION_COOKIE)?.value;
  if (!raw) return null;

  const tokenHash = hashToken(raw);
  const session = await prisma.session.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!session || session.revokedAt || session.expiresAt < new Date()) {
    return null;
  }

  if (Date.now() - session.lastSeenAt.getTime() > LAST_SEEN_THROTTLE_MS) {
    await prisma.session.update({
      where: { id: session.id },
      data: { lastSeenAt: new Date() },
    });
  }

  return session;
}

export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  const session = await getCurrentSession();
  return session?.user ?? null;
}

export async function destroyCurrentSession() {
  const jar = await cookies();
  const raw = jar.get(SESSION_COOKIE)?.value;
  if (raw) {
    await prisma.session.updateMany({
      where: { tokenHash: hashToken(raw) },
      data: { revokedAt: new Date() },
    });
  }
  jar.delete(SESSION_COOKIE);
}

export async function revokeAllSessions(userId: string, exceptSessionId?: string) {
  await prisma.session.updateMany({
    where: { userId, id: exceptSessionId ? { not: exceptSessionId } : undefined, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}
