import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requirePermission } from "@/lib/auth/rbac";
import { parsePagination } from "@/lib/api/pagination";
import { errorResponse } from "@/lib/api/respond";
import { Prisma } from "@/lib/generated/prisma/client";
import type { MentorApplicationStatus, TeacherOnboardingStageKey } from "@/lib/generated/prisma/enums";

const PIPELINE_STATUSES: MentorApplicationStatus[] = [
  "APPLICATION",
  "UNDER_REVIEW",
  "NEEDS_CORRECTION",
  "VERIFIED",
];

export async function GET(request: NextRequest) {
  try {
    await requirePermission("teacher_onboarding.read");
    const { searchParams } = request.nextUrl;
    const { limit, offset } = parsePagination(searchParams);
    const q = searchParams.get("q")?.trim();
    const statusParam = searchParams.get("status");
    const stage = searchParams.get("stage") as TeacherOnboardingStageKey | null;
    const includeApproved = searchParams.get("includeApproved") === "1";

    const where: Prisma.MentorProfileWhereInput = {
      // Only applicants that actually entered the pipeline (have stage rows).
      onboardingStages: stage ? { some: { key: stage, state: "CURRENT" } } : { some: {} },
      ...(statusParam
        ? { status: statusParam as MentorApplicationStatus }
        : includeApproved
          ? {}
          : { status: { in: PIPELINE_STATUSES } }),
      ...(q
        ? {
            user: {
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { email: { contains: q, mode: "insensitive" } },
              ],
            },
          }
        : {}),
    };

    const [profiles, total] = await prisma.$transaction([
      prisma.mentorProfile.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true, avatarUrl: true } },
          onboardingStages: { select: { key: true, state: true } },
          _count: { select: { documents: true, demos: true, counselingSessions: true } },
        },
        orderBy: { createdAt: "asc" },
        take: limit,
        skip: offset,
      }),
      prisma.mentorProfile.count({ where }),
    ]);

    const rows = profiles.map((p) => ({
      id: p.id,
      user: p.user,
      status: p.status,
      currentStage: p.onboardingStages.find((s) => s.state === "CURRENT")?.key ?? null,
      completedStages: p.onboardingStages.filter((s) => s.state === "COMPLETED").length,
      totalStages: p.onboardingStages.length,
      formSubmittedAt: p.onboardingFormSubmittedAt,
      createdAt: p.createdAt,
      counts: p._count,
    }));

    return NextResponse.json({ applicants: rows, total, limit, offset });
  } catch (error) {
    return errorResponse(error);
  }
}
