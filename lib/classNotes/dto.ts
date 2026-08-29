import "server-only";

export const classNoteInclude = {
  generatedBy: { select: { name: true } },
  booking: {
    select: {
      scheduledAt: true,
      subject: { select: { name: true } },
      mentor: { select: { userId: true, user: { select: { name: true } } } },
      student: { select: { userId: true, user: { select: { name: true } } } },
    },
  },
} as const;

export function toClassNoteDto(note: {
  id: string;
  bookingId: string;
  content: string;
  snapshotImageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  generatedById: string;
  generatedBy: { name: string };
  booking: {
    scheduledAt: Date;
    subject: { name: string };
    mentor: { userId: string; user: { name: string } };
    student: { userId: string; user: { name: string } };
  };
}) {
  return {
    id: note.id,
    bookingId: note.bookingId,
    content: note.content,
    snapshotImageUrl: note.snapshotImageUrl,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
    generatedById: note.generatedById,
    generatedByName: note.generatedBy.name,
    scheduledAt: note.booking.scheduledAt,
    subjectName: note.booking.subject.name,
    mentorName: note.booking.mentor.user.name,
    studentName: note.booking.student.user.name,
  };
}
