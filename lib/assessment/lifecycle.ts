import "server-only";
import { prisma } from "@/lib/db/prisma";
import type { Assessment, AssessmentStatus } from "@/lib/generated/prisma/client";

/**
 * Once an assessment leaves DRAFT/REVIEW its structure is frozen — module
 * and module-question edits are rejected rather than silently corrupting
 * attempts already in progress or scored. To change a published assessment,
 * duplicate it (POST /api/assessments/[id]/duplicate) into a fresh DRAFT.
 * This is a deliberately simpler substitute for full branching version
 * history: "structure is immutable once live" gives the same safety
 * guarantee (spec §55/56) without a parallel snapshot-scoring pipeline.
 */
const STRUCTURE_EDITABLE_STATUSES: AssessmentStatus[] = ["DRAFT", "REVIEW"];

export function assertStructureEditable(assessment: Pick<Assessment, "status">) {
  if (!STRUCTURE_EDITABLE_STATUSES.includes(assessment.status)) {
    throw new StructureLockedError();
  }
}

export class StructureLockedError extends Error {
  status = 409 as const;
  constructor() {
    super("This assessment's structure is locked once published. Duplicate it to make changes.");
    this.name = "StructureLockedError";
  }
}

// Scoring-relevant fields on a Question — editing these once the question is
// attached to a LIVE-or-later assessment could invalidate marks students
// already earned, so they're blocked (classification/explanation/hint/tags
// remain freely editable).
const SCORING_LOCKED_ASSESSMENT_STATUSES: AssessmentStatus[] = ["LIVE", "PAUSED", "ENDED", "EVALUATION", "RESULT_READY"];

export async function assertQuestionScoringFieldsEditable(questionId: string) {
  const usage = await prisma.assessmentModuleQuestion.findFirst({
    where: { questionId, module: { assessment: { status: { in: SCORING_LOCKED_ASSESSMENT_STATUSES } } } },
    select: { id: true },
  });
  if (usage) throw new StructureLockedError();
}

export async function computeAssessmentTotalMarks(assessmentId: string): Promise<number> {
  const result = await prisma.assessmentModuleQuestion.aggregate({
    where: { module: { assessmentId } },
    _sum: { marks: true },
  });
  return Number(result._sum.marks ?? 0);
}

export async function buildPublishedSnapshot(assessmentId: string) {
  const modules = await prisma.assessmentModule.findMany({
    where: { assessmentId },
    orderBy: { order: "asc" },
    include: {
      questions: {
        orderBy: { order: "asc" },
        include: { question: { select: { id: true, type: true, text: true } } },
      },
    },
  });

  return {
    snapshotAt: new Date().toISOString(),
    modules: modules.map((m) => ({
      id: m.id,
      name: m.name,
      order: m.order,
      timeLimitMinutes: m.timeLimitMinutes,
      questions: m.questions.map((mq) => ({
        moduleQuestionId: mq.id,
        questionId: mq.questionId,
        type: mq.question.type,
        order: mq.order,
        marks: Number(mq.marks),
        negativeMarks: Number(mq.negativeMarks),
      })),
    })),
  };
}

/**
 * After a submission or evaluation-finalize, moves an ENDED assessment to
 * EVALUATION (subjective grading still pending somewhere) or RESULT_READY
 * (nothing left to grade — teacher can publish immediately). No-ops outside
 * that window so it's safe to call opportunistically from any route that
 * just changed evaluation state.
 */
export async function recomputeEvaluationStatus(assessmentId: string) {
  const assessment = await prisma.assessment.findUnique({ where: { id: assessmentId }, select: { status: true } });
  if (!assessment || (assessment.status !== "ENDED" && assessment.status !== "EVALUATION")) return;

  const pendingCount = await prisma.evaluation.count({
    where: {
      status: { in: ["PENDING", "AI_SUGGESTED"] },
      questionAttempt: { studentAssessment: { assessmentId } },
    },
  });

  const nextStatus: AssessmentStatus = pendingCount > 0 ? "EVALUATION" : "RESULT_READY";
  if (nextStatus !== assessment.status) {
    await prisma.assessment.update({ where: { id: assessmentId }, data: { status: nextStatus } });
  }
}
