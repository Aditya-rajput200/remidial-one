import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/password";
import { hashToken } from "@/lib/auth/tokens";
import { revokeAllSessions } from "@/lib/auth/session.server";
import { resetPasswordSchema } from "@/lib/validation/auth";
import { errorResponse } from "@/lib/api/respond";
import { recordAuditLog } from "@/lib/audit/log";

export async function POST(request: NextRequest) {
  try {
    const body = resetPasswordSchema.parse(await request.json());
    const tokenHash = hashToken(body.token);

    const resetToken = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });
    const invalid = () => NextResponse.json({ error: "This reset link is invalid or has expired" }, { status: 400 });

    if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
      return invalid();
    }

    const passwordHash = await hashPassword(body.password);

    await prisma.$transaction([
      prisma.user.update({ where: { id: resetToken.userId }, data: { passwordHash } }),
      prisma.passwordResetToken.update({ where: { id: resetToken.id }, data: { usedAt: new Date() } }),
    ]);

    // A password reset invalidates every existing session, including any
    // an attacker may have established.
    await revokeAllSessions(resetToken.userId);

    await recordAuditLog({
      actorId: resetToken.userId,
      action: "PASSWORD_RESET",
      resourceType: "User",
      resourceId: resetToken.userId,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
