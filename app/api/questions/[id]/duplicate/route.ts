import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireRole, userHasPermission } from "@/lib/auth/rbac";
import { ForbiddenError } from "@/lib/auth/errors";
import { errorResponse } from "@/lib/api/respond";
import { toTeacherQuestionDto } from "@/lib/assessment/dto";
import type { Prisma } from "@/lib/generated/prisma/client";

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireRole("MENTOR", "ADMIN", "SUPER_ADMIN");
    const { id } = await params;
    const canReadAny = await userHasPermission(user, "assessments.read");

    const source = await prisma.question.findUnique({ where: { id } });
    if (!source || (!canReadAny && source.createdById !== user.id)) {
      throw new ForbiddenError("Question not found");
    }

    const duplicate = await prisma.question.create({
      data: {
        createdById: user.id,
        subjectId: source.subjectId,
        chapterId: source.chapterId,
        topicId: source.topicId,
        subtopic: source.subtopic,
        type: source.type,
        difficulty: source.difficulty,
        cognitiveLevel: source.cognitiveLevel,
        skills: source.skills,
        purpose: source.purpose,
        text: `${source.text} (copy)`,
        explanation: source.explanation,
        hint: source.hint,
        tags: source.tags,
        defaultMarks: source.defaultMarks,
        defaultNegativeMarks: source.defaultNegativeMarks,
        estimatedTimeSeconds: source.estimatedTimeSeconds,
        content: source.content as Prisma.InputJsonValue,
        media: source.media as Prisma.InputJsonValue | undefined,
        source: "MANUAL",
        status: "DRAFT",
      },
    });

    return NextResponse.json({ question: toTeacherQuestionDto(duplicate) }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
