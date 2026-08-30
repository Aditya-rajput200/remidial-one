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

    const existing = await prisma.contactMessage.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Contact message not found" }, { status: 404 });
    }

    const updated = await prisma.contactMessage.update({
      where: { id },
      data: {
        ...(body.status ? { status: body.status } : {}),
        ...(body.internalNotes !== undefined ? { internalNotes: body.internalNotes } : {}),
      },
    });

    await recordAuditLog({
      actorId: admin.id,
      action: "ADMIN_CONTACT_MESSAGE_UPDATED",
      resourceType: "ContactMessage",
      resourceId: id,
      metadata: { status: body.status, notesChanged: body.internalNotes !== undefined },
    });

    return NextResponse.json({ message: updated });
  } catch (error) {
    return errorResponse(error);
  }
}
