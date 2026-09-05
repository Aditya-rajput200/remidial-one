import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import { requirePermission } from "@/lib/auth/rbac";
import { parsePagination } from "@/lib/api/pagination";
import { errorResponse } from "@/lib/api/respond";
import { checkRateLimit, RateLimitedError } from "@/lib/security/rate-limit";
import { counsellingRequestSchema } from "@/lib/validation/leads";
import { sendEmail } from "@/lib/email/send";
import { counsellingRequestNotificationEmail, counsellingRequestConfirmationEmail } from "@/lib/email/templates";
import { appUrl } from "@/lib/email/app-url";
import { SITE_EMAIL } from "@/lib/seo";
import { forwardLeadToCrm } from "@/lib/integrations/crmWebhook";
import type { Prisma } from "@/lib/generated/prisma/client";
import type { LeadStatus } from "@/lib/generated/prisma/enums";

// Public endpoint — the "Book Free Counselling" form (app/(marketing)/book-counselling)
// is unauthenticated by design, so it's rate-limited by IP instead of by user.
export async function POST(request: NextRequest) {
  try {
    const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    if (!checkRateLimit(`counselling-request:${ip}`, 5, 60 * 60 * 1000)) {
      throw new RateLimitedError();
    }

    const body = counsellingRequestSchema.parse(await request.json());

    // Honeypot tripped — pretend success so the bot doesn't learn to leave
    // the field blank, but don't write anything or send any email.
    if (body.website) {
      return NextResponse.json({ ok: true }, { status: 201 });
    }

    const created = await prisma.counsellingRequest.create({
      data: {
        parentName: body.parentName,
        studentName: body.studentName,
        relation: body.relation,
        email: body.email,
        phone: body.phone,
        classBand: body.classBand,
        focusArea: body.focusArea,
        preferredTime: body.preferredTime,
        message: body.message,
      },
    });

    const notification = counsellingRequestNotificationEmail({
      ...body,
      adminUrl: appUrl("/admin/inquiries"),
    });
    const confirmation = counsellingRequestConfirmationEmail(body);

    // Best-effort — sendEmail/forwardLeadToCrm never throw, so a missing
    // RESEND_API_KEY/CRM_WEBHOOK_URL or a provider error never fails the
    // request itself; the request is already saved and visible in
    // /admin/inquiries either way.
    await Promise.all([
      sendEmail({ to: SITE_EMAIL, subject: notification.subject, html: notification.html }),
      sendEmail({ to: body.email, subject: confirmation.subject, html: confirmation.html }),
      forwardLeadToCrm({
        formName: "book-counselling",
        studentName: body.studentName,
        parentName: body.parentName,
        email: body.email,
        phone: body.phone,
        className: body.classBand,
        learningRequirements: [body.focusArea, body.message].filter(Boolean).join(" — ") || undefined,
        preferredContactTime: body.preferredTime,
        source: "book-counselling",
        submittedAt: created.createdAt.toISOString(),
      }),
    ]);

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
    // dueOnly=1 powers the "follow-ups due" view — anything with a
    // nextFollowUpAt at or before now, soonest/most-overdue first.
    const dueOnly = searchParams.get("dueOnly") === "1";
    const q = searchParams.get("q")?.trim();

    const where: Prisma.CounsellingRequestWhereInput = {
      ...(status ? { status: status as LeadStatus } : {}),
      ...(dueOnly ? { nextFollowUpAt: { lte: new Date() } } : {}),
      ...(q
        ? {
            OR: [
              { studentName: { contains: q, mode: "insensitive" } },
              { parentName: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
              { phone: { contains: q } },
            ],
          }
        : {}),
    };

    const [requests, total] = await prisma.$transaction([
      prisma.counsellingRequest.findMany({
        where,
        include: { _count: { select: { activities: true } } },
        orderBy: dueOnly ? { nextFollowUpAt: "asc" } : { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.counsellingRequest.count({ where }),
    ]);

    return NextResponse.json({ requests, total, limit, offset });
  } catch (error) {
    return errorResponse(error);
  }
}
