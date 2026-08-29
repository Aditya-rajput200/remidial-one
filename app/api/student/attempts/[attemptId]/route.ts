import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/rbac";
import { errorResponse } from "@/lib/api/respond";
import { getTakePayload } from "@/lib/assessment/attempt";

/** Full resume state for the test-taking shell — safe to call repeatedly (e.g. after a refresh). */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ attemptId: string }> }) {
  try {
    const user = await requireRole("STUDENT");
    const { attemptId } = await params;
    const payload = await getTakePayload(attemptId, user.id);
    return NextResponse.json(payload);
  } catch (error) {
    return errorResponse(error);
  }
}
