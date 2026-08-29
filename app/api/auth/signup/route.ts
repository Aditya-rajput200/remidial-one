import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/password";
import { generateRawToken, hashToken } from "@/lib/auth/tokens";
import { createSession } from "@/lib/auth/session.server";
import { signupSchema } from "@/lib/validation/auth";
import { errorResponse } from "@/lib/api/respond";
import { checkRateLimit, RateLimitedError } from "@/lib/security/rate-limit";
import { recordAuditLog } from "@/lib/audit/log";
import { toPublicUser } from "@/lib/auth/public-user";
import { sendEmail } from "@/lib/email/send";
import { verificationEmail } from "@/lib/email/templates";
import { appUrl } from "@/lib/email/app-url";

export async function POST(request: NextRequest) {
  try {
    const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    if (!checkRateLimit(`signup:${ip}`, 10, 60 * 60 * 1000)) {
      throw new RateLimitedError();
    }

    const body = signupSchema.parse(await request.json());
    const email = body.email.toLowerCase().trim();

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      // Generic message — do not reveal whether the account already exists.
      return NextResponse.json(
        { error: "Could not create account with the provided details" },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(body.password);

    const user = await prisma.user.create({
      data: {
        email,
        name: body.name,
        passwordHash,
        role: body.role,
        ...(body.role === "STUDENT" ? { studentProfile: { create: {} } } : {}),
        ...(body.role === "MENTOR" ? { mentorProfile: { create: {} } } : {}),
        ...(body.role === "PARENT" ? { parentProfile: { create: {} } } : {}),
      },
    });

    const rawToken = generateRawToken();
    await prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(rawToken),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });
    const { subject, html } = verificationEmail(user.name, appUrl(`/verify-email?token=${rawToken}`));
    await sendEmail({ to: email, subject, html });

    await createSession(user.id);
    await recordAuditLog({
      actorId: user.id,
      action: "USER_SIGNED_UP",
      resourceType: "User",
      resourceId: user.id,
      metadata: { role: user.role },
      ip,
    });

    return NextResponse.json({ user: toPublicUser(user) }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
