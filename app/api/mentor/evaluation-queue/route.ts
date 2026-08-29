import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireRole, userHasPermission } from "@/lib/auth/rbac";
import { errorResponse } from "@/lib/api/respond";

/** Every submitted attempt (across the mentor's own assessments, or one via ?assessmentId=) that has at least one subjective question needing evaluation. */
export async function GET(request: NextRequest) {
  try {
    const user = await requireRole("MENTOR", "ADMIN", "SUPER_ADMIN");
    const canReadAny = await userHasPermission(user, "assessments.read");
    const assessmentId = request.nextUrl.searchParams.get("assessmentId") ?? undefined;

    const attempts = await prisma.studentAssessment.findMany({
      where: {
        status: { in: ["SUBMITTED", "AUTO_SUBMITTED"] },
        assessmentId,
        assessment: canReadAny ? {} : { createdById: user.id },
        questionAttempts: { some: { evaluation: { isNot: null } } },
      },
      include: {
        student: { select: { id: true, user: { select: { name: true } } } },
        assessment: { select: { id: true, title: true } },
        questionAttempts: { select: { evaluation: { select: { status: true } } } },
      },
      orderBy: { submittedAt: "desc" },
    });

    const rows = attempts.map((a) => {
      const evaluations = a.questionAttempts.map((qa) => qa.evaluation).filter(Boolean) as { status: string }[];
      return {
        studentAssessmentId: a.id,
        assessmentId: a.assessment.id,
        assessmentTitle: a.assessment.title,
        studentId: a.student.id,
        studentName: a.student.user.name,
        submittedAt: a.submittedAt,
        totalQuestions: evaluations.length,
        pending: evaluations.filter((e) => e.status === "PENDING").length,
        aiSuggested: evaluations.filter((e) => e.status === "AI_SUGGESTED").length,
        finalized: evaluations.filter((e) => e.status === "FINALIZED").length,
      };
    });

    return NextResponse.json({ rows });
  } catch (error) {
    return errorResponse(error);
  }
}
