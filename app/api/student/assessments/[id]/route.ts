import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { ForbiddenError } from "@/lib/auth/errors";
import { errorResponse } from "@/lib/api/respond";

/** Pre-start instructions screen — settings a student needs before clicking "Start Assessment" (no questions/answer keys). */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireRole("STUDENT");
    const { id } = await params;
    const studentProfile = await prisma.studentProfile.findUniqueOrThrow({ where: { userId: user.id } });

    const assignment = await prisma.assessmentAssignment.findUnique({
      where: { assessmentId_studentId: { assessmentId: id, studentId: studentProfile.id } },
    });
    if (!assignment) throw new ForbiddenError("Assessment not found");

    const assessment = await prisma.assessment.findUniqueOrThrow({
      where: { id },
      include: { subject: { select: { name: true } }, _count: { select: { modules: true } } },
    });

    const [questionCount, attempts] = await Promise.all([
      prisma.assessmentModuleQuestion.count({ where: { module: { assessmentId: id } } }),
      prisma.studentAssessment.findMany({
        where: { assessmentId: id, studentId: studentProfile.id },
        orderBy: { attemptNumber: "desc" },
      }),
    ]);

    return NextResponse.json({
      assessment: {
        id: assessment.id,
        title: assessment.title,
        description: assessment.description,
        instructions: assessment.instructions,
        subjectName: assessment.subject?.name ?? null,
        durationMinutes: assessment.durationMinutes,
        totalMarks: assessment.totalMarks,
        passingMarks: assessment.passingMarks,
        attemptLimit: assessment.attemptLimit,
        negativeMarkingEnabled: assessment.negativeMarkingEnabled,
        calculatorAllowed: assessment.calculatorAllowed,
        moduleCount: assessment._count.modules,
        questionCount,
        status: assessment.status,
        startAt: assessment.startAt,
        endAt: assessment.endAt,
      },
      attempts,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
