import { NextRequest, NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { prisma } from "@/lib/db/prisma";
import { errorResponse } from "@/lib/api/respond";
import { recordAuditLog } from "@/lib/audit/log";
import { resolveApplicationToken } from "@/lib/teacher/application-token";

// The applicant can remove one of their own unverified documents.
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ token: string; docId: string }> }) {
  try {
    const { token, docId } = await params;
    const profile = await resolveApplicationToken(token, { user: { select: { id: true } } });
    if (!profile) return NextResponse.json({ error: "This application link is invalid or has expired" }, { status: 404 });

    const doc = await prisma.teacherDocument.findUnique({ where: { id: docId }, select: { mentorProfileId: true, verifiedAt: true, blobPathname: true, type: true } });
    if (!doc || doc.mentorProfileId !== profile.id) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }
    if (doc.verifiedAt) {
      return NextResponse.json({ error: "This document has been verified and can no longer be removed" }, { status: 409 });
    }

    await del(doc.blobPathname, { token: process.env.BLOB_READ_WRITE_TOKEN }).catch(() => {});
    await prisma.teacherDocument.delete({ where: { id: docId } });

    await recordAuditLog({
      actorId: profile.user.id,
      action: "TEACHER_DOCUMENT_DELETED",
      resourceType: "MentorProfile",
      resourceId: profile.id,
      metadata: { documentId: docId, type: doc.type, via: "apply-link" },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
