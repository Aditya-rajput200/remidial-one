import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth/rbac";
import { errorResponse } from "@/lib/api/respond";
import { markForReview } from "@/lib/assessment/attempt";

const schema = z.object({ marked: z.boolean() });

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ attemptId: string; moduleQuestionId: string }> },
) {
  try {
    const user = await requireRole("STUDENT");
    const { attemptId, moduleQuestionId } = await params;
    const { marked } = schema.parse(await request.json());
    const qa = await markForReview(attemptId, moduleQuestionId, marked, user.id);
    return NextResponse.json({ state: qa.state });
  } catch (error) {
    return errorResponse(error);
  }
}
