import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requirePermission } from "@/lib/auth/rbac";
import { errorResponse } from "@/lib/api/respond";
import { recordAuditLog } from "@/lib/audit/log";
import { teacherCounselingSchema } from "@/lib/validation/teacher";
import { completeStage } from "@/lib/teacher/onboarding";
import { createNotification } from "@/lib/notifications/create";
import { sendEmail } from "@/lib/email/send";
import { teacherCounselingScheduledEmail } from "@/lib/email/templates";

async function loadProfile(id: string) {
  return prisma.mentorProfile.findUnique({
    where: { id },
    select: { id: true, user: { select: { id: true, name: true, email: true } } },
  });
}

async function applyCompletion(
  profileId: string,
  actorId: string,
  outcome: string | undefined,
) {
  await completeStage(profileId, "COUNSELING", actorId, outcome ? `Counseling outcome: ${outcome}` : undefined);
  await prisma.teacherLead
    .updateMany({ where: { mentorProfileId: profileId }, data: { status: "COUNSELING_COMPLETED" } })
    .catch(() => {});
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requirePermission("teacher_onboarding.manage");
    const { id } = await params;
    const body = teacherCounselingSchema.parse(await request.json());

    const profile = await loadProfile(id);
    if (!profile) return NextResponse.json({ error: "Applicant not found" }, { status: 404 });

    const record = await prisma.teacherCounseling.create({
      data: {
        mentorProfileId: id,
        counselorId: actor.id,
        scheduledAt: body.scheduledAt,
        mode: body.mode,
        notes: body.notes,
        teacherExpectations: body.teacherExpectations,
        subjectDiscussion: body.subjectDiscussion,
        experienceVerified: body.experienceVerified,
        communicationNotes: body.communicationNotes,
        availabilityNotes: body.availabilityNotes,
        compensationNotes: body.compensationNotes,
        recommendation: body.recommendation,
        outcome: body.outcome,
        completedAt: body.complete ? new Date() : null,
      },
    });

    if (body.complete) await applyCompletion(id, actor.id, body.outcome);

    if (body.scheduledAt && !body.complete) {
      const when = body.scheduledAt.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
      await createNotification({
        userId: profile.user.id,
        type: "TEACHER_COUNSELING_SCHEDULED",
        title: "Your onboarding counseling call is scheduled",
        body: `${when}${body.mode ? ` · ${body.mode}` : ""}`,
        linkUrl: "/mentor/onboarding",
      });
      const mail = teacherCounselingScheduledEmail({ name: profile.user.name, when, mode: body.mode });
      await sendEmail({ to: profile.user.email, subject: mail.subject, html: mail.html });
    }

    await recordAuditLog({
      actorId: actor.id,
      action: body.complete ? "TEACHER_COUNSELING_COMPLETED" : "TEACHER_COUNSELING_RECORDED",
      resourceType: "MentorProfile",
      resourceId: id,
      metadata: { counselingId: record.id, outcome: body.outcome },
    });

    return NextResponse.json({ ok: true, id: record.id }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requirePermission("teacher_onboarding.manage");
    const { id } = await params;
    const body = teacherCounselingSchema.parse(await request.json());

    const latest = await prisma.teacherCounseling.findFirst({
      where: { mentorProfileId: id },
      orderBy: { createdAt: "desc" },
    });
    if (!latest) return NextResponse.json({ error: "No counseling record to update" }, { status: 404 });

    await prisma.teacherCounseling.update({
      where: { id: latest.id },
      data: {
        scheduledAt: body.scheduledAt,
        mode: body.mode,
        notes: body.notes,
        teacherExpectations: body.teacherExpectations,
        subjectDiscussion: body.subjectDiscussion,
        experienceVerified: body.experienceVerified,
        communicationNotes: body.communicationNotes,
        availabilityNotes: body.availabilityNotes,
        compensationNotes: body.compensationNotes,
        recommendation: body.recommendation,
        outcome: body.outcome,
        ...(body.complete && !latest.completedAt ? { completedAt: new Date() } : {}),
      },
    });

    if (body.complete && !latest.completedAt) await applyCompletion(id, actor.id, body.outcome);

    await recordAuditLog({
      actorId: actor.id,
      action: body.complete ? "TEACHER_COUNSELING_COMPLETED" : "TEACHER_COUNSELING_UPDATED",
      resourceType: "MentorProfile",
      resourceId: id,
      metadata: { counselingId: latest.id, outcome: body.outcome },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
