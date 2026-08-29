import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/rbac";
import { errorResponse } from "@/lib/api/respond";
import { autosaveAnswer } from "@/lib/assessment/attempt";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ attemptId: string; moduleQuestionId: string }> },
) {
  try {
    const user = await requireRole("STUDENT");
    const { attemptId, moduleQuestionId } = await params;
    const body = await request.json();
    const result = await autosaveAnswer(attemptId, moduleQuestionId, body.response, user.id);
    return NextResponse.json(result);
  } catch (error) {
    return errorResponse(error);
  }
}
