import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { ForbiddenError } from "@/lib/auth/errors";
import { errorResponse } from "@/lib/api/respond";
import { recordAuditLog } from "@/lib/audit/log";
import { loadOwnedAssessment, assertCanModify } from "@/lib/assessment/access";
import { finalizeEvaluation } from "@/lib/assessment/evaluation";

const schema = z.object({ marks: z.number().min(0), feedback: z.string().trim().max(5000).optional() });

/** Teacher finalizes marks for one subjective answer. AI's suggestion (if requested) is only ever a starting point. */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireRole("MENTOR", "ADMIN", "SUPER_ADMIN");
    const { id } = await params;
    const body = schema.parse(await request.json());

    const evaluation = await prisma.evaluation.findUnique({
      where: { id },
      include: { questionAttempt: { select: { studentAssessment: { select: { assessmentId: true } } } } },
    });
    if (!evaluation) throw new ForbiddenError("Evaluation not found");
    const { isModerator } = await loadOwnedAssessment(evaluation.questionAttempt.studentAssessment.assessmentId, user);
    await assertCanModify(isModerator, user);

    await finalizeEvaluation(id, body.marks, body.feedback, user.id);

    await recordAuditLog({
      actorId: user.id,
      action: "EVALUATION_FINALIZED",
      resourceType: "Evaluation",
      resourceId: id,
      metadata: { marks: body.marks },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
