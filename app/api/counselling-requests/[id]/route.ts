import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requirePermission } from "@/lib/auth/rbac";
import { errorResponse } from "@/lib/api/respond";
import { recordAuditLog } from "@/lib/audit/log";
import { updateLeadStatusSchema } from "@/lib/validation/leads";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requirePermission("support.manage");
    const { id } = await params;
    const body = updateLeadStatusSchema.parse(await request.json());

    const existing = await prisma.counsellingRequest.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Counselling request not found" }, { status: 404 });
    }

    const updated = await prisma.counsellingRequest.update({
      where: { id },
      data: {
        ...(body.status ? { status: body.status } : {}),
        ...(body.internalNotes !== undefined ? { internalNotes: body.internalNotes } : {}),
        // First time this request moves to CONTACTED, stamp when — doesn't
        // move again if an admin later flips it back and forth.
        ...(body.status === "CONTACTED" && !existing.contactedAt ? { contactedAt: new Date() } : {}),
      },
    });

    await recordAuditLog({
      actorId: admin.id,
      action: "ADMIN_COUNSELLING_REQUEST_UPDATED",
      resourceType: "CounsellingRequest",
      resourceId: id,
      metadata: { status: body.status, notesChanged: body.internalNotes !== undefined },
    });

    return NextResponse.json({ request: updated });
  } catch (error) {
    return errorResponse(error);
  }
}
