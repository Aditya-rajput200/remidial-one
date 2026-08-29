import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireRole, userHasPermission } from "@/lib/auth/rbac";
import { ForbiddenError } from "@/lib/auth/errors";
import { errorResponse } from "@/lib/api/respond";
import { updateQuestionSchema } from "@/lib/validation/question";
import { toTeacherQuestionDto } from "@/lib/assessment/dto";
import { assertQuestionScoringFieldsEditable } from "@/lib/assessment/lifecycle";
import type { Prisma } from "@/lib/generated/prisma/client";

async function loadOwnedQuestion(id: string, userId: string, canReadAny: boolean) {
  const question = await prisma.question.findUnique({ where: { id } });
  if (!question || (!canReadAny && question.createdById !== userId)) {
    throw new ForbiddenError("Question not found");
  }
  return question;
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireRole("MENTOR", "ADMIN", "SUPER_ADMIN");
    const { id } = await params;
    const canReadAny = await userHasPermission(user, "assessments.read");
    const question = await loadOwnedQuestion(id, user.id, canReadAny);
    return NextResponse.json({ question: toTeacherQuestionDto(question) });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireRole("MENTOR", "ADMIN", "SUPER_ADMIN");
    const { id } = await params;
    const canReadAny = await userHasPermission(user, "assessments.moderate");
    await loadOwnedQuestion(id, user.id, canReadAny);
    const body = updateQuestionSchema.parse(await request.json());

    if (body.content !== undefined || body.type !== undefined || body.defaultMarks !== undefined) {
      await assertQuestionScoringFieldsEditable(id);
    }

    const question = await prisma.question.update({
      where: { id },
      data: {
        ...body,
        content: body.content !== undefined ? (body.content as Prisma.InputJsonValue) : undefined,
        media: body.media !== undefined ? (body.media as Prisma.InputJsonValue) : undefined,
      },
    });

    return NextResponse.json({ question: toTeacherQuestionDto(question) });
  } catch (error) {
    return errorResponse(error);
  }
}

/** Soft-delete only — a question already used in a published assessment must never disappear out from under existing attempts. */
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireRole("MENTOR", "ADMIN", "SUPER_ADMIN");
    const { id } = await params;
    const canModerateAny = await userHasPermission(user, "assessments.moderate");
    await loadOwnedQuestion(id, user.id, canModerateAny);

    const question = await prisma.question.update({ where: { id }, data: { isArchived: true, status: "ARCHIVED" } });
    return NextResponse.json({ question: toTeacherQuestionDto(question) });
  } catch (error) {
    return errorResponse(error);
  }
}
