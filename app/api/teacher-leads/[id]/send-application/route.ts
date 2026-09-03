import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/db/prisma";
import { requirePermission } from "@/lib/auth/rbac";
import { errorResponse } from "@/lib/api/respond";
import { recordAuditLog } from "@/lib/audit/log";
import { hashPassword } from "@/lib/auth/password";
import { seedOnboardingStages } from "@/lib/teacher/onboarding";
import { issueApplicationToken } from "@/lib/teacher/application-token";
import { sendEmail } from "@/lib/email/send";
import { teacherApplicationLinkEmail } from "@/lib/email/templates";
import { appUrl } from "@/lib/email/app-url";

/**
 * Generates (or regenerates) the prefilled no-login application link for a
 * lead. First call creates the applicant record: a MENTOR user with an
 * unusable password (they can't log in yet — a password link is only emailed
 * on approval) + a MentorProfile seeded from the lead + the onboarding stage
 * timeline. Returns the /apply/<token> URL for the admin to share and also
 * emails it to the applicant.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requirePermission("teacher_leads.manage");
    const { id } = await params;

    const lead = await prisma.teacherLead.findUnique({
      where: { id },
      include: { mentorProfile: { select: { id: true, status: true } } },
    });
    if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

    let mentorProfileId = lead.mentorProfileId ?? null;
    let created = false;

    if (!mentorProfileId) {
      const email = lead.email.toLowerCase().trim();
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return NextResponse.json({ error: "A user with this email already exists" }, { status: 409 });
      }
      const passwordHash = await hashPassword(randomBytes(32).toString("base64url"));
      const user = await prisma.user.create({
        data: {
          email,
          name: lead.name,
          passwordHash,
          role: "MENTOR",
          status: "PENDING_VERIFICATION",
          mentorProfile: {
            create: {
              status: "APPLICATION",
              phone: lead.phone,
              whatsapp: lead.whatsapp,
              city: lead.city,
              state: lead.state,
            },
          },
        },
        include: { mentorProfile: true },
      });
      mentorProfileId = user.mentorProfile!.id;
      created = true;
      await prisma.teacherLead.update({
        where: { id },
        data: { mentorProfileId, convertedUserId: user.id, convertedAt: new Date(), status: "FORM_SENT" },
      });
      await seedOnboardingStages(mentorProfileId);
      await recordAuditLog({
        actorId: actor.id,
        action: "TEACHER_APPLICATION_STARTED",
        resourceType: "MentorProfile",
        resourceId: mentorProfileId,
        metadata: { fromLeadId: id },
      });
    } else if (lead.mentorProfile?.status === "ACTIVE" || lead.mentorProfile?.status === "REJECTED") {
      return NextResponse.json({ error: "This application is already closed" }, { status: 409 });
    } else if (lead.status === "NEW" || lead.status === "CONTACTED") {
      await prisma.teacherLead.update({ where: { id }, data: { status: "FORM_SENT" } });
    }

    const rawToken = await issueApplicationToken(mentorProfileId);
    const applicationUrl = appUrl(`/apply/${rawToken}`);

    const mail = teacherApplicationLinkEmail({ name: lead.name, applicationUrl });
    await sendEmail({ to: lead.email, subject: mail.subject, html: mail.html });

    await recordAuditLog({
      actorId: actor.id,
      action: created ? "TEACHER_APPLICATION_LINK_SENT" : "TEACHER_APPLICATION_LINK_REGENERATED",
      resourceType: "TeacherLead",
      resourceId: id,
      metadata: { mentorProfileId },
    });

    return NextResponse.json({ ok: true, mentorProfileId, applicationUrl, created }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
