import "server-only";
import { prisma } from "@/lib/db/prisma";
import { computeAssessmentAggregate, type ResultMetrics } from "./metrics";
import type { CognitiveLevel, QuestionSkill, QuestionType } from "@/lib/generated/prisma/client";

/** Replaces a result's precomputed metric rows wholesale — simplest correct idempotent "upsert" given the small row counts involved. */
export async function persistResultMetrics(resultId: string, metrics: ResultMetrics) {
  await prisma.$transaction([
    prisma.chapterMetric.deleteMany({ where: { resultId } }),
    prisma.topicMetric.deleteMany({ where: { resultId } }),
    prisma.skillMetric.deleteMany({ where: { resultId } }),
    prisma.cognitiveMetric.deleteMany({ where: { resultId } }),
    prisma.questionTypeMetric.deleteMany({ where: { resultId } }),
    ...(metrics.chapterMetrics.length
      ? [
          prisma.chapterMetric.createMany({
            data: metrics.chapterMetrics.map((m) => ({ resultId, chapterId: m.chapterId, ...m.metric })),
          }),
        ]
      : []),
    ...(metrics.topicMetrics.length
      ? [prisma.topicMetric.createMany({ data: metrics.topicMetrics.map((m) => ({ resultId, topicId: m.topicId, ...m.metric })) })]
      : []),
    ...(metrics.skillMetrics.length
      ? [
          prisma.skillMetric.createMany({
            data: metrics.skillMetrics.map((m) => ({ resultId, skill: m.skill as QuestionSkill, ...m.metric })),
          }),
        ]
      : []),
    ...(metrics.cognitiveMetrics.length
      ? [
          prisma.cognitiveMetric.createMany({
            data: metrics.cognitiveMetrics.map((m) => ({ resultId, level: m.level as CognitiveLevel, ...m.metric })),
          }),
        ]
      : []),
    ...(metrics.questionTypeMetrics.length
      ? [
          prisma.questionTypeMetric.createMany({
            // QuestionTypeMetric has no marksObtained/maxMarks columns
            // (spec §27 only calls for attempted/correct/accuracy/avg-time
            // here) — pick fields explicitly rather than spreading the full
            // bucket, which also carries those two.
            data: metrics.questionTypeMetrics.map((m) => ({
              resultId,
              type: m.type as QuestionType,
              attempted: m.metric.attempted,
              correct: m.metric.correct,
              incorrect: m.metric.incorrect,
              accuracyPercent: m.metric.accuracyPercent,
              averageTimeSeconds: m.metric.averageTimeSeconds,
            })),
          }),
        ]
      : []),
  ]);
}

/** Recomputes the class-level aggregate for one assessment — called after any submit or evaluation-finalize. */
export async function recomputeAssessmentMetric(assessmentId: string) {
  const [attemptsCount, completed] = await Promise.all([
    prisma.studentAssessment.count({ where: { assessmentId } }),
    prisma.assessmentResult.findMany({
      where: { studentAssessment: { assessmentId } },
      select: { percentage: true, accuracyPercent: true, studentAssessment: { select: { timeSpentSeconds: true } } },
    }),
  ]);

  const aggregate = computeAssessmentAggregate(
    completed.map((c) => ({
      percentage: Number(c.percentage),
      accuracyPercent: Number(c.accuracyPercent),
      timeSpentSeconds: c.studentAssessment.timeSpentSeconds,
    })),
    attemptsCount,
  );

  await prisma.assessmentMetric.upsert({
    where: { assessmentId },
    update: aggregate,
    create: { assessmentId, ...aggregate },
  });
}

/** Recomputes the per-question quality signal (spec §33) from every attempt of this question across all assessments. */
export async function recomputeQuestionMetric(questionId: string) {
  const [question, attempts] = await Promise.all([
    prisma.question.findUniqueOrThrow({ where: { id: questionId } }),
    prisma.studentQuestionAttempt.findMany({
      where: { questionId, studentAssessment: { status: { in: ["SUBMITTED", "AUTO_SUBMITTED"] } } },
      include: { answer: true },
    }),
  ]);

  const timesAttempted = attempts.filter((a) => a.answer).length;
  const timesCorrect = attempts.filter((a) => a.isCorrect === true).length;
  const timesIncorrect = attempts.filter((a) => a.isCorrect === false).length;
  const timesSkipped = attempts.length - timesAttempted;
  const averageTimeSeconds =
    attempts.length > 0 ? Math.round(attempts.reduce((sum, a) => sum + a.timeSpentSeconds, 0) / attempts.length) : null;

  let optionDistribution: Record<string, number> | null = null;
  if ((question.type === "MCQ" || question.type === "MULTIPLE_CORRECT") && timesAttempted > 0) {
    const counts = new Map<string, number>();
    for (const attempt of attempts) {
      const response = attempt.answer?.response as { selectedOptionId?: string; selectedOptionIds?: string[] } | undefined;
      const ids = response?.selectedOptionIds ?? (response?.selectedOptionId ? [response.selectedOptionId] : []);
      for (const optId of ids) counts.set(optId, (counts.get(optId) ?? 0) + 1);
    }
    optionDistribution = Object.fromEntries(
      [...counts.entries()].map(([id, count]) => [id, Math.round((count / timesAttempted) * 10000) / 100]),
    );
  }

  await prisma.questionMetric.upsert({
    where: { questionId },
    update: { timesAttempted, timesCorrect, timesIncorrect, timesSkipped, averageTimeSeconds, optionDistribution: optionDistribution ?? undefined },
    create: { questionId, timesAttempted, timesCorrect, timesIncorrect, timesSkipped, averageTimeSeconds, optionDistribution: optionDistribution ?? undefined },
  });
}
