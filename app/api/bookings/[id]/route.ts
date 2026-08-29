import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/rbac";
import { ForbiddenError } from "@/lib/auth/errors";
import { errorResponse } from "@/lib/api/respond";
import { recordAuditLog } from "@/lib/audit/log";
import { loadAccessibleBooking } from "@/lib/bookings/access";
import { Prisma } from "@/lib/generated/prisma/client";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const { isModerator } = await loadAccessibleBooking(id, user);

    const booking = await prisma.booking.findUniqueOrThrow({
      where: { id },
      include: {
        subject: { select: { slug: true, name: true } },
        mentor: { select: { id: true, user: { select: { name: true } } } },
        student: { select: { id: true, user: { select: { name: true } } } },
      },
    });

    return NextResponse.json({
      booking: {
        id: booking.id,
        scheduledAt: booking.scheduledAt,
        durationMinutes: booking.durationMinutes,
        status: booking.status,
        gradeLabel: booking.gradeLabel,
        studentNotes: booking.studentNotes,
        subject: booking.subject,
        mentorId: booking.mentor.id,
        mentorName: booking.mentor.user.name,
        studentId: booking.student.id,
        studentName: booking.student.user.name,
        mentorRating: booking.mentorRating,
        mentorRatingNote: booking.mentorRatingNote,
        actualStartedAt: booking.actualStartedAt,
        actualEndedAt: booking.actualEndedAt,
      },
      isModerator,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

const patchSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("cancel"), reason: z.string().trim().max(500).optional() }),
  z.object({
    action: z.literal("reschedule"),
    scheduledAt: z.coerce.date().refine((d) => d.getTime() > Date.now(), { message: "scheduledAt must be in the future" }),
  }),
  z.object({ action: z.literal("complete") }),
  z.object({ action: z.literal("notes"), notes: z.string().trim().max(2000) }),
  z.object({ action: z.literal("rate"), rating: z.number().int().min(1).max(10), note: z.string().trim().max(500).optional() }),
]);

async function loadOwnedBooking(id: string, userId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { student: { select: { userId: true } }, mentor: { select: { userId: true } } },
  });
  if (!booking || (booking.student.userId !== userId && booking.mentor.userId !== userId)) {
    // Same response whether the booking doesn't exist or belongs to someone
    // else — don't confirm the existence of other users' bookings.
    throw new ForbiddenError("Booking not found");
  }
  return booking;
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const body = patchSchema.parse(await request.json());

    const booking = await loadOwnedBooking(id, user.id);

    if (body.action === "notes") {
      const updated = await prisma.booking.update({ where: { id }, data: { studentNotes: body.notes } });
      return NextResponse.json({ booking: { id: updated.id, studentNotes: updated.studentNotes } });
    }

    if (body.action === "rate") {
      if (booking.mentor.userId !== user.id) {
        throw new ForbiddenError("Only the assigned mentor can rate a session");
      }
      if (booking.status !== "COMPLETED") {
        return NextResponse.json({ error: "Only completed sessions can be rated" }, { status: 400 });
      }
      const updated = await prisma.booking.update({
        where: { id },
        data: { mentorRating: body.rating, mentorRatingNote: body.note ?? null, ratedAt: new Date() },
      });
      await recordAuditLog({
        actorId: user.id,
        action: "BOOKING_RATED",
        resourceType: "Booking",
        resourceId: id,
        metadata: { rating: body.rating },
      });
      return NextResponse.json({
        booking: { id: updated.id, mentorRating: updated.mentorRating, mentorRatingNote: updated.mentorRatingNote },
      });
    }

    if (booking.status === "CANCELLED" || booking.status === "COMPLETED") {
      return NextResponse.json({ error: `Cannot modify a ${booking.status.toLowerCase()} booking` }, { status: 400 });
    }

    if (body.action === "cancel") {
      const updated = await prisma.booking.update({
        where: { id },
        data: { status: "CANCELLED", cancelledById: user.id, cancelReason: body.reason },
      });
      await recordAuditLog({
        actorId: user.id,
        action: "BOOKING_CANCELLED",
        resourceType: "Booking",
        resourceId: id,
        metadata: { reason: body.reason },
      });
      return NextResponse.json({ booking: { id: updated.id, status: updated.status } });
    }

    if (body.action === "complete") {
      if (booking.mentor.userId !== user.id) {
        throw new ForbiddenError("Only the assigned mentor can mark a session complete");
      }
      const updated = await prisma.booking.update({ where: { id }, data: { status: "COMPLETED" } });
      await recordAuditLog({
        actorId: user.id,
        action: "BOOKING_COMPLETED",
        resourceType: "Booking",
        resourceId: id,
      });
      return NextResponse.json({ booking: { id: updated.id, status: updated.status } });
    }

    // reschedule
    const updated = await prisma.booking.update({
      where: { id },
      data: { scheduledAt: body.scheduledAt, status: "CONFIRMED" },
    });
    await recordAuditLog({
      actorId: user.id,
      action: "BOOKING_RESCHEDULED",
      resourceType: "Booking",
      resourceId: id,
      metadata: { scheduledAt: body.scheduledAt.toISOString() },
    });
    return NextResponse.json({ booking: { id: updated.id, status: updated.status, scheduledAt: updated.scheduledAt } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "This time slot was just booked. Please choose another time." }, { status: 409 });
    }
    return errorResponse(error);
  }
}
