import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/rbac";
import { errorResponse } from "@/lib/api/respond";
import { loadOwnedAssessment, assertCanModify } from "@/lib/assessment/access";
import { assertStructureEditable } from "@/lib/assessment/lifecycle";
import { reorderModuleQuestionsSchema } from "@/lib/validation/assessment";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; moduleId: string }> },
) {
  try {
    const user = await requireUser();
    const { id, moduleId } = await params;
    const { assessment, isModerator } = await loadOwnedAssessment(id, user);
    await assertCanModify(isModerator, user);
    assertStructureEditable(assessment);

    const { moduleQuestionIds } = reorderModuleQuestionsSchema.parse(await request.json());

    await prisma.$transaction(
      moduleQuestionIds.map((moduleQuestionId, order) =>
        prisma.assessmentModuleQuestion.update({ where: { id: moduleQuestionId, moduleId }, data: { order } }),
      ),
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
