import { NextRequest, NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/rbac";
import { ForbiddenError } from "@/lib/auth/errors";
import { errorResponse } from "@/lib/api/respond";
import { recordAuditLog } from "@/lib/audit/log";

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;

    const note = await prisma.note.findUnique({ where: { id } });
    if (!note || note.uploadedById !== user.id) {
      // Same response whether the note doesn't exist or belongs to someone
      // else — don't confirm the existence of another mentor's note.
      throw new ForbiddenError("Note not found");
    }

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      await del(note.fileUrl, { token: process.env.BLOB_READ_WRITE_TOKEN }).catch((error) => {
        console.error("[notes] failed to delete blob", error);
      });
    }

    await prisma.note.delete({ where: { id } });

    await recordAuditLog({
      actorId: user.id,
      action: "NOTE_DELETED",
      resourceType: "Note",
      resourceId: id,
      metadata: { bookingId: note.bookingId },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
