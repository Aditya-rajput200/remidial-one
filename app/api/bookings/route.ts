import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireRole, requireUser } from "@/lib/auth/rbac";
import { errorResponse } from "@/lib/api/respond";

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
  mentorRating: number | null;
  mentorRatingNote: string | null;
  actualStartedAt: Date | null;
  actualEndedAt: Date | null;
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
    mentorRating: booking.mentorRating,
    mentorRatingNote: booking.mentorRatingNote,
    actualStartedAt: booking.actualStartedAt,
    actualEndedAt: booking.actualEndedAt,
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

// Student self-serve booking is disabled under the counselor-gated
// assignment model (see app/(marketing)/become-a-mentor + admin teacher
// assignment). Classes will be scheduled by an advisor/admin against a
// StudentSubjectRequirement in the Class Scheduling module; this route now
// only rejects direct student bookings. Kept (not deleted) so the Scheduling
// module can re-home the availability/overlap logic that used to live here.
export async function POST() {
  try {
    await requireRole("STUDENT");
    return NextResponse.json(
      { error: "Booking a mentor directly isn't available. An advisor will schedule your classes for you." },
      { status: 403 },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
