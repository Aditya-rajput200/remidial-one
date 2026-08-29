import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/rbac";
import { errorResponse } from "@/lib/api/respond";
import { loadOwnedAssessment, assertCanModify } from "@/lib/assessment/access";
import { assertStructureEditable } from "@/lib/assessment/lifecycle";
import { createModuleSchema } from "@/lib/validation/assessment";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const { assessment, isModerator } = await loadOwnedAssessment(id, user);
    await assertCanModify(isModerator, user);
    assertStructureEditable(assessment);

    const body = createModuleSchema.parse(await request.json());
    const count = await prisma.assessmentModule.count({ where: { assessmentId: id } });
    const created = await prisma.assessmentModule.create({
      data: { assessmentId: id, ...body, order: count },
    });

    return NextResponse.json({ module: created }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
