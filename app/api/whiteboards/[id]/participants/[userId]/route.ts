import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/rbac";
import { errorResponse } from "@/lib/api/respond";
import { loadWhiteboardForModeration } from "@/lib/whiteboard/access";

const patchSchema = z.object({
  // null clears the override so the student inherits Whiteboard.defaultPermission.
  permission: z.enum(["VIEW_ONLY", "COLLABORATE", "FULL_COLLABORATION"]).nullable(),
});

/** Sets (or clears) a single student's per-whiteboard permission override. */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string; userId: string }> }) {
  try {
    const user = await requireUser();
    const { id, userId } = await params;
    const whiteboard = await loadWhiteboardForModeration(id, user);
    const body = patchSchema.parse(await request.json());

    if (userId !== whiteboard.booking.student.userId) {
      return NextResponse.json({ error: "That user is not a participant in this session" }, { status: 400 });
    }

    const participant = await prisma.whiteboardParticipant.upsert({
      where: { whiteboardId_userId: { whiteboardId: whiteboard.id, userId } },
      update: { permission: body.permission },
      create: { whiteboardId: whiteboard.id, userId, permission: body.permission },
    });

    return NextResponse.json({
      participant: { userId: participant.userId, permission: participant.permission },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
