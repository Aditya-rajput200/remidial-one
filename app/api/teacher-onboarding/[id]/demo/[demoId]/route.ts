import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requirePermission } from "@/lib/auth/rbac";
import { errorResponse } from "@/lib/api/respond";
import { recordAuditLog } from "@/lib/audit/log";
import { teacherDemoEvaluationSchema } from "@/lib/validation/teacher";
import { completeStage, failStage } from "@/lib/teacher/onboarding";
import { Prisma } from "@/lib/generated/prisma/client";

// Evaluator submits the demo scorecard. PASS advances the DEMO stage; FAIL
// marks it failed; REDEMO_REQUIRED leaves the stage where it is so another
// demo can be scheduled.
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string; demoId: string }> }) {
  try {
    const actor = await requirePermission("teacher_onboarding.manage");
    const { id, demoId } = await params;
    const body = teacherDemoEvaluationSchema.parse(await request.json());

    const demo = await prisma.teacherDemo.findUnique({ where: { id: demoId }, select: { mentorProfileId: true } });
    if (!demo || demo.mentorProfileId !== id) {
      return NextResponse.json({ error: "Demo not found" }, { status: 404 });
    }

    await prisma.teacherDemo.update({
      where: { id: demoId },
      data: {
        result: body.result,
        ratings: (body.ratings ?? Prisma.DbNull) as Prisma.InputJsonValue | typeof Prisma.DbNull,
        evaluatorComments: body.evaluatorComments,
        evaluatedAt: new Date(),
        evaluatorId: actor.id,
      },
    });

    if (body.result === "PASS") {
      await completeStage(id, "DEMO", actor.id, "Demo passed");
      await prisma.teacherLead.updateMany({ where: { mentorProfileId: id }, data: { status: "DEMO_COMPLETED" } }).catch(() => {});
    } else if (body.result === "FAIL") {
      await failStage(id, "DEMO", actor.id, "Demo failed");
    }

    await recordAuditLog({
      actorId: actor.id,
      action: "TEACHER_DEMO_EVALUATED",
      resourceType: "MentorProfile",
      resourceId: id,
      metadata: { demoId, result: body.result },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
