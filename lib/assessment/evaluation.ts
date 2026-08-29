import "server-only";
import { prisma } from "@/lib/db/prisma";
import { AttemptStateError } from "@/lib/assessment/errors";
import { computeResultMetrics, type EnrichedAttempt } from "@/lib/assessment/analytics/metrics";
import { persistResultMetrics, recomputeAssessmentMetric, recomputeQuestionMetric } from "@/lib/assessment/analytics/persist";
import { recomputeEvaluationStatus } from "@/lib/assessment/lifecycle";

/**
 * Teacher finalizes marks for one subjective answer. AI's suggestion (if
 * any) is never authoritative — this is the only path that can set
 * Evaluation.finalMarks, and it always requires an authenticated teacher
 * (enforced by the calling route, not here).
 */
export async function finalizeEvaluation(evaluationId: string, marks: number, feedback: string | undefined, evaluatorId: string) {
  const evaluation = await prisma.evaluation.findUniqueOrThrow({
    where: { id: evaluationId },
    include: {
      questionAttempt: {
        include: { moduleQuestion: true, studentAssessment: { include: { result: { select: { status: true } } } } },
      },
    },
  });

  if (evaluation.questionAttempt.studentAssessment.result?.status === "PUBLISHED") {
    throw new AttemptStateError("Cannot modify a marked answer after results are published");
  }

  const maxMarks = Number(evaluation.questionAttempt.moduleQuestion.marks);
  if (marks < 0 || marks > maxMarks) {
    throw new AttemptStateError(`Marks must be between 0 and ${maxMarks}`);
  }

  const now = new Date();
  await prisma.$transaction([
    prisma.evaluation.update({
      where: { id: evaluationId },
      data: { finalMarks: marks, feedback, status: "FINALIZED", evaluatedById: evaluatorId, evaluatedAt: now },
    }),
    prisma.studentQuestionAttempt.update({
      where: { id: evaluation.questionAttemptId },
      data: { isCorrect: marks > 0, marksObtained: marks },
    }),
  ]);

  await recomputeAttemptResult(evaluation.questionAttempt.studentAssessmentId);
  await recomputeQuestionMetric(evaluation.questionAttempt.questionId).catch(() => undefined);
  await recomputeEvaluationStatus(evaluation.questionAttempt.studentAssessment.assessmentId);
}

/** Re-derives StudentAssessment totals + AssessmentResult + all precomputed metrics from every questionAttempt — called after any mark change. */
export async function recomputeAttemptResult(studentAssessmentId: string) {
  const attempt = await prisma.studentAssessment.findUniqueOrThrow({
    where: { id: studentAssessmentId },
    include: {
      assessment: { select: { id: true } },
      questionAttempts: { include: { question: true, moduleQuestion: true, evaluation: true } },
    },
  });

  const enriched: EnrichedAttempt[] = attempt.questionAttempts.map((qa) => ({
    isCorrect: qa.isCorrect,
    attempted: qa.marksObtained !== null || qa.evaluation !== null,
    marksObtained: qa.marksObtained !== null ? Number(qa.marksObtained) : null,
    maxMarks: Number(qa.moduleQuestion.marks),
    timeSpentSeconds: qa.timeSpentSeconds,
    type: qa.question.type,
    chapterId: qa.question.chapterId,
    topicId: qa.question.topicId,
    cognitiveLevel: qa.question.cognitiveLevel,
    skills: qa.question.skills,
  }));

  const totalMaxMarks = enriched.reduce((sum, a) => sum + a.maxMarks, 0);
  const totalMarksObtained = enriched.reduce((sum, a) => sum + (a.marksObtained ?? 0), 0);
  const attemptedCount = enriched.filter((a) => a.attempted).length;
  const correctCount = enriched.filter((a) => a.isCorrect === true).length;
  const accuracyPercent = attemptedCount > 0 ? (correctCount / attemptedCount) * 100 : 0;
  const percentage = totalMaxMarks > 0 ? (totalMarksObtained / totalMaxMarks) * 100 : 0;

  const pendingCount = attempt.questionAttempts.filter(
    (qa) => qa.evaluation && qa.evaluation.status !== "FINALIZED",
  ).length;

  await prisma.studentAssessment.update({
    where: { id: studentAssessmentId },
    data: { totalMarksObtained, totalMaxMarks, accuracyPercent },
  });

  const result = await prisma.assessmentResult.update({
    where: { studentAssessmentId },
    data: {
      totalMarksObtained,
      totalMaxMarks,
      percentage,
      accuracyPercent,
      status: pendingCount > 0 ? "UNDER_REVIEW" : "READY_TO_PUBLISH",
    },
  });

  const metrics = computeResultMetrics(enriched);
  await persistResultMetrics(result.id, metrics);
  await recomputeAssessmentMetric(attempt.assessment.id);

  return result;
}
