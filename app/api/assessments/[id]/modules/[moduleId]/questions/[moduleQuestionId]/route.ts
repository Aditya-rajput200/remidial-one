import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/rbac";
import { errorResponse } from "@/lib/api/respond";
import { loadOwnedAssessment, assertCanModify } from "@/lib/assessment/access";
import { assertStructureEditable } from "@/lib/assessment/lifecycle";
import { updateModuleQuestionSchema } from "@/lib/validation/assessment";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; moduleId: string; moduleQuestionId: string }> },
) {
  try {
    const user = await requireUser();
    const { id, moduleId, moduleQuestionId } = await params;
    const { assessment, isModerator } = await loadOwnedAssessment(id, user);
    await assertCanModify(isModerator, user);
    assertStructureEditable(assessment);

    const body = updateModuleQuestionSchema.parse(await request.json());
    const updated = await prisma.assessmentModuleQuestion.update({
      where: { id: moduleQuestionId, moduleId },
      data: body,
      include: { question: true },
    });
    return NextResponse.json({ moduleQuestion: updated });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; moduleId: string; moduleQuestionId: string }> },
) {
  try {
    const user = await requireUser();
    const { id, moduleId, moduleQuestionId } = await params;
    const { assessment, isModerator } = await loadOwnedAssessment(id, user);
    await assertCanModify(isModerator, user);
    assertStructureEditable(assessment);

    const removed = await prisma.assessmentModuleQuestion.delete({ where: { id: moduleQuestionId, moduleId } });
    await prisma.question.update({ where: { id: removed.questionId }, data: { usageCount: { decrement: 1 } } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
