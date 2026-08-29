import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { ForbiddenError } from "@/lib/auth/errors";
import { errorResponse } from "@/lib/api/respond";
import { requireOwnAttempt } from "@/lib/assessment/access";
import { toResultQuestionDto } from "@/lib/assessment/dto";

/**
 * The publish gate: a student gets 403 (not "not found yet") until
 * AssessmentResult.publishedAt is set — this is the single, server-side
 * source of truth, never inferred from Assessment.status.
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ attemptId: string }> }) {
  try {
    const user = await requireRole("STUDENT");
    const { attemptId } = await params;
    await requireOwnAttempt(attemptId, user);

    const result = await prisma.assessmentResult.findUnique({
      where: { studentAssessmentId: attemptId },
      include: {
        studentAssessment: { include: { assessment: true } },
        chapterMetrics: { include: { chapter: { select: { name: true } } } },
        topicMetrics: { include: { topic: { select: { name: true } } } },
        skillMetrics: true,
        cognitiveMetrics: true,
        questionTypeMetrics: true,
        aiInsight: true,
        feedbackEntries: true,
        recommendations: true,
      },
    });

    if (!result || !result.publishedAt) {
      throw new ForbiddenError("Result not available yet — your mentor hasn't published it.");
    }

    const assessment = result.studentAssessment.assessment;

    let questions: ReturnType<typeof toResultQuestionDto>[] = [];
    if (assessment.resultVisibility !== "SCORE_ONLY") {
      const questionAttempts = await prisma.studentQuestionAttempt.findMany({
        where: { studentAssessmentId: attemptId },
        include: { question: true, answer: true },
      });
      questions = questionAttempts.map((qa) =>
        toResultQuestionDto(qa.question, {
          showCorrectAnswers: assessment.showCorrectAnswers,
          showSolutions: assessment.showSolutions,
        }),
      );
    }

    return NextResponse.json({
      result: {
        id: result.id,
        totalMarksObtained: result.totalMarksObtained,
        totalMaxMarks: result.totalMaxMarks,
        percentage: result.percentage,
        accuracyPercent: result.accuracyPercent,
        rank: assessment.showRank ? result.rank : null,
        percentile: assessment.showRank ? result.percentile : null,
        overallFeedback: result.overallFeedback,
        publishedAt: result.publishedAt,
        timeSpentSeconds: result.studentAssessment.timeSpentSeconds,
      },
      assessment: { id: assessment.id, title: assessment.title, passingMarks: assessment.passingMarks },
      chapterMetrics: result.chapterMetrics,
      topicMetrics: result.topicMetrics,
      skillMetrics: result.skillMetrics,
      cognitiveMetrics: result.cognitiveMetrics,
      questionTypeMetrics: result.questionTypeMetrics,
      aiInsight: result.aiInsight,
      feedback: result.feedbackEntries,
      recommendations: result.recommendations,
      questions,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
