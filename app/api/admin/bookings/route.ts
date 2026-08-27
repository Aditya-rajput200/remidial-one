import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requirePermission } from "@/lib/auth/rbac";
import { parsePagination } from "@/lib/api/pagination";
import { errorResponse } from "@/lib/api/respond";
import type { Prisma } from "@/lib/generated/prisma/client";
import type { BookingStatus } from "@/lib/generated/prisma/enums";

export async function GET(request: NextRequest) {
  try {
    await requirePermission("bookings.read");
    const { searchParams } = request.nextUrl;
    const { limit, offset } = parsePagination(searchParams);
    const status = searchParams.get("status") ?? undefined;

    const where: Prisma.BookingWhereInput = status ? { status: status as BookingStatus } : {};

    const [bookings, total] = await prisma.$transaction([
      prisma.booking.findMany({
        where,
        include: {
          subject: { select: { slug: true, name: true } },
          mentor: { select: { id: true, user: { select: { name: true } } } },
          student: { select: { id: true, user: { select: { name: true } } } },
        },
        orderBy: { scheduledAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.booking.count({ where }),
    ]);

    return NextResponse.json({ bookings, total, limit, offset });
  } catch (error) {
    return errorResponse(error);
  }
}
