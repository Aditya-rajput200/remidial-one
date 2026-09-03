import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requirePermission } from "@/lib/auth/rbac";
import { errorResponse } from "@/lib/api/respond";
import { recordAuditLog } from "@/lib/audit/log";
import { logTeacherLeadActivitySchema } from "@/lib/validation/teacher";

// Append-only follow-up log for a teacher lead — mirrors
// app/api/counselling-requests/[id]/activities.
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requirePermission("teacher_leads.manage");
    const { id } = await params;
    const body = logTeacherLeadActivitySchema.parse(await request.json());

    const existing = await prisma.teacherLead.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

    const [activity] = await prisma.$transaction([
      prisma.teacherLeadActivity.create({
        data: {
          leadId: id,
          authorId: actor.id,
          outcome: body.outcome,
          note: body.note,
          nextFollowUpAt: body.nextFollowUpAt,
        },
        include: { author: { select: { name: true } } },
      }),
      prisma.teacherLead.update({
        where: { id },
        data: {
          nextFollowUpAt: body.nextFollowUpAt ?? null,
          ...(body.status ? { status: body.status } : {}),
          ...(body.status === "CONTACTED" && !existing.contactedAt ? { contactedAt: new Date() } : {}),
        },
      }),
    ]);

    await recordAuditLog({
      actorId: actor.id,
      action: "TEACHER_LEAD_ACTIVITY_LOGGED",
      resourceType: "TeacherLead",
      resourceId: id,
      metadata: { outcome: body.outcome, nextFollowUpAt: body.nextFollowUpAt?.toISOString(), status: body.status },
    });

    return NextResponse.json({ activity }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
