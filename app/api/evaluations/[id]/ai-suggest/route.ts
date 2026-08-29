import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { ForbiddenError } from "@/lib/auth/errors";
import { errorResponse } from "@/lib/api/respond";
import { checkRateLimit, RateLimitedError } from "@/lib/security/rate-limit";
import { loadOwnedAssessment, assertCanModify } from "@/lib/assessment/access";
import { suggestEvaluation } from "@/lib/assessment/ai/answerEvaluation";

const REASON_MESSAGES: Record<string, string> = {
  not_configured: "AI evaluation suggestions aren't configured yet. Set NVIDIA_API_KEY.",
  request_failed: "The AI provider didn't return a usable response.",
  not_applicable: "Evaluation not found.",
};

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireRole("MENTOR", "ADMIN", "SUPER_ADMIN");
    const { id } = await params;

    if (!checkRateLimit(`ai-evaluate:${user.id}`, 60, 60 * 60 * 1000)) {
      throw new RateLimitedError("AI evaluation suggestions are limited to 60 per hour");
    }

    const evaluation = await prisma.evaluation.findUnique({
      where: { id },
      include: { questionAttempt: { select: { studentAssessment: { select: { assessmentId: true } } } } },
    });
    if (!evaluation) throw new ForbiddenError("Evaluation not found");
    const { isModerator } = await loadOwnedAssessment(evaluation.questionAttempt.studentAssessment.assessmentId, user);
    await assertCanModify(isModerator, user);

    const result = await suggestEvaluation(id);
    if (!result.ok) {
      return NextResponse.json({ error: REASON_MESSAGES[result.reason] }, { status: 503 });
    }

    const updated = await prisma.evaluation.findUniqueOrThrow({ where: { id }, include: { aiEvaluation: true } });
    return NextResponse.json({ evaluation: updated });
  } catch (error) {
    return errorResponse(error);
  }
}
