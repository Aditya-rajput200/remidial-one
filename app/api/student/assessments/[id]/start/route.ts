import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/rbac";
import { errorResponse } from "@/lib/api/respond";
import { startOrResumeAttempt } from "@/lib/assessment/attempt";

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireRole("STUDENT");
    const { id } = await params;
    const attempt = await startOrResumeAttempt(id, user.id);
    return NextResponse.json({ attemptId: attempt.id });
  } catch (error) {
    return errorResponse(error);
  }
}
