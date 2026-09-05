import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireServiceToken } from "@/lib/auth/service-token";
import { hashPassword } from "@/lib/auth/password";
import { generateRawToken, hashToken } from "@/lib/auth/tokens";
import { sendEmail } from "@/lib/email/send";
import { teacherApprovedEmail } from "@/lib/email/templates";
import { appUrl } from "@/lib/email/app-url";
import { recordAuditLog } from "@/lib/audit/log";
import { errorResponse } from "@/lib/api/respond";

// Provisions (or, on retry, returns) a real login-capable MENTOR account for
// a teacher the internal CRM (see Crm/my-app) has fully onboarded and
// activated — the CRM now owns the recruitment/onboarding pipeline, so unlike
// app/api/teacher-onboarding/[id]/verify, this creates the MentorProfile
// already ACTIVE rather than starting the in-app application flow. Called
// server-to-server with a bearer service token. Idempotent by email.
const bodySchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  city: z.string().optional(),
  bio: z.string().optional(),
  qualifications: z.string().optional(),
  languages: z.array(z.string()).optional(),
  hourlyRate: z.number().nonnegative().optional(),
});

export async function POST(request: NextRequest) {
  try {
    requireServiceToken(request.headers.get("authorization"));
    const body = bodySchema.parse(await request.json());
    const email = body.email.toLowerCase().trim();

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      if (existing.role !== "MENTOR") {
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
        role: "MENTOR",
        status: "PENDING_VERIFICATION",
        mentorProfile: {
          create: {
            status: "ACTIVE",
            phone: body.phone,
            whatsapp: body.whatsapp,
            city: body.city,
            bio: body.bio,
            qualifications: body.qualifications,
            languages: body.languages ?? [],
            hourlyRate: body.hourlyRate,
            onboardedAt: new Date(),
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

    const mail = teacherApprovedEmail({ name: user.name, setPasswordUrl: appUrl(`/reset-password?token=${rawReset}`) });
    await sendEmail({ to: email, subject: mail.subject, html: mail.html });

    await recordAuditLog({
      actorId: null,
      action: "CRM_MENTOR_ACCOUNT_PROVISIONED",
      resourceType: "User",
      resourceId: user.id,
      metadata: { source: "crm" },
    });

    return NextResponse.json({ userId: user.id, created: true }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
