import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/rbac";
import { loadAccessibleAttempt } from "@/lib/assessment/access";
import { errorResponse } from "@/lib/api/respond";

/** Full per-student evaluation workspace: every subjective question, the student's answer, expected answer/rubric, and any AI suggestion. */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ studentAssessmentId: string }> }) {
  try {
    const user = await requireUser();
    const { studentAssessmentId } = await params;
    const { attempt } = await loadAccessibleAttempt(studentAssessmentId, user);

    const questionAttempts = await prisma.studentQuestionAttempt.findMany({
      where: { studentAssessmentId, evaluation: { isNot: null } },
      include: {
        moduleQuestion: true,
        question: true,
        answer: { include: { attachments: true } },
        evaluation: { include: { aiEvaluation: true } },
      },
      orderBy: { id: "asc" },
    });

    return NextResponse.json({
      studentId: attempt.student.userId,
      assessmentId: attempt.assessment.id,
      items: questionAttempts.map((qa) => ({
        questionAttemptId: qa.id,
        evaluationId: qa.evaluation!.id,
        evaluationStatus: qa.evaluation!.status,
        maxMarks: qa.moduleQuestion.marks,
        finalMarks: qa.evaluation!.finalMarks,
        feedback: qa.evaluation!.feedback,
        question: { id: qa.question.id, type: qa.question.type, text: qa.question.text, content: qa.question.content },
        answer: qa.answer ? { response: qa.answer.response, attachments: qa.answer.attachments } : null,
        aiEvaluation: qa.evaluation!.aiEvaluation,
      })),
    });
  } catch (error) {
    return errorResponse(error);
  }
}
