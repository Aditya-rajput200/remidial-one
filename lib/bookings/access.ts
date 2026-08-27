import "server-only";
import { prisma } from "@/lib/db/prisma";
import { ForbiddenError } from "@/lib/auth/errors";
import { userHasPermission } from "@/lib/auth/rbac";
import type { User } from "@/lib/generated/prisma/client";

/**
 * Loads a booking a user may access: the assigned student/mentor (as an
 * owner), or anyone holding meetings.join_any (as a moderator/observer —
 * e.g. an admin auditing a live session). Throws the same "not found" error
 * either way a request is denied, so this never confirms the existence of
 * another user's booking.
 */
export async function loadAccessibleBooking(id: string, user: Pick<User, "id" | "role">) {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      student: { select: { userId: true } },
      mentor: { select: { userId: true } },
    },
  });

  if (!booking) throw new ForbiddenError("Booking not found");

  const isOwner = booking.student.userId === user.id || booking.mentor.userId === user.id;
  if (isOwner) return { booking, isModerator: false };

  if (await userHasPermission(user, "meetings.join_any")) {
    return { booking, isModerator: true };
  }

  throw new ForbiddenError("Booking not found");
}
