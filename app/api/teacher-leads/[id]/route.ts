import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requirePermission } from "@/lib/auth/rbac";
import { errorResponse } from "@/lib/api/respond";
import { recordAuditLog } from "@/lib/audit/log";
import { updateTeacherLeadSchema } from "@/lib/validation/teacher";

const detailInclude = {
  assignedTo: { select: { id: true, name: true, email: true } },
  mentorProfile: { select: { id: true, status: true } },
  activities: {
    orderBy: { createdAt: "desc" },
    include: { author: { select: { name: true } } },
  },
} as const;

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requirePermission("teacher_leads.read");
    const { id } = await params;
    const lead = await prisma.teacherLead.findUnique({ where: { id }, include: detailInclude });
    if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    return NextResponse.json({ lead });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requirePermission("teacher_leads.manage");
    const { id } = await params;
    const body = updateTeacherLeadSchema.parse(await request.json());

    const existing = await prisma.teacherLead.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

    if (body.assignedToId) {
      const assignee = await prisma.user.findUnique({ where: { id: body.assignedToId }, select: { id: true } });
      if (!assignee) return NextResponse.json({ error: "Assignee not found" }, { status: 400 });
    }

    const lead = await prisma.teacherLead.update({
      where: { id },
      data: {
        ...(body.status ? { status: body.status } : {}),
        ...(body.assignedToId !== undefined ? { assignedToId: body.assignedToId } : {}),
        ...(body.internalNotes !== undefined ? { internalNotes: body.internalNotes } : {}),
        ...(body.status === "CONTACTED" && !existing.contactedAt ? { contactedAt: new Date() } : {}),
      },
      include: detailInclude,
    });

    await recordAuditLog({
      actorId: actor.id,
      action: "TEACHER_LEAD_UPDATED",
      resourceType: "TeacherLead",
      resourceId: id,
      metadata: {
        status: body.status,
        assignedToId: body.assignedToId,
        notesChanged: body.internalNotes !== undefined,
      },
    });

    return NextResponse.json({ lead });
  } catch (error) {
    return errorResponse(error);
  }
}
