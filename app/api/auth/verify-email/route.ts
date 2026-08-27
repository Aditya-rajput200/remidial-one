import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { hashToken } from "@/lib/auth/tokens";
import { verifyEmailSchema } from "@/lib/validation/auth";
import { errorResponse } from "@/lib/api/respond";

export async function POST(request: NextRequest) {
  try {
    const body = verifyEmailSchema.parse(await request.json());
    const tokenHash = hashToken(body.token);

    const verificationToken = await prisma.emailVerificationToken.findUnique({ where: { tokenHash } });
    const invalid = () => NextResponse.json({ error: "This verification link is invalid or has expired" }, { status: 400 });

    if (!verificationToken || verificationToken.usedAt || verificationToken.expiresAt < new Date()) {
      return invalid();
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: verificationToken.userId },
        data: { emailVerifiedAt: new Date(), status: "ACTIVE" },
      }),
      prisma.emailVerificationToken.update({
        where: { id: verificationToken.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
