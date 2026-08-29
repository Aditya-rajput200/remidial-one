import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/rbac";
import { errorResponse } from "@/lib/api/respond";
import { loadOwnedAssessment } from "@/lib/assessment/access";

type Row = { key: string; label: string; attempted: number; correct: number; marksObtained: number; maxMarks: number };

function aggregateByKey<T extends { attempted: number; correct: number; marksObtained: unknown; maxMarks: unknown }>(
  rows: T[],
  keyOf: (row: T) => string,
  labelOf: (row: T) => string,
): Row[] {
  const map = new Map<string, Row>();
  for (const row of rows) {
    const key = keyOf(row);
    const existing = map.get(key) ?? { key, label: labelOf(row), attempted: 0, correct: 0, marksObtained: 0, maxMarks: 0 };
    existing.attempted += row.attempted;
    existing.correct += row.correct;
    existing.marksObtained += Number(row.marksObtained);
    existing.maxMarks += Number(row.maxMarks);
    map.set(key, existing);
  }
  return [...map.values()];
}

/** Class-level analytics for a teacher/admin: score distribution, chapter/topic/skill/cognitive rollups, and per-question quality signals. */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    await loadOwnedAssessment(id, user);

    const [metric, results, questions] = await Promise.all([
      prisma.assessmentMetric.findUnique({ where: { assessmentId: id } }),
      prisma.assessmentResult.findMany({
        where: { studentAssessment: { assessmentId: id } },
        include: {
          studentAssessment: { select: { student: { select: { user: { select: { name: true } } } } } },
          chapterMetrics: { include: { chapter: { select: { name: true } } } },
          topicMetrics: { include: { topic: { select: { name: true } } } },
          skillMetrics: true,
          cognitiveMetrics: true,
        },
      }),
      prisma.assessmentModuleQuestion.findMany({
        where: { module: { assessmentId: id } },
        include: { question: { include: { metric: true } } },
      }),
    ]);

    const chapterMetrics = aggregateByKey(
      results.flatMap((r) => r.chapterMetrics),
      (m) => m.chapterId,
      (m) => m.chapter.name,
    );
    const topicMetrics = aggregateByKey(
      results.flatMap((r) => r.topicMetrics),
      (m) => m.topicId,
      (m) => m.topic.name,
    );
    const skillMetrics = aggregateByKey(
      results.flatMap((r) => r.skillMetrics),
      (m) => m.skill,
      (m) => m.skill,
    );
    const cognitiveMetrics = aggregateByKey(
      results.flatMap((r) => r.cognitiveMetrics),
      (m) => m.level,
      (m) => m.level,
    );

    const students = results.map((r) => ({
      studentAssessmentId: r.studentAssessmentId,
      resultId: r.id,
      name: r.studentAssessment.student.user.name,
      percentage: r.percentage,
      accuracyPercent: r.accuracyPercent,
      status: r.status,
    }));

    const questionQuality = questions.map((mq) => ({
      moduleQuestionId: mq.id,
      questionId: mq.questionId,
      text: mq.question.text,
      type: mq.question.type,
      timesAttempted: mq.question.metric?.timesAttempted ?? 0,
      timesCorrect: mq.question.metric?.timesCorrect ?? 0,
      timesIncorrect: mq.question.metric?.timesIncorrect ?? 0,
      timesSkipped: mq.question.metric?.timesSkipped ?? 0,
      averageTimeSeconds: mq.question.metric?.averageTimeSeconds ?? null,
      optionDistribution: mq.question.metric?.optionDistribution ?? null,
    }));

    return NextResponse.json({ metric, chapterMetrics, topicMetrics, skillMetrics, cognitiveMetrics, students, questionQuality });
  } catch (error) {
    return errorResponse(error);
  }
}
