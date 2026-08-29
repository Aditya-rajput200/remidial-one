import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/rbac";
import { ForbiddenError } from "@/lib/auth/errors";
import { errorResponse } from "@/lib/api/respond";
import { recordAuditLog } from "@/lib/audit/log";
import { loadOwnedAssessment, assertCanModify } from "@/lib/assessment/access";
import { publishResult } from "@/lib/assessment/publish";

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;

    const result = await prisma.assessmentResult.findUnique({
      where: { id },
      include: { studentAssessment: { select: { assessmentId: true } } },
    });
    if (!result) throw new ForbiddenError("Result not found");
    const { isModerator } = await loadOwnedAssessment(result.studentAssessment.assessmentId, user);
    await assertCanModify(isModerator, user);

    await publishResult(id, user.id);

    await recordAuditLog({ actorId: user.id, action: "RESULT_PUBLISHED", resourceType: "AssessmentResult", resourceId: id });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
