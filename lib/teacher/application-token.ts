import "server-only";
import { prisma } from "@/lib/db/prisma";
import { generateRawToken, hashToken } from "@/lib/auth/tokens";
import type { Prisma } from "@/lib/generated/prisma/client";

const APPLICATION_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

/**
 * (Re)issues the no-login application link for an applicant. Stores only the
 * SHA-256 hash; the returned raw token goes into the /apply/<token> URL that
 * is emailed / shared. Regenerating invalidates any previous link.
 */
export async function issueApplicationToken(mentorProfileId: string): Promise<string> {
  const raw = generateRawToken();
  await prisma.mentorProfile.update({
    where: { id: mentorProfileId },
    data: {
      applicationTokenHash: hashToken(raw),
      applicationTokenExpiresAt: new Date(Date.now() + APPLICATION_TOKEN_TTL_MS),
    },
  });
  return raw;
}

/**
 * Resolves a raw application token to its MentorProfile, or null when the
 * token is unknown, expired, or the application is already closed
 * (APPROVED/ACTIVE or REJECTED — nothing left to fill in).
 */
export async function resolveApplicationToken<T extends Prisma.MentorProfileInclude>(
  rawToken: string,
  include: T,
): Promise<Prisma.MentorProfileGetPayload<{ include: T }> | null> {
  if (!rawToken) return null;
  const profile = await prisma.mentorProfile.findUnique({
    where: { applicationTokenHash: hashToken(rawToken) },
    include,
  });
  if (!profile) return null;
  if (profile.applicationTokenExpiresAt && profile.applicationTokenExpiresAt < new Date()) return null;
  if (profile.status === "ACTIVE" || profile.status === "REJECTED") return null;
  return profile as Prisma.MentorProfileGetPayload<{ include: T }>;
}
