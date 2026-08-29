import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/rbac";
import { errorResponse } from "@/lib/api/respond";
import { recordAuditLog } from "@/lib/audit/log";
import { loadOwnedAssessment } from "@/lib/assessment/access";

/**
 * Creates a fresh editable DRAFT copy — the supported path to change a
 * published assessment's structure (see lib/assessment/lifecycle.ts). Copies
 * modules/module-questions (by reference to the same bank Question rows) but
 * never assignments, attempts, or results.
 */
export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    await loadOwnedAssessment(id, user);

    const source = await prisma.assessment.findUniqueOrThrow({
      where: { id },
      include: { modules: { orderBy: { order: "asc" }, include: { questions: { orderBy: { order: "asc" } } } } },
    });

    const duplicate = await prisma.assessment.create({
      data: {
        createdById: user.id,
        title: `${source.title} (copy)`,
        description: source.description,
        subjectId: source.subjectId,
        gradeLabel: source.gradeLabel,
        difficulty: source.difficulty,
        instructions: source.instructions,
        durationMinutes: source.durationMinutes,
        passingMarks: source.passingMarks,
        attemptLimit: source.attemptLimit,
        negativeMarkingEnabled: source.negativeMarkingEnabled,
        calculatorAllowed: source.calculatorAllowed,
        freeNavigation: source.freeNavigation,
        autoSubmitOnExpiry: source.autoSubmitOnExpiry,
        randomizeQuestions: source.randomizeQuestions,
        randomizeOptions: source.randomizeOptions,
        resultVisibility: source.resultVisibility,
        showCorrectAnswers: source.showCorrectAnswers,
        showSolutions: source.showSolutions,
        showRank: source.showRank,
        showClassAverage: source.showClassAverage,
        status: "DRAFT",
        modules: {
          create: source.modules.map((m) => ({
            name: m.name,
            description: m.description,
            instructions: m.instructions,
            order: m.order,
            timeLimitMinutes: m.timeLimitMinutes,
            questions: {
              create: m.questions.map((mq) => ({
                questionId: mq.questionId,
                order: mq.order,
                marks: mq.marks,
                negativeMarks: mq.negativeMarks,
              })),
            },
          })),
        },
      },
    });

    await recordAuditLog({
      actorId: user.id,
      action: "ASSESSMENT_DUPLICATED",
      resourceType: "Assessment",
      resourceId: duplicate.id,
      metadata: { sourceAssessmentId: id },
    });

    return NextResponse.json({ assessment: duplicate }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
