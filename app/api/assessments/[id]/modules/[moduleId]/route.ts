import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/rbac";
import { errorResponse } from "@/lib/api/respond";
import { loadOwnedAssessment, assertCanModify } from "@/lib/assessment/access";
import { assertStructureEditable } from "@/lib/assessment/lifecycle";
import { updateModuleSchema } from "@/lib/validation/assessment";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; moduleId: string }> },
) {
  try {
    const user = await requireUser();
    const { id, moduleId } = await params;
    const { assessment, isModerator } = await loadOwnedAssessment(id, user);
    await assertCanModify(isModerator, user);
    assertStructureEditable(assessment);

    const body = updateModuleSchema.parse(await request.json());
    const updated = await prisma.assessmentModule.update({ where: { id: moduleId, assessmentId: id }, data: body });
    return NextResponse.json({ module: updated });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; moduleId: string }> },
) {
  try {
    const user = await requireUser();
    const { id, moduleId } = await params;
    const { assessment, isModerator } = await loadOwnedAssessment(id, user);
    await assertCanModify(isModerator, user);
    assertStructureEditable(assessment);

    await prisma.assessmentModule.delete({ where: { id: moduleId, assessmentId: id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
