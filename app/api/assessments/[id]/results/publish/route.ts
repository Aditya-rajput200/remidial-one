import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/rbac";
import { errorResponse } from "@/lib/api/respond";
import { recordAuditLog } from "@/lib/audit/log";
import { loadOwnedAssessment, assertCanModify } from "@/lib/assessment/access";
import { publishResult } from "@/lib/assessment/publish";

/** Publishes every READY_TO_PUBLISH result for this assessment in one action. */
export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const { isModerator } = await loadOwnedAssessment(id, user);
    await assertCanModify(isModerator, user);

    const ready = await prisma.assessmentResult.findMany({
      where: { status: "READY_TO_PUBLISH", studentAssessment: { assessmentId: id } },
      select: { id: true },
    });

    for (const result of ready) {
      await publishResult(result.id, user.id);
    }

    await recordAuditLog({
      actorId: user.id,
      action: "RESULTS_BULK_PUBLISHED",
      resourceType: "Assessment",
      resourceId: id,
      metadata: { count: ready.length },
    });

    return NextResponse.json({ published: ready.length });
  } catch (error) {
    return errorResponse(error);
  }
}
