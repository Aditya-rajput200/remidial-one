import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentSession } from "@/lib/auth/session.server";
import { UnauthenticatedError, ForbiddenError } from "@/lib/auth/errors";
import { errorResponse } from "@/lib/api/respond";
import { recordAuditLog } from "@/lib/audit/log";

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const current = await getCurrentSession();
    if (!current) throw new UnauthenticatedError();

    const { id } = await params;
    const target = await prisma.session.findUnique({ where: { id } });

    if (!target || target.userId !== current.user.id) {
      // Same response whether the session doesn't exist or belongs to
      // someone else — don't confirm the existence of other users' sessions.
      throw new ForbiddenError("Session not found");
    }

    await prisma.session.update({ where: { id }, data: { revokedAt: new Date() } });

    await recordAuditLog({
      actorId: current.user.id,
      action: "SESSION_REVOKED",
      resourceType: "Session",
      resourceId: id,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
