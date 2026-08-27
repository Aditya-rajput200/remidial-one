import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { getCurrentSession, revokeAllSessions } from "@/lib/auth/session.server";
import { UnauthenticatedError } from "@/lib/auth/errors";
import { errorResponse } from "@/lib/api/respond";
import { recordAuditLog } from "@/lib/audit/log";

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z
    .string()
    .min(10, "Password must be at least 10 characters")
    .max(128)
    .regex(/[a-zA-Z]/, "Password must include at least one letter")
    .regex(/[0-9]/, "Password must include at least one number"),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) throw new UnauthenticatedError();

    const body = schema.parse(await request.json());

    const validCurrent = await verifyPassword(body.currentPassword, session.user.passwordHash);
    if (!validCurrent) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    }

    const passwordHash = await hashPassword(body.newPassword);
    await prisma.user.update({ where: { id: session.user.id }, data: { passwordHash } });

    // Keep the session that just made this request alive; revoke the rest
    // so a stolen session elsewhere is cut off by a password change.
    await revokeAllSessions(session.user.id, session.id);

    await recordAuditLog({
      actorId: session.user.id,
      action: "PASSWORD_CHANGED",
      resourceType: "User",
      resourceId: session.user.id,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
