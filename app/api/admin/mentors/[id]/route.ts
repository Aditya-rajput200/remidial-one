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
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true, status: true, createdAt: true, timezone: true, country: true },
        },
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

/**
 * Hard-deletes a mentor (the User row + everything that cascades from it:
 * MentorProfile, onboarding stages/counseling/demos/tech assessment,
 * availability, sessions, notifications). Refused when the mentor has any
 * bookings or authored content on record — suspend them instead, so audit
 * history and student-facing records stay intact. SUPER_ADMIN by default
 * (users.delete is not in the ADMIN baseline).
 */
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requirePermission("users.delete");
    const { id } = await params;

    const mentor = await prisma.mentorProfile.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        user: { select: { name: true, email: true } },
        _count: { select: { bookings: true } },
      },
    });
    if (!mentor) {
      return NextResponse.json({ error: "Mentor not found" }, { status: 404 });
    }

    const authored = await prisma.user.findUnique({
      where: { id: mentor.userId },
      select: {
        _count: {
          select: {
            chaptersCreated: true,
            topicsCreated: true,
            questionsCreated: true,
            assessmentsCreated: true,
            blogPostsAuthored: true,
            evaluationsGiven: true,
            notesUploaded: true,
            classNotesGenerated: true,
          },
        },
      },
    });
    const contentCount = authored
      ? Object.values(authored._count).reduce((a, b) => a + b, 0)
      : 0;

    if (mentor._count.bookings > 0 || contentCount > 0) {
      return NextResponse.json(
        {
          error:
            "This mentor has sessions or content on record and can't be deleted. Suspend them instead to keep the history intact.",
        },
        { status: 409 },
      );
    }

    await prisma.$transaction([
      // RESTRICT edges back to this User that a plain user.delete can't cascade.
      prisma.teacherDocument.deleteMany({ where: { uploadedById: mentor.userId } }),
      prisma.teacherVerificationEvent.deleteMany({ where: { actorId: mentor.userId } }),
      prisma.teacherLeadActivity.deleteMany({ where: { authorId: mentor.userId } }),
      prisma.user.delete({ where: { id: mentor.userId } }),
    ]);

    await recordAuditLog({
      actorId: admin.id,
      action: "MENTOR_DELETED",
      resourceType: "MentorProfile",
      resourceId: id,
      metadata: { email: mentor.user.email, name: mentor.user.name },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
