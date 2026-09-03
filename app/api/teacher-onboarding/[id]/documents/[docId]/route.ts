import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requirePermission } from "@/lib/auth/rbac";
import { errorResponse } from "@/lib/api/respond";
import { recordAuditLog } from "@/lib/audit/log";

const schema = z.object({ verified: z.boolean() });

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string; docId: string }> }) {
  try {
    const actor = await requirePermission("teacher_onboarding.manage");
    const { id, docId } = await params;
    const body = schema.parse(await request.json());

    const doc = await prisma.teacherDocument.findUnique({ where: { id: docId }, select: { mentorProfileId: true } });
    if (!doc || doc.mentorProfileId !== id) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const updated = await prisma.teacherDocument.update({
      where: { id: docId },
      data: body.verified
        ? { verifiedAt: new Date(), verifiedById: actor.id }
        : { verifiedAt: null, verifiedById: null },
    });

    await recordAuditLog({
      actorId: actor.id,
      action: body.verified ? "TEACHER_DOCUMENT_VERIFIED" : "TEACHER_DOCUMENT_UNVERIFIED",
      resourceType: "MentorProfile",
      resourceId: id,
      metadata: { documentId: docId },
    });

    return NextResponse.json({ ok: true, verifiedAt: updated.verifiedAt });
  } catch (error) {
    return errorResponse(error);
  }
}
