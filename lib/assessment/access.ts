import "server-only";
import { prisma } from "@/lib/db/prisma";
import { ForbiddenError } from "@/lib/auth/errors";
import { userHasPermission } from "@/lib/auth/rbac";
import type { User } from "@/lib/generated/prisma/client";

/**
 * Loads an Assessment the user may manage: its creator (mentor), or anyone
 * holding assessments.read/assessments.moderate (admin oversight). Mirrors
 * lib/bookings/access.ts's loadAccessibleBooking — same "not found" for
 * both denial and absence so a request never confirms another mentor's
 * assessment exists.
 */
export async function loadOwnedAssessment(id: string, user: Pick<User, "id" | "role">) {
  const assessment = await prisma.assessment.findUnique({ where: { id } });
  if (!assessment) throw new ForbiddenError("Assessment not found");

  if (assessment.createdById === user.id) return { assessment, isModerator: false };

  if (await userHasPermission(user, "assessments.read")) {
    return { assessment, isModerator: true };
  }

  throw new ForbiddenError("Assessment not found");
}

/**
 * Loads a StudentAssessment (attempt) the user may access: the student who
 * owns it, the mentor who created the parent assessment, or an
 * assessments.read holder (admin).
 */
export async function loadAccessibleAttempt(id: string, user: Pick<User, "id" | "role">) {
  const attempt = await prisma.studentAssessment.findUnique({
    where: { id },
    include: {
      student: { select: { userId: true } },
      assessment: { select: { id: true, createdById: true } },
    },
  });
  if (!attempt) throw new ForbiddenError("Attempt not found");

  const isStudent = attempt.student.userId === user.id;
  const isOwnerMentor = attempt.assessment.createdById === user.id;
  if (isStudent || isOwnerMentor) return { attempt, isStudent, isModerator: false };

  if (await userHasPermission(user, "assessments.read")) {
    return { attempt, isStudent: false, isModerator: true };
  }

  throw new ForbiddenError("Attempt not found");
}

/**
 * `assessments.read` grants an admin visibility into any assessment;
 * mutating one you don't own additionally requires `assessments.moderate`
 * (SUPER_ADMIN holds both, so this is a no-op for it) — mirrors this
 * project's "no unrestricted admin access automatically" rule already
 * applied to payments.refund/recordings.delete/etc in lib/auth/permissions.ts.
 */
export async function assertCanModify(isModerator: boolean, user: Pick<User, "id" | "role">) {
  if (isModerator && !(await userHasPermission(user, "assessments.moderate"))) {
    throw new ForbiddenError("You do not have permission to modify this assessment");
  }
}

/** Throws unless the given studentAssessment belongs to the current user's StudentProfile. */
export async function requireOwnAttempt(id: string, user: Pick<User, "id">) {
  const attempt = await prisma.studentAssessment.findUnique({
    where: { id },
    include: { student: { select: { userId: true } } },
  });
  if (!attempt || attempt.student.userId !== user.id) throw new ForbiddenError("Attempt not found");
  return attempt;
}
