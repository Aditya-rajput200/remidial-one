import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session.server";
import { loginSchema } from "@/lib/validation/auth";
import { errorResponse } from "@/lib/api/respond";
import { checkRateLimit, RateLimitedError } from "@/lib/security/rate-limit";
import { recordAuditLog } from "@/lib/audit/log";
import { toPublicUser } from "@/lib/auth/public-user";

const ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN"] as const;

export async function POST(request: NextRequest) {
  try {
    const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const body = loginSchema.parse(await request.json());
    const email = body.email.toLowerCase().trim();

    // Rate limit by IP and by email independently so a distributed attempt
    // against one account (many IPs) and a spray attempt (many accounts,
    // one IP) are both throttled.
    if (!checkRateLimit(`login:ip:${ip}`, 20, 15 * 60 * 1000) || !checkRateLimit(`login:email:${email}`, 8, 15 * 60 * 1000)) {
      throw new RateLimitedError();
    }

    const user = await prisma.user.findUnique({ where: { email } });
    const genericError = () => NextResponse.json({ error: "Invalid email or password" }, { status: 401 });

    if (!user) return genericError();

    const validPassword = await verifyPassword(body.password, user.passwordHash);
    if (!validPassword) return genericError();

    if (user.status === "SUSPENDED" || user.status === "DISABLED") {
      return NextResponse.json({ error: "This account has been suspended" }, { status: 403 });
    }

    await createSession(user.id);

    if ((ADMIN_ROLES as readonly string[]).includes(user.role)) {
      await recordAuditLog({
        actorId: user.id,
        action: "ADMIN_LOGIN",
        resourceType: "User",
        resourceId: user.id,
        ip,
      });
    }

    return NextResponse.json({ user: toPublicUser(user) });
  } catch (error) {
    return errorResponse(error);
  }
}
