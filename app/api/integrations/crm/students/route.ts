import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireServiceToken } from "@/lib/auth/service-token";
import { hashPassword } from "@/lib/auth/password";
import { generateRawToken, hashToken } from "@/lib/auth/tokens";
import { sendEmail } from "@/lib/email/send";
import { studentAccountReadyEmail } from "@/lib/email/templates";
import { appUrl } from "@/lib/email/app-url";
import { recordAuditLog } from "@/lib/audit/log";
import { errorResponse } from "@/lib/api/respond";

// Provisions (or, on retry, returns) a real login-capable STUDENT account for
// a student the internal CRM (see Crm/my-app) has enrolled. Called
// server-to-server with a bearer service token — there is no user session to
// check here, the CRM is a separate app/database. Idempotent by email: a
// second call with the same email never creates a duplicate account.
const bodySchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  grade: z.string().optional(),
  subjectsOfInterest: z.array(z.string()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    requireServiceToken(request.headers.get("authorization"));
    const body = bodySchema.parse(await request.json());
    const email = body.email.toLowerCase().trim();

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      if (existing.role !== "STUDENT") {
        return NextResponse.json(
          { error: "An account with this email already exists under a different role" },
          { status: 409 },
        );
      }
      return NextResponse.json({ userId: existing.id, created: false });
    }

    const passwordHash = await hashPassword(generateRawToken());
    const user = await prisma.user.create({
      data: {
        email,
        name: body.name,
        passwordHash,
        role: "STUDENT",
        status: "PENDING_VERIFICATION",
        studentProfile: {
          create: {
            grade: body.grade,
            subjectsOfInterest: body.subjectsOfInterest ?? [],
          },
        },
      },
    });

    const rawReset = generateRawToken();
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(rawReset),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    const mail = studentAccountReadyEmail({ name: user.name, setPasswordUrl: appUrl(`/reset-password?token=${rawReset}`) });
    await sendEmail({ to: email, subject: mail.subject, html: mail.html });

    await recordAuditLog({
      actorId: null,
      action: "CRM_STUDENT_ACCOUNT_PROVISIONED",
      resourceType: "User",
      resourceId: user.id,
      metadata: { source: "crm" },
    });

    return NextResponse.json({ userId: user.id, created: true }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
