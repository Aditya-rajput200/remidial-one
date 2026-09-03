import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireUser, userHasPermission } from "@/lib/auth/rbac";
import { errorResponse } from "@/lib/api/respond";
import { recordAuditLog } from "@/lib/audit/log";

// Proxied download. The raw Blob URL is never exposed to clients (Module:
// "Do not expose Aadhaar/PAN/document URLs publicly") — this route fetches
// the bytes server-side after a permission/ownership check and streams them.
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string; docId: string }> }) {
  try {
    const user = await requireUser();
    const { id, docId } = await params;

    const doc = await prisma.teacherDocument.findUnique({
      where: { id: docId },
      include: { mentorProfile: { select: { id: true, userId: true } } },
    });
    if (!doc || doc.mentorProfile.id !== id) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const isOwner = doc.mentorProfile.userId === user.id;
    const canRead = isOwner || (await userHasPermission(user, "teacher_onboarding.read"));
    if (!canRead) {
      return NextResponse.json({ error: "You do not have access to this document" }, { status: 403 });
    }

    const upstream = await fetch(doc.blobPathname);
    if (!upstream.ok || !upstream.body) {
      return NextResponse.json({ error: "The stored file could not be retrieved" }, { status: 502 });
    }

    if (!isOwner) {
      await recordAuditLog({
        actorId: user.id,
        action: "TEACHER_DOCUMENT_VIEWED",
        resourceType: "MentorProfile",
        resourceId: id,
        metadata: { documentId: docId, type: doc.type },
      });
    }

    return new NextResponse(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": doc.mimeType,
        "Content-Disposition": `inline; filename="${doc.fileName}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
