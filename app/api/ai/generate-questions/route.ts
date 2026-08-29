import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/rbac";
import { errorResponse } from "@/lib/api/respond";
import { checkRateLimit, RateLimitedError } from "@/lib/security/rate-limit";
import { generateQuestionsSchema } from "@/lib/validation/ai";
import { generateQuestions } from "@/lib/assessment/ai/questionGeneration";
import { recordAuditLog } from "@/lib/audit/log";

const REASON_MESSAGES: Record<string, string> = {
  not_configured: "AI question generation isn't configured yet. Set NVIDIA_API_KEY.",
  request_failed: "The AI provider didn't return a usable response. Try again or adjust your request.",
  no_valid_questions: "None of the generated questions passed validation. Try a narrower topic or fewer questions.",
};

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole("MENTOR", "ADMIN", "SUPER_ADMIN");

    if (!checkRateLimit(`ai-generate:${user.id}`, 10, 60 * 60 * 1000)) {
      throw new RateLimitedError("AI generation is limited to 10 requests per hour");
    }

    const body = generateQuestionsSchema.parse(await request.json());
    const result = await generateQuestions(user.id, body);

    if (!result.ok) {
      return NextResponse.json({ error: REASON_MESSAGES[result.reason] }, { status: 503 });
    }

    await recordAuditLog({
      actorId: user.id,
      action: "AI_QUESTIONS_GENERATED",
      resourceType: "Question",
      metadata: { created: result.created, rejected: result.rejected, spec: body },
    });

    return NextResponse.json({ created: result.created, rejected: result.rejected, questionIds: result.questionIds });
  } catch (error) {
    return errorResponse(error);
  }
}
