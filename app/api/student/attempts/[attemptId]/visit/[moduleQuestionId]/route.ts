import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/rbac";
import { errorResponse } from "@/lib/api/respond";
import { visitQuestion } from "@/lib/assessment/attempt";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ attemptId: string; moduleQuestionId: string }> },
) {
  try {
    const user = await requireRole("STUDENT");
    const { attemptId, moduleQuestionId } = await params;
    const qa = await visitQuestion(attemptId, moduleQuestionId, user.id);
    return NextResponse.json({ state: qa.state, visitCount: qa.visitCount });
  } catch (error) {
    return errorResponse(error);
  }
}
