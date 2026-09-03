import { NextRequest, NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { errorResponse } from "@/lib/api/respond";
import { recordAuditLog } from "@/lib/audit/log";

// A teacher can remove one of their own documents while it is still
// unverified (e.g. wrong file). Verified documents are locked.
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireRole("MENTOR");
    const { id } = await params;

    const doc = await prisma.teacherDocument.findUnique({
      where: { id },
      include: { mentorProfile: { select: { userId: true, id: true } } },
    });
    if (!doc || doc.mentorProfile.userId !== user.id) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }
    if (doc.verifiedAt) {
      return NextResponse.json({ error: "This document has been verified and can no longer be removed" }, { status: 409 });
    }

    await del(doc.blobPathname, { token: process.env.BLOB_READ_WRITE_TOKEN }).catch(() => {});
    await prisma.teacherDocument.delete({ where: { id } });

    await recordAuditLog({
      actorId: user.id,
      action: "TEACHER_DOCUMENT_DELETED",
      resourceType: "MentorProfile",
      resourceId: doc.mentorProfile.id,
      metadata: { documentId: id, type: doc.type },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
