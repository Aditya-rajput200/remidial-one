import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requirePermission } from "@/lib/auth/rbac";
import { errorResponse } from "@/lib/api/respond";
import { recordAuditLog } from "@/lib/audit/log";
import { overrideStageSchema } from "@/lib/validation/teacher";

// Manual stage override — "override records when necessary" (Module 1 Step 6).
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requirePermission("teacher_onboarding.manage");
    const { id } = await params;
    const body = overrideStageSchema.parse(await request.json());

    const stage = await prisma.teacherOnboardingStage.findUnique({
      where: { mentorProfileId_key: { mentorProfileId: id, key: body.key } },
    });
    if (!stage) return NextResponse.json({ error: "Stage not found" }, { status: 404 });

    await prisma.teacherOnboardingStage.update({
      where: { mentorProfileId_key: { mentorProfileId: id, key: body.key } },
      data: {
        state: body.state,
        responsibleId: actor.id,
        ...(body.notes ? { notes: body.notes } : {}),
        ...(body.state === "CURRENT" && !stage.enteredAt ? { enteredAt: new Date() } : {}),
        ...(body.state === "COMPLETED" && !stage.completedAt ? { completedAt: new Date() } : {}),
      },
    });

    await recordAuditLog({
      actorId: actor.id,
      action: "TEACHER_ONBOARDING_STAGE_OVERRIDDEN",
      resourceType: "MentorProfile",
      resourceId: id,
      metadata: { key: body.key, state: body.state },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
