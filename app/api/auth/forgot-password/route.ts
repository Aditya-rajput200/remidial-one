import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import { generateRawToken, hashToken } from "@/lib/auth/tokens";
import { forgotPasswordSchema } from "@/lib/validation/auth";
import { errorResponse } from "@/lib/api/respond";
import { checkRateLimit, RateLimitedError } from "@/lib/security/rate-limit";

const GENERIC_RESPONSE = { message: "If an account exists for that email, a reset link has been sent." };

export async function POST(request: NextRequest) {
  try {
    const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const body = forgotPasswordSchema.parse(await request.json());
    const email = body.email.toLowerCase().trim();

    if (!checkRateLimit(`forgot-password:${ip}`, 5, 60 * 60 * 1000)) {
      throw new RateLimitedError();
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // Always return the same response whether or not the account exists,
    // so this endpoint can't be used to enumerate registered emails.
    if (!user) return NextResponse.json(GENERIC_RESPONSE);

    const rawToken = generateRawToken();
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(rawToken),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });
    // TODO(Phase 10 - background jobs): send via EmailService instead of logging.
    console.info(`[password-reset] ${email}: token=${rawToken} (send via EmailService once implemented)`);

    return NextResponse.json(GENERIC_RESPONSE);
  } catch (error) {
    return errorResponse(error);
  }
}
