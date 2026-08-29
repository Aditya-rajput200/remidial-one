import "server-only";
import { prisma } from "@/lib/db/prisma";
import { ForbiddenError } from "@/lib/auth/errors";
import { AttemptStateError } from "@/lib/assessment/errors";
import { answerResponseSchemas, type QuestionTypeKey } from "@/lib/validation/question";
import { scoreAnswer, isSubjectiveType } from "@/lib/assessment/scoring";
import { toStudentQuestionDto, randomizeOptionOrder } from "@/lib/assessment/dto";
import { seededShuffle } from "@/lib/assessment/shuffle";
import { computeResultMetrics, type EnrichedAttempt } from "@/lib/assessment/analytics/metrics";
import { persistResultMetrics, recomputeAssessmentMetric, recomputeQuestionMetric } from "@/lib/assessment/analytics/persist";
import { recomputeEvaluationStatus } from "@/lib/assessment/lifecycle";
import type { SubmissionReason } from "@/lib/generated/prisma/client";

/** Loads an attempt and asserts it belongs to `userId`'s StudentProfile. */
async function loadOwnAttemptFull(attemptId: string, userId: string) {
  const attempt = await prisma.studentAssessment.findUnique({
    where: { id: attemptId },
    include: {
      student: { select: { userId: true } },
      assessment: true,
      moduleAttempts: true,
    },
  });
  if (!attempt || attempt.student.userId !== userId) throw new ForbiddenError("Attempt not found");
  return attempt;
}

export async function startOrResumeAttempt(assessmentId: string, userId: string) {
  const studentProfile = await prisma.studentProfile.findUniqueOrThrow({ where: { userId } });

  const assignment = await prisma.assessmentAssignment.findUnique({
    where: { assessmentId_studentId: { assessmentId, studentId: studentProfile.id } },
  });
  if (!assignment) throw new ForbiddenError("You are not assigned to this assessment");

  const assessment = await prisma.assessment.findUniqueOrThrow({ where: { id: assessmentId } });
  if (assessment.status !== "LIVE") throw new AttemptStateError("This assessment is not currently live");

  const now = new Date();
  if (assessment.startAt && now < assessment.startAt) throw new AttemptStateError("This assessment has not started yet");
  if (assessment.endAt && now > assessment.endAt) throw new AttemptStateError("This assessment's window has ended");

  const inProgress = await prisma.studentAssessment.findFirst({
    where: { assessmentId, studentId: studentProfile.id, status: "IN_PROGRESS" },
  });
  if (inProgress) return inProgress;

  const attemptCount = await prisma.studentAssessment.count({ where: { assessmentId, studentId: studentProfile.id } });
  if (attemptCount >= assessment.attemptLimit) throw new AttemptStateError("You have used all allowed attempts for this assessment");

  const modules = await prisma.assessmentModule.findMany({
    where: { assessmentId },
    include: { questions: true },
  });

  const serverExpiresAt = new Date(now.getTime() + assessment.durationMinutes * 60_000);

  const attempt = await prisma.studentAssessment.create({
    data: {
      assessmentId,
      studentId: studentProfile.id,
      attemptNumber: attemptCount + 1,
      status: "IN_PROGRESS",
      startedAt: now,
      serverExpiresAt,
      moduleAttempts: { create: modules.map((m) => ({ moduleId: m.id, startedAt: now })) },
      questionAttempts: {
        create: modules.flatMap((m) => m.questions.map((mq) => ({ moduleQuestionId: mq.id, questionId: mq.questionId }))),
      },
      events: { create: { assessmentId, actorId: userId, type: "TEST_STARTED" } },
    },
  });

  return attempt;
}

export async function getTakePayload(attemptId: string, userId: string) {
  const attempt = await loadOwnAttemptFull(attemptId, userId);

  if (attempt.status === "IN_PROGRESS" && attempt.serverExpiresAt && new Date() > attempt.serverExpiresAt) {
    await submitAttempt(attemptId, "TIME_EXPIRED");
    return getTakePayload(attemptId, userId);
  }

  const modules = await prisma.assessmentModule.findMany({
    where: { assessmentId: attempt.assessmentId },
    orderBy: { order: "asc" },
    include: {
      questions: {
        orderBy: { order: "asc" },
        include: {
          question: true,
          questionAttempts: {
            where: { studentAssessmentId: attemptId },
            include: { answer: { include: { attachments: true } } },
          },
        },
      },
    },
  });

  const orderedModules = modules.map((m) => {
    const questions = attempt.assessment.randomizeQuestions ? seededShuffle(m.questions, `${attemptId}:${m.id}`) : m.questions;
    return {
      id: m.id,
      name: m.name,
      description: m.description,
      instructions: m.instructions,
      timeLimitMinutes: m.timeLimitMinutes,
      questions: questions.map((mq) => {
        const qa = mq.questionAttempts[0];
        const dto = toStudentQuestionDto(mq.question);
        const content = attempt.assessment.randomizeOptions
          ? randomizeOptionOrder(dto.content, `${attemptId}:${mq.id}`, seededShuffle)
          : dto.content;
        return {
          moduleQuestionId: mq.id,
          marks: Number(mq.marks),
          negativeMarks: Number(mq.negativeMarks),
          question: { ...dto, content },
          state: qa?.state ?? "NOT_VISITED",
          response: qa?.answer?.response ?? null,
          attachments: qa?.answer?.attachments ?? [],
        };
      }),
    };
  });

  return {
    attempt: {
      id: attempt.id,
      status: attempt.status,
      startedAt: attempt.startedAt,
      serverExpiresAt: attempt.serverExpiresAt,
    },
    assessment: {
      id: attempt.assessment.id,
      title: attempt.assessment.title,
      instructions: attempt.assessment.instructions,
      durationMinutes: attempt.assessment.durationMinutes,
      freeNavigation: attempt.assessment.freeNavigation,
      calculatorAllowed: attempt.assessment.calculatorAllowed,
      negativeMarkingEnabled: attempt.assessment.negativeMarkingEnabled,
    },
    modules: orderedModules,
  };
}

async function assertInProgressAndNotExpired(attemptId: string, userId: string) {
  const attempt = await loadOwnAttemptFull(attemptId, userId);
  if (attempt.status !== "IN_PROGRESS") throw new AttemptStateError("This attempt is no longer in progress");
  if (attempt.serverExpiresAt && new Date() > attempt.serverExpiresAt) {
    await submitAttempt(attemptId, "TIME_EXPIRED");
    throw new AttemptStateError("Time is up — this attempt has been submitted");
  }
  return attempt;
}

export async function visitQuestion(attemptId: string, moduleQuestionId: string, userId: string) {
  await assertInProgressAndNotExpired(attemptId, userId);

  const qa = await prisma.studentQuestionAttempt.findUniqueOrThrow({
    where: { studentAssessmentId_moduleQuestionId: { studentAssessmentId: attemptId, moduleQuestionId } },
  });

  const nextState = qa.state === "NOT_VISITED" ? "VISITED" : qa.state;
  return prisma.studentQuestionAttempt.update({
    where: { id: qa.id },
    data: { state: nextState, visitCount: { increment: 1 } },
  });
}

export async function autosaveAnswer(attemptId: string, moduleQuestionId: string, rawResponse: unknown, userId: string) {
  await assertInProgressAndNotExpired(attemptId, userId);

  const qa = await prisma.studentQuestionAttempt.findUnique({
    where: { studentAssessmentId_moduleQuestionId: { studentAssessmentId: attemptId, moduleQuestionId } },
    include: { question: true, answer: true, studentAssessment: { select: { assessmentId: true } } },
  });
  if (!qa) throw new ForbiddenError("Question not found in this attempt");

  const response = answerResponseSchemas[qa.question.type as QuestionTypeKey].parse(rawResponse);
  const now = new Date();
  const isFirstAnswer = !qa.answer;

  await prisma.studentAnswer.upsert({
    where: { questionAttemptId: qa.id },
    update: { response, autosavedAt: now },
    create: { questionAttemptId: qa.id, response, autosavedAt: now },
  });

  const nextState = qa.state === "MARKED_FOR_REVIEW" || qa.state === "ANSWERED_MARKED" ? "ANSWERED_MARKED" : "ANSWERED";
  await prisma.studentQuestionAttempt.update({
    where: { id: qa.id },
    data: {
      state: nextState,
      firstAnsweredAt: qa.firstAnsweredAt ?? now,
      lastAnsweredAt: now,
      changeCount: isFirstAnswer ? qa.changeCount : { increment: 1 },
    },
  });

  await prisma.assessmentEvent.create({
    data: {
      assessmentId: qa.studentAssessment.assessmentId,
      studentAssessmentId: attemptId,
      actorId: userId,
      type: isFirstAnswer ? "ANSWER_SAVED" : "ANSWER_CHANGED",
      payload: { moduleQuestionId },
    },
  });

  return { ok: true, autosavedAt: now };
}

export async function markForReview(attemptId: string, moduleQuestionId: string, marked: boolean, userId: string) {
  await assertInProgressAndNotExpired(attemptId, userId);

  const qa = await prisma.studentQuestionAttempt.findUniqueOrThrow({
    where: { studentAssessmentId_moduleQuestionId: { studentAssessmentId: attemptId, moduleQuestionId } },
  });

  const hasAnswer = qa.state === "ANSWERED" || qa.state === "ANSWERED_MARKED";
  const nextState = marked
    ? hasAnswer
      ? "ANSWERED_MARKED"
      : "MARKED_FOR_REVIEW"
    : hasAnswer
      ? "ANSWERED"
      : "VISITED";

  return prisma.studentQuestionAttempt.update({ where: { id: qa.id }, data: { state: nextState } });
}

export async function submitAttempt(attemptId: string, reason: SubmissionReason) {
  const attempt = await prisma.studentAssessment.findUniqueOrThrow({
    where: { id: attemptId },
    include: {
      assessment: { select: { id: true, subjectId: true } },
      student: { select: { id: true, userId: true } },
      questionAttempts: {
        include: { moduleQuestion: true, question: true, answer: true },
      },
    },
  });

  if (attempt.status === "SUBMITTED" || attempt.status === "AUTO_SUBMITTED") {
    const existingResult = await prisma.assessmentResult.findUnique({ where: { studentAssessmentId: attemptId } });
    return { attemptId, resultId: existingResult?.id ?? null, status: attempt.status };
  }

  const now = new Date();
  const updates: { id: string; isCorrect: boolean | null; marksObtained: number | null }[] = [];
  const enriched: EnrichedAttempt[] = [];
  let hasPendingSubjective = false;

  for (const qa of attempt.questionAttempts) {
    const type = qa.question.type as QuestionTypeKey;
    const marks = Number(qa.moduleQuestion.marks);
    const negativeMarks = Number(qa.moduleQuestion.negativeMarks);
    const hasAnswer = Boolean(qa.answer);

    let isCorrect: boolean | null = null;
    let marksObtained: number | null = 0;

    if (isSubjectiveType(type)) {
      hasPendingSubjective = true;
    } else if (hasAnswer) {
      const scored = scoreAnswer(type, qa.question.content, qa.answer!.response, marks, negativeMarks);
      isCorrect = scored.isCorrect;
      marksObtained = scored.marksObtained;
    }

    updates.push({ id: qa.id, isCorrect, marksObtained });
    enriched.push({
      isCorrect,
      attempted: hasAnswer,
      marksObtained,
      maxMarks: marks,
      timeSpentSeconds: qa.timeSpentSeconds,
      type,
      chapterId: qa.question.chapterId,
      topicId: qa.question.topicId,
      cognitiveLevel: qa.question.cognitiveLevel,
      skills: qa.question.skills,
    });
  }

  await prisma.$transaction([
    ...updates.map((u) => prisma.studentQuestionAttempt.update({ where: { id: u.id }, data: { isCorrect: u.isCorrect, marksObtained: u.marksObtained } })),
    ...attempt.questionAttempts
      .filter((qa) => isSubjectiveType(qa.question.type as QuestionTypeKey))
      .map((qa) =>
        prisma.evaluation.upsert({
          where: { questionAttemptId: qa.id },
          update: {},
          create: { questionAttemptId: qa.id, status: "PENDING" },
        }),
      ),
  ]);

  const totalMaxMarks = enriched.reduce((sum, a) => sum + a.maxMarks, 0);
  const totalMarksObtained = enriched.reduce((sum, a) => sum + (a.marksObtained ?? 0), 0);
  const attemptedCount = enriched.filter((a) => a.attempted).length;
  const correctCount = enriched.filter((a) => a.isCorrect === true).length;
  const accuracyPercent = attemptedCount > 0 ? (correctCount / attemptedCount) * 100 : 0;
  const timeSpentSeconds = attempt.startedAt ? Math.round((now.getTime() - attempt.startedAt.getTime()) / 1000) : null;
  const status: "SUBMITTED" | "AUTO_SUBMITTED" = reason === "MANUAL" ? "SUBMITTED" : "AUTO_SUBMITTED";

  await prisma.studentAssessment.update({
    where: { id: attemptId },
    data: {
      status,
      submittedAt: now,
      submissionReason: reason,
      totalMarksObtained,
      totalMaxMarks,
      accuracyPercent,
      timeSpentSeconds,
    },
  });

  const percentage = totalMaxMarks > 0 ? (totalMarksObtained / totalMaxMarks) * 100 : 0;
  const result = await prisma.assessmentResult.create({
    data: {
      studentAssessmentId: attemptId,
      status: hasPendingSubjective ? "EVALUATION_PENDING" : "READY_TO_PUBLISH",
      totalMarksObtained,
      totalMaxMarks,
      percentage,
      accuracyPercent,
    },
  });

  const metrics = computeResultMetrics(enriched);
  await persistResultMetrics(result.id, metrics);
  await recomputeAssessmentMetric(attempt.assessment.id);

  const distinctQuestionIds = [...new Set(attempt.questionAttempts.map((qa) => qa.questionId))];
  for (const questionId of distinctQuestionIds) {
    await recomputeQuestionMetric(questionId).catch(() => undefined);
  }

  await prisma.assessmentEvent.create({
    data: {
      assessmentId: attempt.assessment.id,
      studentAssessmentId: attemptId,
      actorId: attempt.student.userId,
      type: status === "SUBMITTED" ? "TEST_SUBMITTED" : "TEST_AUTO_SUBMITTED",
    },
  });

  await recomputeEvaluationStatus(attempt.assessment.id);

  return { attemptId, resultId: result.id, status };
}
