import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requirePermission } from "@/lib/auth/rbac";
import { parsePagination } from "@/lib/api/pagination";
import { errorResponse } from "@/lib/api/respond";

export async function GET(request: NextRequest) {
  try {
    await requirePermission("mentors.read");
    const { limit, offset } = parsePagination(request.nextUrl.searchParams);

    const where = { status: { in: ["APPLICATION", "UNDER_REVIEW"] as ("APPLICATION" | "UNDER_REVIEW")[] } };

    const [applications, total] = await prisma.$transaction([
      prisma.mentorProfile.findMany({
        where,
        include: { user: { select: { id: true, name: true, email: true, createdAt: true } } },
        orderBy: { createdAt: "asc" },
        take: limit,
        skip: offset,
      }),
      prisma.mentorProfile.count({ where }),
    ]);

    return NextResponse.json({ applications, total, limit, offset });
  } catch (error) {
    return errorResponse(error);
  }
}
