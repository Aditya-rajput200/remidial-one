import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireRole, requireUser } from "@/lib/auth/rbac";
import { createBookingSchema } from "@/lib/validation/booking";
import { errorResponse } from "@/lib/api/respond";
import { recordAuditLog } from "@/lib/audit/log";
import { Prisma } from "@/lib/generated/prisma/client";

const bookingInclude = {
  subject: { select: { slug: true, name: true } },
  mentor: { select: { id: true, user: { select: { name: true } } } },
  student: { select: { id: true, user: { select: { name: true } } } },
} as const;

function toDto(booking: {
  id: string;
  scheduledAt: Date;
  durationMinutes: number;
  status: string;
  gradeLabel: string | null;
  studentNotes: string | null;
  subject: { slug: string; name: string };
  mentor: { id: string; user: { name: string } };
  student: { id: string; user: { name: string } };
}) {
  return {
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
  };
}

export async function GET() {
  try {
    const user = await requireUser();

    if (user.role === "STUDENT") {
      const studentProfile = await prisma.studentProfile.findUniqueOrThrow({ where: { userId: user.id } });
      const bookings = await prisma.booking.findMany({
        where: { studentId: studentProfile.id },
        include: bookingInclude,
        orderBy: { scheduledAt: "desc" },
      });
      return NextResponse.json({ bookings: bookings.map(toDto) });
    }

    if (user.role === "MENTOR") {
      const mentorProfile = await prisma.mentorProfile.findUniqueOrThrow({ where: { userId: user.id } });
      const bookings = await prisma.booking.findMany({
        where: { mentorId: mentorProfile.id },
        include: bookingInclude,
        orderBy: { scheduledAt: "desc" },
      });
      return NextResponse.json({ bookings: bookings.map(toDto) });
    }

    return NextResponse.json({ error: "Only students and mentors have bookings" }, { status: 403 });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole("STUDENT");
    const body = createBookingSchema.parse(await request.json());

    const studentProfile = await prisma.studentProfile.findUniqueOrThrow({ where: { userId: user.id } });

    const mentor = await prisma.mentorProfile.findFirst({
      where: { id: body.mentorId, status: "ACTIVE" },
      include: { subjects: { select: { id: true, slug: true } }, availability: true },
    });
    if (!mentor) {
      return NextResponse.json({ error: "Mentor not found or not currently accepting bookings" }, { status: 404 });
    }

    const subject = mentor.subjects.find((s) => s.slug === body.subjectSlug);
    if (!subject) {
      return NextResponse.json({ error: "This mentor does not teach that subject" }, { status: 400 });
    }

    // Best-effort availability check: only enforced once a mentor has set up
    // a weekly schedule (see app/api/mentors/me/availability). Both the
    // mentor's slots and the request are treated as the same wall-clock
    // convention as the existing (non-timezone-aware) availability picker —
    // proper per-mentor timezone handling is a follow-up, not a Phase 4 gap.
    if (mentor.availability.length > 0) {
      const dayOfWeek = body.scheduledAt.getUTCDay();
      const hour = body.scheduledAt.getUTCHours();
      const withinAvailability = mentor.availability.some(
        (slot) => slot.dayOfWeek === dayOfWeek && hour >= slot.startHour && hour < slot.endHour,
      );
      if (!withinAvailability) {
        return NextResponse.json({ error: "That time is outside the mentor's availability" }, { status: 400 });
      }
    }

    const booking = await prisma.booking.create({
      data: {
        studentId: studentProfile.id,
        mentorId: mentor.id,
        subjectId: subject.id,
        gradeLabel: body.gradeLabel,
        scheduledAt: body.scheduledAt,
        durationMinutes: body.durationMinutes,
        studentNotes: body.studentNotes,
      },
      include: bookingInclude,
    });

    await recordAuditLog({
      actorId: user.id,
      action: "BOOKING_CREATED",
      resourceType: "Booking",
      resourceId: booking.id,
      metadata: { mentorId: mentor.id, subjectSlug: body.subjectSlug },
    });

    return NextResponse.json({ booking: toDto(booking) }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "This time slot was just booked. Please choose another time." }, { status: 409 });
    }
    return errorResponse(error);
  }
}
