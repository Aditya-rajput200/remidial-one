import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireRole, userHasPermission } from "@/lib/auth/rbac";
import { errorResponse } from "@/lib/api/respond";
import { recordAuditLog } from "@/lib/audit/log";
import { createAssessmentSchema } from "@/lib/validation/assessment";
import { parsePagination } from "@/lib/api/pagination";
import type { Prisma } from "@/lib/generated/prisma/client";

const listInclude = {
  subject: { select: { slug: true, name: true } },
  _count: { select: { modules: true, assignments: true, studentAssessments: true } },
} as const;

/** Mentor dashboard list — own assessments only, unless holding assessments.read (admin oversight). */
export async function GET(request: NextRequest) {
  try {
    const user = await requireRole("MENTOR", "ADMIN", "SUPER_ADMIN");
    const canReadAny = await userHasPermission(user, "assessments.read");
    const { limit, offset } = parsePagination(request.nextUrl.searchParams);
    const status = request.nextUrl.searchParams.get("status");

    const where: Prisma.AssessmentWhereInput = {
      ...(canReadAny ? {} : { createdById: user.id }),
      ...(status ? { status: status as Prisma.EnumAssessmentStatusFilter["equals"] } : {}),
    };

    const [assessments, total] = await prisma.$transaction([
      prisma.assessment.findMany({ where, include: listInclude, orderBy: { updatedAt: "desc" }, take: limit, skip: offset }),
      prisma.assessment.count({ where }),
    ]);

    return NextResponse.json({ assessments, total, limit, offset });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole("MENTOR", "ADMIN", "SUPER_ADMIN");
    const body = createAssessmentSchema.parse(await request.json());

    const assessment = await prisma.assessment.create({
      data: { ...body, createdById: user.id },
    });

    await recordAuditLog({
      actorId: user.id,
      action: "ASSESSMENT_CREATED",
      resourceType: "Assessment",
      resourceId: assessment.id,
    });

    return NextResponse.json({ assessment }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
