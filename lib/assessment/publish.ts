import "server-only";
import { prisma } from "@/lib/db/prisma";
import { AttemptStateError } from "@/lib/assessment/errors";
import { updateLearningProfile } from "@/lib/assessment/analytics/profile";
import { generateAssessmentInsight } from "@/lib/assessment/ai/insight";

/**
 * Publishes one result: flips the visibility gate the student's result
 * endpoint checks, folds this result into the student's rolling learning
 * profile, and best-effort generates the AI insight (never blocks
 * publishing on AI availability — a teacher must be able to publish
 * results even when the AI provider is unset or down).
 */
export async function publishResult(resultId: string, publisherId: string) {
  const result = await prisma.assessmentResult.findUniqueOrThrow({
    where: { id: resultId },
    include: {
      studentAssessment: { select: { studentId: true, assessment: { select: { subjectId: true } } } },
      chapterMetrics: true,
      skillMetrics: true,
      cognitiveMetrics: true,
    },
  });

  if (result.status !== "READY_TO_PUBLISH") {
    throw new AttemptStateError("This result still has unfinished evaluations and cannot be published yet");
  }

  await prisma.assessmentResult.update({
    where: { id: resultId },
    data: { status: "PUBLISHED", publishedAt: new Date(), publishedById: publisherId },
  });

  await updateLearningProfile(result.studentAssessment.studentId, {
    overallPercentage: Number(result.percentage),
    subjectId: result.studentAssessment.assessment.subjectId,
    chapterAccuracies: result.chapterMetrics.map((m) => ({ chapterId: m.chapterId, accuracyPercent: Number(m.accuracyPercent) })),
    skillAccuracies: result.skillMetrics.map((m) => ({ skill: m.skill, accuracyPercent: Number(m.accuracyPercent) })),
    cognitiveAccuracies: result.cognitiveMetrics.map((m) => ({ level: m.level, accuracyPercent: Number(m.accuracyPercent) })),
  });

  await generateAssessmentInsight(resultId).catch(() => undefined);
}
