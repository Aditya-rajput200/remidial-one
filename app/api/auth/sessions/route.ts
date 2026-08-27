import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentSession } from "@/lib/auth/session.server";
import { UnauthenticatedError } from "@/lib/auth/errors";
import { errorResponse } from "@/lib/api/respond";

export async function GET() {
  try {
    const current = await getCurrentSession();
    if (!current) throw new UnauthenticatedError();

    const sessions = await prisma.session.findMany({
      where: { userId: current.user.id, revokedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { lastSeenAt: "desc" },
      select: { id: true, userAgent: true, ip: true, createdAt: true, lastSeenAt: true, expiresAt: true },
    });

    return NextResponse.json({
      sessions: sessions.map((s) => ({ ...s, isCurrent: s.id === current.id })),
    });
  } catch (error) {
    return errorResponse(error);
  }
}
