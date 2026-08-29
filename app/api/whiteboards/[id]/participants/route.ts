import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/rbac";
import { errorResponse } from "@/lib/api/respond";
import { loadWhiteboardForModeration } from "@/lib/whiteboard/access";

/** Mentor-facing view of per-student permission overrides for a whiteboard. */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const whiteboard = await loadWhiteboardForModeration(id, user);

    const participants = await prisma.whiteboardParticipant.findMany({
      where: { whiteboardId: whiteboard.id },
      include: { user: { select: { id: true, name: true, role: true } } },
    });

    return NextResponse.json({
      defaultPermission: whiteboard.defaultPermission,
      isLocked: whiteboard.isLocked,
      participants: participants.map((participant) => ({
        userId: participant.userId,
        name: participant.user.name,
        role: participant.user.role,
        permission: participant.permission,
        lastSeenAt: participant.lastSeenAt,
      })),
    });
  } catch (error) {
    return errorResponse(error);
  }
}
