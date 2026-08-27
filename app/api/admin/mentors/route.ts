import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requirePermission } from "@/lib/auth/rbac";
import { parsePagination } from "@/lib/api/pagination";
import { errorResponse } from "@/lib/api/respond";
import type { Prisma } from "@/lib/generated/prisma/client";
import type { MentorApplicationStatus } from "@/lib/generated/prisma/enums";

export async function GET(request: NextRequest) {
  try {
    await requirePermission("mentors.read");
    const { searchParams } = request.nextUrl;
    const { limit, offset } = parsePagination(searchParams);
    const status = searchParams.get("status") ?? undefined;
    const q = searchParams.get("q")?.trim();

    const where: Prisma.MentorProfileWhereInput = {
      ...(status ? { status: status as MentorApplicationStatus } : {}),
      ...(q
        ? {
            OR: [
              { user: { name: { contains: q, mode: "insensitive" } } },
              { user: { email: { contains: q, mode: "insensitive" } } },
            ],
          }
        : {}),
    };

    const [mentors, total] = await prisma.$transaction([
      prisma.mentorProfile.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true, status: true, createdAt: true } },
          subjects: { select: { slug: true, name: true } },
          _count: { select: { bookings: true } },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.mentorProfile.count({ where }),
    ]);

    return NextResponse.json({ mentors, total, limit, offset });
  } catch (error) {
    return errorResponse(error);
  }
}
