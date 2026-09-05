import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import { requirePermission } from "@/lib/auth/rbac";
import { parsePagination } from "@/lib/api/pagination";
import { errorResponse } from "@/lib/api/respond";
import { checkRateLimit, RateLimitedError } from "@/lib/security/rate-limit";
import { contactMessageSchema } from "@/lib/validation/leads";
import { sendEmail } from "@/lib/email/send";
import { contactMessageNotificationEmail, teacherLeadNotificationEmail } from "@/lib/email/templates";
import { notifyPermissionHolders } from "@/lib/notifications/create";
import { appUrl } from "@/lib/email/app-url";
import { SITE_EMAIL } from "@/lib/seo";
import type { Prisma } from "@/lib/generated/prisma/client";
import type { LeadStatus } from "@/lib/generated/prisma/enums";

// Public endpoint — the Contact page form (app/(marketing)/contact) is
// unauthenticated by design, so it's rate-limited by IP instead of by user.
export async function POST(request: NextRequest) {
  try {
    const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    if (!checkRateLimit(`contact-message:${ip}`, 5, 60 * 60 * 1000)) {
      throw new RateLimitedError();
    }

    const body = contactMessageSchema.parse(await request.json());

    // Honeypot tripped — pretend success, don't write or email anything.
    if (body.website) {
      return NextResponse.json({ ok: true }, { status: 201 });
    }

    // "I'm reaching out as a Prospective Mentor" isn't a student inquiry —
    // it's the same intent as the Become a Mentor form, so it becomes a
    // TeacherLead and shows up in /admin/teacher-leads instead of
    // /admin/inquiries. contactMessageSchema requires a phone number for
    // this reason, matching TeacherLead's required field.
    if (body.reason === "mentor") {
      // contactMessageSchema's superRefine already guarantees a real phone
      // number for this reason — the fallback is unreachable, just satisfies
      // phone's `string | undefined` type from the field being optional for
      // the other two reasons.
      const phone = body.phone || "";
      const lead = await prisma.teacherLead.create({
        data: {
          name: body.name,
          email: body.email,
          phone,
          source: "contact-form",
          message: body.message,
        },
      });

      const adminUrl = appUrl(`/admin/teacher-leads?id=${lead.id}`);
      const notification = teacherLeadNotificationEmail({
        name: body.name,
        email: body.email,
        phone,
        subjects: "Not specified",
        adminUrl,
      });

      await Promise.all([
        sendEmail({ to: SITE_EMAIL, subject: notification.subject, html: notification.html }),
        notifyPermissionHolders("teacher_leads.read", {
          type: "NEW_TEACHER_LEAD",
          title: `New teacher lead: ${body.name}`,
          linkUrl: `/admin/teacher-leads?id=${lead.id}`,
        }),
      ]);

      return NextResponse.json({ ok: true, id: lead.id }, { status: 201 });
    }

    const created = await prisma.contactMessage.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone || null,
        reason: body.reason,
        message: body.message,
      },
    });

    const notification = contactMessageNotificationEmail({
      ...body,
      phone: body.phone || undefined,
      adminUrl: appUrl("/admin/inquiries"),
    });
    await sendEmail({ to: SITE_EMAIL, subject: notification.subject, html: notification.html });

    return NextResponse.json({ ok: true, id: created.id }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    await requirePermission("support.read");
    const { searchParams } = request.nextUrl;
    const { limit, offset } = parsePagination(searchParams);
    const status = searchParams.get("status") ?? undefined;
    const dueOnly = searchParams.get("dueOnly") === "1";
    const q = searchParams.get("q")?.trim();

    const where: Prisma.ContactMessageWhereInput = {
      // Defense in depth against any pre-existing "mentor" rows from before
      // this reason was routed to TeacherLead instead — Inquiries is
      // student-only.
      reason: { not: "mentor" },
      ...(status ? { status: status as LeadStatus } : {}),
      ...(dueOnly ? { nextFollowUpAt: { lte: new Date() } } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
              { phone: { contains: q } },
            ],
          }
        : {}),
    };

    const [messages, total] = await prisma.$transaction([
      prisma.contactMessage.findMany({
        where,
        include: { _count: { select: { activities: true } } },
        orderBy: dueOnly ? { nextFollowUpAt: "asc" } : { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.contactMessage.count({ where }),
    ]);

    return NextResponse.json({ messages, total, limit, offset });
  } catch (error) {
    return errorResponse(error);
  }
}
