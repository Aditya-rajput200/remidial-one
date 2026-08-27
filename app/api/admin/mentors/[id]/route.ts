import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requirePermission } from "@/lib/auth/rbac";
import { errorResponse } from "@/lib/api/respond";
import { recordAuditLog } from "@/lib/audit/log";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requirePermission("mentors.read");
    const { id } = await params;

    const mentor = await prisma.mentorProfile.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, status: true, createdAt: true, timezone: true, country: true } },
        subjects: { select: { slug: true, name: true } },
        grades: { select: { slug: true, name: true } },
        availability: { select: { dayOfWeek: true, startHour: true, endHour: true } },
        bookings: {
          take: 20,
          orderBy: { scheduledAt: "desc" },
          include: { subject: { select: { name: true } }, student: { select: { user: { select: { name: true } } } } },
        },
      },
    });

    if (!mentor) {
      return NextResponse.json({ error: "Mentor not found" }, { status: 404 });
    }

    return NextResponse.json({ mentor });
  } catch (error) {
    return errorResponse(error);
  }
}

const patchSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("suspend"), reason: z.string().trim().min(1, "A reason is required").max(1000) }),
  z.object({ action: z.literal("reactivate") }),
]);

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requirePermission("mentors.suspend");
    const { id } = await params;
    const body = patchSchema.parse(await request.json());

    const mentor = await prisma.mentorProfile.findUnique({ where: { id } });
    if (!mentor) {
      return NextResponse.json({ error: "Mentor not found" }, { status: 404 });
    }

    const status = body.action === "suspend" ? "SUSPENDED" : "ACTIVE";
    const updated = await prisma.mentorProfile.update({ where: { id }, data: { status } });

    await recordAuditLog({
      actorId: admin.id,
      action: body.action === "suspend" ? "MENTOR_SUSPENDED" : "MENTOR_REACTIVATED",
      resourceType: "MentorProfile",
      resourceId: id,
      metadata: body.action === "suspend" ? { reason: body.reason } : undefined,
    });

    return NextResponse.json({ mentor: { id: updated.id, status: updated.status } });
  } catch (error) {
    return errorResponse(error);
  }
}
