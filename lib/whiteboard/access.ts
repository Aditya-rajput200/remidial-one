import "server-only";
import { prisma } from "@/lib/db/prisma";
import { ForbiddenError } from "@/lib/auth/errors";
import { userHasPermission } from "@/lib/auth/rbac";
import { loadAccessibleBooking } from "@/lib/bookings/access";
import { Prisma, type User } from "@/lib/generated/prisma/client";
import type { WhiteboardPermissionLevel } from "@/lib/generated/prisma/enums";

export type ResolveWhiteboardPermissionInput = {
  isMentor: boolean;
  isModerator: boolean;
  hasModerateAny: boolean;
  isLocked: boolean;
  lockedById: string | null;
  userId: string;
  defaultPermission: WhiteboardPermissionLevel;
  participantOverride: WhiteboardPermissionLevel | null;
};

/**
 * Pure permission-resolution matrix, kept separate from data-fetching so it
 * can be unit-tested without a database. Mentor always gets full
 * collaboration on their own board. A moderator/observer (admin joined via
 * meetings.join_any) is read-only unless they additionally hold
 * whiteboard.moderate_any. Everyone else (a student) gets their
 * per-whiteboard override if set, else the board's default — except while
 * the board is locked by someone other than them, which forces read-only
 * regardless of their base level.
 */
export function resolveWhiteboardPermission(input: ResolveWhiteboardPermissionInput): WhiteboardPermissionLevel {
  if (input.isMentor) return "FULL_COLLABORATION";

  if (input.isModerator) {
    return input.hasModerateAny ? "FULL_COLLABORATION" : "VIEW_ONLY";
  }

  if (input.isLocked && input.lockedById !== input.userId) {
    return "VIEW_ONLY";
  }

  return input.participantOverride ?? input.defaultPermission;
}

/**
 * Loads (lazily creating on first access, mirroring how video has no DB row
 * until video-token is first minted) the whiteboard for a booking the
 * caller may access, along with their resolved permission level. Throws the
 * same "not found" error whether the booking doesn't exist or the caller
 * has no access to it — see loadAccessibleBooking.
 */
export async function loadAccessibleWhiteboard(bookingId: string, user: Pick<User, "id" | "role">) {
  const { booking, isModerator } = await loadAccessibleBooking(bookingId, user);
  const whiteboard = await upsertWhiteboard(bookingId, user.id);
  const isMentor = booking.mentor.userId === user.id;

  const [hasModerateAny, participant] = await Promise.all([
    isModerator ? userHasPermission(user, "whiteboard.moderate_any") : Promise.resolve(false),
    !isMentor && !isModerator
      ? prisma.whiteboardParticipant.findUnique({
          where: { whiteboardId_userId: { whiteboardId: whiteboard.id, userId: user.id } },
        })
      : Promise.resolve(null),
  ]);

  const permission = resolveWhiteboardPermission({
    isMentor,
    isModerator,
    hasModerateAny,
    isLocked: whiteboard.isLocked,
    lockedById: whiteboard.lockedById,
    userId: user.id,
    defaultPermission: whiteboard.defaultPermission,
    participantOverride: participant?.permission ?? null,
  });

  return { booking, whiteboard, isModerator, isMentor, permission };
}

/**
 * Lazily creates the whiteboard (+ first page) for a booking on first
 * access, or returns the existing one. Mentor and student can both land
 * here within milliseconds of each other on their first-ever join (e.g.
 * loading the room page at nearly the same time) — upsert()'s nested
 * `pages: { create }` isn't a single atomic statement, so two concurrent
 * first-time upserts can both see "not found" and both attempt create,
 * with the loser hitting Whiteboard_bookingId_key's unique constraint
 * instead of Prisma's usual create-or-update fallback. Catching that P2002
 * and re-fetching is safe: by the time it fires, the winner's row
 * definitely exists.
 */
async function upsertWhiteboard(bookingId: string, creatorUserId: string) {
  try {
    return await prisma.whiteboard.upsert({
      where: { bookingId },
      update: {},
      create: {
        bookingId,
        pages: { create: { name: "Page 1", position: 0, createdById: creatorUserId } },
      },
      include: { pages: { orderBy: { position: "asc" } } },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return prisma.whiteboard.findUniqueOrThrow({
        where: { bookingId },
        include: { pages: { orderBy: { position: "asc" } } },
      });
    }
    throw error;
  }
}

/**
 * Loads a whiteboard by its own id for the mentor-facing moderation
 * surface (viewing/setting per-student permission overrides). Only the
 * booking's mentor or a caller holding whiteboard.moderate_any may access
 * it — same generic "not found" response for both non-existence and
 * no-access, so this never confirms the existence of another user's
 * whiteboard.
 */
export async function loadWhiteboardForModeration(whiteboardId: string, user: Pick<User, "id" | "role">) {
  const whiteboard = await prisma.whiteboard.findUnique({
    where: { id: whiteboardId },
    include: {
      booking: {
        include: {
          mentor: { select: { userId: true } },
          student: { select: { userId: true } },
        },
      },
    },
  });

  if (!whiteboard) throw new ForbiddenError("Whiteboard not found");

  const isMentor = whiteboard.booking.mentor.userId === user.id;
  if (!isMentor && !(await userHasPermission(user, "whiteboard.moderate_any"))) {
    throw new ForbiddenError("Whiteboard not found");
  }

  return whiteboard;
}
