import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/rbac";
import { errorResponse } from "@/lib/api/respond";

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser();
    const unreadOnly = request.nextUrl.searchParams.get("unreadOnly") === "1";
    const limit = Math.min(Math.max(Number(request.nextUrl.searchParams.get("limit")) || 20, 1), 50);

    const [items, unreadCount] = await prisma.$transaction([
      prisma.notification.findMany({
        where: { userId: user.id, ...(unreadOnly ? { readAt: null } : {}) },
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
      prisma.notification.count({ where: { userId: user.id, readAt: null } }),
    ]);

    return NextResponse.json({ notifications: items, unreadCount });
  } catch (error) {
    return errorResponse(error);
  }
}

// Mark all of the current user's notifications read.
export async function PATCH() {
  try {
    const user = await requireUser();
    await prisma.notification.updateMany({
      where: { userId: user.id, readAt: null },
      data: { readAt: new Date() },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
