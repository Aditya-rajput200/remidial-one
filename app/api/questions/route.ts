import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireRole, userHasPermission } from "@/lib/auth/rbac";
import { errorResponse } from "@/lib/api/respond";
import { createQuestionSchema, questionSearchSchema } from "@/lib/validation/question";
import { toTeacherQuestionDto } from "@/lib/assessment/dto";
import type { Prisma } from "@/lib/generated/prisma/client";

/** Question bank search/list — a mentor sees only their own bank; assessments.read (admin) can see everyone's. */
export async function GET(request: NextRequest) {
  try {
    const user = await requireRole("MENTOR", "ADMIN", "SUPER_ADMIN");
    const params = questionSearchSchema.parse(Object.fromEntries(request.nextUrl.searchParams));

    const canReadAny = await userHasPermission(user, "assessments.read");

    const where: Prisma.QuestionWhereInput = {
      ...(canReadAny ? {} : { createdById: user.id }),
      ...(params.q ? { text: { contains: params.q, mode: "insensitive" } } : {}),
      ...(params.subjectId ? { subjectId: params.subjectId } : {}),
      ...(params.chapterId ? { chapterId: params.chapterId } : {}),
      ...(params.topicId ? { topicId: params.topicId } : {}),
      ...(params.type ? { type: params.type } : {}),
      ...(params.difficulty ? { difficulty: params.difficulty } : {}),
      ...(params.skill ? { skills: { has: params.skill } } : {}),
      ...(params.cognitiveLevel ? { cognitiveLevel: params.cognitiveLevel } : {}),
      status: params.status ?? { not: "ARCHIVED" },
      isArchived: false,
    };

    const [questions, total] = await prisma.$transaction([
      prisma.question.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: params.limit,
        skip: params.offset,
      }),
      prisma.question.count({ where }),
    ]);

    return NextResponse.json({ questions: questions.map(toTeacherQuestionDto), total, limit: params.limit, offset: params.offset });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole("MENTOR", "ADMIN", "SUPER_ADMIN");
    const body = createQuestionSchema.parse(await request.json());

    const question = await prisma.question.create({
      data: {
        createdById: user.id,
        subjectId: body.subjectId,
        chapterId: body.chapterId,
        topicId: body.topicId,
        subtopic: body.subtopic,
        type: body.type,
        difficulty: body.difficulty,
        cognitiveLevel: body.cognitiveLevel,
        skills: body.skills,
        purpose: body.purpose,
        text: body.text,
        explanation: body.explanation,
        hint: body.hint,
        tags: body.tags,
        defaultMarks: body.defaultMarks,
        defaultNegativeMarks: body.defaultNegativeMarks,
        estimatedTimeSeconds: body.estimatedTimeSeconds,
        content: body.content as Prisma.InputJsonValue,
        media: body.media as Prisma.InputJsonValue | undefined,
        source: "MANUAL",
        status: "APPROVED",
      },
    });

    return NextResponse.json({ question: toTeacherQuestionDto(question) }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
