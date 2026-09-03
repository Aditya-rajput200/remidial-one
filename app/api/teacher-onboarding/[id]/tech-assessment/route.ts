import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requirePermission } from "@/lib/auth/rbac";
import { errorResponse } from "@/lib/api/respond";
import { recordAuditLog } from "@/lib/audit/log";
import { teacherTechAssessmentSchema } from "@/lib/validation/teacher";
import { completeStage } from "@/lib/teacher/onboarding";
import type { Prisma } from "@/lib/generated/prisma/client";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requirePermission("teacher_onboarding.manage");
    const { id } = await params;
    const body = teacherTechAssessmentSchema.parse(await request.json());

    const profile = await prisma.mentorProfile.findUnique({ where: { id }, select: { id: true } });
    if (!profile) return NextResponse.json({ error: "Applicant not found" }, { status: 404 });

    const items = body.items as Prisma.InputJsonValue;
    const existing = await prisma.teacherTechAssessment.findUnique({ where: { mentorProfileId: id } });

    await prisma.teacherTechAssessment.upsert({
      where: { mentorProfileId: id },
      create: {
        mentorProfileId: id,
        items,
        adminNotes: body.adminNotes,
        assessedById: actor.id,
        completedAt: body.complete ? new Date() : null,
      },
      update: {
        items,
        adminNotes: body.adminNotes,
        assessedById: actor.id,
        ...(body.complete && !existing?.completedAt ? { completedAt: new Date() } : {}),
      },
    });

    if (body.complete && !existing?.completedAt) {
      await completeStage(id, "ASSESSMENT", actor.id, "Technical assessment completed");
      await prisma.teacherLead
        .updateMany({ where: { mentorProfileId: id }, data: { status: "ASSESSMENT_COMPLETED" } })
        .catch(() => {});
    }

    await recordAuditLog({
      actorId: actor.id,
      action: body.complete ? "TEACHER_TECH_ASSESSMENT_COMPLETED" : "TEACHER_TECH_ASSESSMENT_SAVED",
      resourceType: "MentorProfile",
      resourceId: id,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
