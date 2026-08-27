import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requirePermission } from "@/lib/auth/rbac";
import { parsePagination } from "@/lib/api/pagination";
import { errorResponse } from "@/lib/api/respond";
import type { Prisma } from "@/lib/generated/prisma/client";

export async function GET(request: NextRequest) {
  try {
    await requirePermission("students.read");
    const { searchParams } = request.nextUrl;
    const { limit, offset } = parsePagination(searchParams);
    const q = searchParams.get("q")?.trim();

    const where: Prisma.StudentProfileWhereInput = q
      ? {
          OR: [
            { user: { name: { contains: q, mode: "insensitive" } } },
            { user: { email: { contains: q, mode: "insensitive" } } },
          ],
        }
      : {};

    const [students, total] = await prisma.$transaction([
      prisma.studentProfile.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true, status: true, createdAt: true } },
          _count: { select: { bookings: true } },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.studentProfile.count({ where }),
    ]);

    return NextResponse.json({ students, total, limit, offset });
  } catch (error) {
    return errorResponse(error);
  }
}
