import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/rbac";
import { errorResponse } from "@/lib/api/respond";
import { requireOwnAttempt } from "@/lib/assessment/access";
import { submitAttempt } from "@/lib/assessment/attempt";

/** Idempotent — submitting an already-submitted attempt just returns the existing result. */
export async function POST(_request: NextRequest, { params }: { params: Promise<{ attemptId: string }> }) {
  try {
    const user = await requireRole("STUDENT");
    const { attemptId } = await params;
    await requireOwnAttempt(attemptId, user);
    const result = await submitAttempt(attemptId, "MANUAL");
    return NextResponse.json(result);
  } catch (error) {
    return errorResponse(error);
  }
}
