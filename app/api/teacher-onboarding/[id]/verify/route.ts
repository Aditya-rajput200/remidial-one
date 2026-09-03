import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requirePermission } from "@/lib/auth/rbac";
import { errorResponse } from "@/lib/api/respond";
import { recordAuditLog } from "@/lib/audit/log";
import { generateRawToken, hashToken } from "@/lib/auth/tokens";
import { teacherVerificationSchema } from "@/lib/validation/teacher";
import { completeStage, failStage } from "@/lib/teacher/onboarding";
import { issueApplicationToken } from "@/lib/teacher/application-token";
import { createNotification } from "@/lib/notifications/create";
import { sendEmail } from "@/lib/email/send";
import { appUrl } from "@/lib/email/app-url";
import { teacherApprovedEmail, teacherRejectedEmail, teacherCorrectionEmail } from "@/lib/email/templates";
import type { MentorApplicationStatus, TeacherLeadStatus } from "@/lib/generated/prisma/enums";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requirePermission("teacher_onboarding.verify");
    const { id } = await params;
    const body = teacherVerificationSchema.parse(await request.json());

    const profile = await prisma.mentorProfile.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    if (!profile) return NextResponse.json({ error: "Applicant not found" }, { status: 404 });
    if (profile.status === "ACTIVE" && body.action === "APPROVE") {
      return NextResponse.json({ error: "This teacher is already approved" }, { status: 409 });
    }

    let nextStatus: MentorApplicationStatus = profile.status;
    let leadStatus: TeacherLeadStatus | null = null;

    await prisma.teacherVerificationEvent.create({
      data: { mentorProfileId: id, action: body.action, reason: body.reason, actorId: actor.id },
    });

    if (body.action === "APPROVE") {
      nextStatus = "ACTIVE";
      leadStatus = "ONBOARDED";
      await prisma.$transaction([
        prisma.mentorProfile.update({
          where: { id },
          data: {
            status: "ACTIVE",
            onboardedAt: new Date(),
            reviewedById: actor.id,
            reviewedAt: new Date(),
            rejectionReason: null,
          },
        }),
        prisma.user.update({ where: { id: profile.user.id }, data: { status: "ACTIVE" } }),
      ]);
      await completeStage(id, "VERIFICATION", actor.id, "Approved by super admin");
      await completeStage(id, "APPROVAL", actor.id);
      await completeStage(id, "ONBOARDED", actor.id);

      // Now issue the first real credential path — a set-password link.
      const rawReset = generateRawToken();
      await prisma.passwordResetToken.create({
        data: {
          userId: profile.user.id,
          tokenHash: hashToken(rawReset),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });
      const mail = teacherApprovedEmail({
        name: profile.user.name,
        setPasswordUrl: appUrl(`/reset-password?token=${rawReset}`),
      });
      await sendEmail({ to: profile.user.email, subject: mail.subject, html: mail.html });
      await createNotification({
        userId: profile.user.id,
        type: "TEACHER_APPLICATION_APPROVED",
        title: "Your teacher application is approved 🎉",
        body: "Set a password from the email we sent to unlock your dashboard.",
        linkUrl: "/login",
      });
    } else if (body.action === "REJECT") {
      nextStatus = "REJECTED";
      leadStatus = "REJECTED";
      await prisma.$transaction([
        prisma.mentorProfile.update({
          where: { id },
          data: { status: "REJECTED", reviewedById: actor.id, reviewedAt: new Date(), rejectionReason: body.reason },
        }),
        prisma.user.update({ where: { id: profile.user.id }, data: { status: "DISABLED" } }),
      ]);
      await failStage(id, "VERIFICATION", actor.id, "Rejected");

      const mail = teacherRejectedEmail({ name: profile.user.name, reason: body.reason! });
      await sendEmail({ to: profile.user.email, subject: mail.subject, html: mail.html });
      await createNotification({
        userId: profile.user.id,
        type: "TEACHER_APPLICATION_REJECTED",
        title: "Update on your teacher application",
        body: body.reason,
      });
    } else if (body.action === "SEND_BACK") {
      nextStatus = "NEEDS_CORRECTION";
      leadStatus = "DOCUMENTS_PENDING";
      await prisma.mentorProfile.update({
        where: { id },
        data: { status: "NEEDS_CORRECTION", rejectionReason: body.reason },
      });
      // Reopen the form + reset verification so the applicant can re-submit.
      await prisma.teacherOnboardingStage.updateMany({
        where: { mentorProfileId: id, key: "FORM" },
        data: { state: "CURRENT" },
      });
      await prisma.teacherOnboardingStage.updateMany({
        where: { mentorProfileId: id, key: "VERIFICATION" },
        data: { state: "PENDING" },
      });
      // Reissue the no-login application link so they can edit and resubmit.
      const rawToken = await issueApplicationToken(id);
      const applyUrl = appUrl(`/apply/${rawToken}`);

      const mail = teacherCorrectionEmail({ name: profile.user.name, reason: body.reason!, onboardingUrl: applyUrl });
      await sendEmail({ to: profile.user.email, subject: mail.subject, html: mail.html });
      await createNotification({
        userId: profile.user.id,
        type: "TEACHER_APPLICATION_NEEDS_CORRECTION",
        title: "Changes needed on your application",
        body: body.reason,
        linkUrl: applyUrl,
      });
    } else {
      // REQUEST_INFO — keep it in review, just ask.
      nextStatus = profile.status === "APPLICATION" ? "UNDER_REVIEW" : profile.status;
      if (nextStatus !== profile.status) {
        await prisma.mentorProfile.update({ where: { id }, data: { status: nextStatus } });
      }
      const rawToken = await issueApplicationToken(id);
      const applyUrl = appUrl(`/apply/${rawToken}`);
      await createNotification({
        userId: profile.user.id,
        type: "TEACHER_APPLICATION_UNDER_REVIEW",
        title: "We need more information on your application",
        body: body.reason,
        linkUrl: applyUrl,
      });
      const mail = teacherCorrectionEmail({ name: profile.user.name, reason: body.reason!, onboardingUrl: applyUrl });
      await sendEmail({ to: profile.user.email, subject: mail.subject, html: mail.html });
    }

    if (leadStatus) {
      await prisma.teacherLead.updateMany({ where: { mentorProfileId: id }, data: { status: leadStatus } }).catch(() => {});
    }

    await recordAuditLog({
      actorId: actor.id,
      action: `TEACHER_VERIFICATION_${body.action}`,
      resourceType: "MentorProfile",
      resourceId: id,
      metadata: { reason: body.reason, nextStatus },
    });

    return NextResponse.json({ ok: true, status: nextStatus });
  } catch (error) {
    return errorResponse(error);
  }
}
