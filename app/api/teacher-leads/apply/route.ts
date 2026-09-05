import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import { checkRateLimit, RateLimitedError } from "@/lib/security/rate-limit";
import { teacherLeadSchema } from "@/lib/validation/teacher";
import { errorResponse } from "@/lib/api/respond";
import { sendEmail } from "@/lib/email/send";
import { teacherLeadNotificationEmail } from "@/lib/email/templates";
import { notifyPermissionHolders } from "@/lib/notifications/create";
import { appUrl } from "@/lib/email/app-url";
import { SITE_EMAIL } from "@/lib/seo";

// Public endpoint — the "Become a Mentor" application form
// (app/(marketing)/become-a-mentor) is unauthenticated by design, so it's
// rate-limited by IP instead of by user. Distinct from POST /api/teacher-leads,
// which stays staff-only for leads a counselor enters by hand (assigns the
// lead to themselves, no rate limit). A submission here always lands
// unassigned with source "website", same shape either way after that.
export async function POST(request: NextRequest) {
  try {
    const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    if (!checkRateLimit(`teacher-lead-apply:${ip}`, 5, 60 * 60 * 1000)) {
      throw new RateLimitedError();
    }

    const body = teacherLeadSchema.parse(await request.json());

    // Honeypot tripped — pretend success, don't write or email anything.
    if (body.website) {
      return NextResponse.json({ ok: true }, { status: 201 });
    }

    const lead = await prisma.teacherLead.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        whatsapp: body.whatsapp,
        city: body.city,
        state: body.state,
        source: "website",
        interestedSubjects: body.interestedSubjects,
        interestedGrades: body.interestedGrades,
        message: body.message,
      },
    });

    const adminUrl = appUrl(`/admin/teacher-leads?id=${lead.id}`);
    const notification = teacherLeadNotificationEmail({
      name: body.name,
      email: body.email,
      phone: body.phone,
      subjects: body.interestedSubjects.length ? body.interestedSubjects.join(", ") : "Not specified",
      adminUrl,
    });

    // Both best-effort — neither can fail the request; the lead is already
    // saved and visible in /admin/teacher-leads either way.
    await Promise.all([
      sendEmail({ to: SITE_EMAIL, subject: notification.subject, html: notification.html }),
      notifyPermissionHolders("teacher_leads.read", {
        type: "NEW_TEACHER_LEAD",
        title: `New teacher lead: ${body.name}`,
        body: body.interestedSubjects.length ? `Interested in ${body.interestedSubjects.join(", ")}` : undefined,
        linkUrl: `/admin/teacher-leads?id=${lead.id}`,
      }),
    ]);

    return NextResponse.json({ ok: true, id: lead.id }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
