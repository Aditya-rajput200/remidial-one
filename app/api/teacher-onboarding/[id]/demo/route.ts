import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requirePermission } from "@/lib/auth/rbac";
import { errorResponse } from "@/lib/api/respond";
import { recordAuditLog } from "@/lib/audit/log";
import { teacherDemoScheduleSchema } from "@/lib/validation/teacher";
import { createNotification } from "@/lib/notifications/create";
import { sendEmail } from "@/lib/email/send";
import { teacherDemoScheduledEmail } from "@/lib/email/templates";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requirePermission("teacher_onboarding.manage");
    const { id } = await params;
    const body = teacherDemoScheduleSchema.parse(await request.json());

    const profile = await prisma.mentorProfile.findUnique({
      where: { id },
      select: { id: true, user: { select: { id: true, name: true, email: true } } },
    });
    if (!profile) return NextResponse.json({ error: "Applicant not found" }, { status: 404 });

    if (body.evaluatorId) {
      const evaluator = await prisma.user.findUnique({ where: { id: body.evaluatorId }, select: { id: true } });
      if (!evaluator) return NextResponse.json({ error: "Evaluator not found" }, { status: 400 });
    }

    const demo = await prisma.teacherDemo.create({
      data: {
        mentorProfileId: id,
        scheduledAt: body.scheduledAt,
        subject: body.subject,
        gradeLabel: body.gradeLabel,
        topic: body.topic,
        durationMinutes: body.durationMinutes,
        meetingLink: body.meetingLink || null,
        evaluatorId: body.evaluatorId || null,
        notes: body.notes,
      },
    });

    await prisma.teacherLead.updateMany({ where: { mentorProfileId: id }, data: { status: "DEMO_PENDING" } }).catch(() => {});

    const when = body.scheduledAt.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
    await createNotification({
      userId: profile.user.id,
      type: "TEACHER_DEMO_SCHEDULED",
      title: "Your demo class is scheduled",
      body: `${when}${body.topic ? ` · ${body.topic}` : ""}`,
      linkUrl: "/mentor/onboarding",
    });
    const mail = teacherDemoScheduledEmail({ name: profile.user.name, when, meetingLink: body.meetingLink || undefined });
    await sendEmail({ to: profile.user.email, subject: mail.subject, html: mail.html });

    await recordAuditLog({
      actorId: actor.id,
      action: "TEACHER_DEMO_SCHEDULED",
      resourceType: "MentorProfile",
      resourceId: id,
      metadata: { demoId: demo.id, scheduledAt: body.scheduledAt.toISOString() },
    });

    return NextResponse.json({ ok: true, id: demo.id }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
