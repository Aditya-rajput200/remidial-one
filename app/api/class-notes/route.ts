import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/rbac";
import { errorResponse } from "@/lib/api/respond";
import { classNoteInclude, toClassNoteDto } from "@/lib/classNotes/dto";

/** Lists AI class notes visible to the current user: generated for their
 * own bookings (student) or bookings they teach (mentor) — same shape as
 * GET /api/notes, for ClassNotesPanel to consume the same way NotesPanel
 * consumes /api/notes. */
export async function GET() {
  try {
    const user = await requireUser();

    if (user.role === "STUDENT") {
      const studentProfile = await prisma.studentProfile.findUniqueOrThrow({ where: { userId: user.id } });
      const classNotes = await prisma.classNote.findMany({
        where: { booking: { studentId: studentProfile.id } },
        include: classNoteInclude,
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ classNotes: classNotes.map(toClassNoteDto) });
    }

    if (user.role === "MENTOR") {
      const mentorProfile = await prisma.mentorProfile.findUniqueOrThrow({ where: { userId: user.id } });
      const classNotes = await prisma.classNote.findMany({
        where: { booking: { mentorId: mentorProfile.id } },
        include: classNoteInclude,
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ classNotes: classNotes.map(toClassNoteDto) });
    }

    return NextResponse.json({ error: "Only students and mentors have class notes" }, { status: 403 });
  } catch (error) {
    return errorResponse(error);
  }
}
