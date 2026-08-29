import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/rbac";
import { errorResponse } from "@/lib/api/respond";
import { loadOwnedAssessment, assertCanModify } from "@/lib/assessment/access";
import { assertStructureEditable } from "@/lib/assessment/lifecycle";
import { reorderModulesSchema } from "@/lib/validation/assessment";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const { assessment, isModerator } = await loadOwnedAssessment(id, user);
    await assertCanModify(isModerator, user);
    assertStructureEditable(assessment);

    const { moduleIds } = reorderModulesSchema.parse(await request.json());

    await prisma.$transaction(
      moduleIds.map((moduleId, order) =>
        prisma.assessmentModule.update({ where: { id: moduleId, assessmentId: id }, data: { order } }),
      ),
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
