import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireUser, userHasPermission } from "@/lib/auth/rbac";
import { ForbiddenError } from "@/lib/auth/errors";
import { errorResponse } from "@/lib/api/respond";
import { loadOwnedAssessment, assertCanModify } from "@/lib/assessment/access";
import { assertStructureEditable } from "@/lib/assessment/lifecycle";
import { addModuleQuestionSchema } from "@/lib/validation/assessment";
import { Prisma } from "@/lib/generated/prisma/client";

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

    const body = addModuleQuestionSchema.parse(await request.json());

    const canReadAny = await userHasPermission(user, "assessments.read");
    const question = await prisma.question.findUnique({ where: { id: body.questionId } });
    if (!question || (!canReadAny && question.createdById !== user.id)) {
      throw new ForbiddenError("Question not found");
    }
    if (question.status !== "APPROVED") {
      return NextResponse.json({ error: "Only approved questions can be added to a test" }, { status: 400 });
    }

    const count = await prisma.assessmentModuleQuestion.count({ where: { moduleId } });
    const moduleQuestion = await prisma.assessmentModuleQuestion.create({
      data: {
        moduleId,
        questionId: body.questionId,
        order: count,
        marks: body.marks,
        negativeMarks: body.negativeMarks,
      },
      include: { question: true },
    });

    await prisma.question.update({ where: { id: body.questionId }, data: { usageCount: { increment: 1 } } });

    return NextResponse.json({ moduleQuestion }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "This question is already in this module." }, { status: 409 });
    }
    return errorResponse(error);
  }
}
