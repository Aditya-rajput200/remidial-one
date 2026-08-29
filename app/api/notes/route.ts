import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/db/prisma";
import { requireRole, requireUser } from "@/lib/auth/rbac";
import { ForbiddenError } from "@/lib/auth/errors";
import { errorResponse } from "@/lib/api/respond";
import { recordAuditLog } from "@/lib/audit/log";
import { loadAccessibleBooking } from "@/lib/bookings/access";
import { validateNoteFile } from "@/lib/notes/validate";
import { sendEmail } from "@/lib/email/send";
import { noteSharedEmail } from "@/lib/email/templates";

const noteInclude = {
  uploadedBy: { select: { name: true } },
  booking: {
    select: {
      subject: { select: { name: true } },
      mentor: { select: { userId: true, user: { select: { name: true } } } },
      student: { select: { userId: true, user: { select: { name: true, email: true } } } },
    },
  },
} as const;

function toDto(note: {
  id: string;
  title: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  createdAt: Date;
  bookingId: string;
  uploadedById: string;
  uploadedBy: { name: string };
  booking: {
    subject: { name: string };
    mentor: { userId: string; user: { name: string } };
    student: { userId: string; user: { name: string; email: string } };
  };
}) {
  return {
    id: note.id,
    title: note.title,
    fileUrl: note.fileUrl,
    fileName: note.fileName,
    fileSize: note.fileSize,
    mimeType: note.mimeType,
    createdAt: note.createdAt,
    bookingId: note.bookingId,
    uploadedById: note.uploadedById,
    uploadedByName: note.uploadedBy.name,
    subjectName: note.booking.subject.name,
    mentorName: note.booking.mentor.user.name,
    studentName: note.booking.student.user.name,
  };
}

/** Lists notes visible to the current user: uploaded by them (mentor) or shared with them (student). */
export async function GET() {
  try {
    const user = await requireUser();

    if (user.role === "STUDENT") {
      const studentProfile = await prisma.studentProfile.findUniqueOrThrow({ where: { userId: user.id } });
      const notes = await prisma.note.findMany({
        where: { booking: { studentId: studentProfile.id } },
        include: noteInclude,
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ notes: notes.map(toDto) });
    }

    if (user.role === "MENTOR") {
      const mentorProfile = await prisma.mentorProfile.findUniqueOrThrow({ where: { userId: user.id } });
      const notes = await prisma.note.findMany({
        where: { booking: { mentorId: mentorProfile.id } },
        include: noteInclude,
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ notes: notes.map(toDto) });
    }

    return NextResponse.json({ error: "Only students and mentors have notes" }, { status: 403 });
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * Mentor uploads a note file for one of their bookings. Proxies bytes
 * through our server to Vercel Blob (same reasoning as
 * app/api/whiteboard-uploads/route.ts — the browser-direct-upload flow
 * can't satisfy CORS in local dev), then creates the Note row and emails
 * the student a "note shared" notification (best-effort).
 */
export async function POST(request: NextRequest) {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json({ error: "File upload isn't configured yet. Set BLOB_READ_WRITE_TOKEN." }, { status: 503 });
    }

    const user = await requireRole("MENTOR");

    const formData = await request.formData();
    const file = formData.get("file");
    const bookingId = formData.get("bookingId");
    const title = formData.get("title");

    if (!(file instanceof Blob) || typeof bookingId !== "string" || !bookingId || typeof title !== "string" || !title.trim()) {
      return NextResponse.json({ error: "Malformed upload request" }, { status: 400 });
    }

    const { booking } = await loadAccessibleBooking(bookingId, user);
    if (booking.mentor.userId !== user.id) {
      throw new ForbiddenError("Only the assigned mentor can upload notes for this session");
    }

    const validation = validateNoteFile({ type: file.type, size: file.size });
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const filenameField = formData.get("filename");
    const filename = sanitizeFilename(typeof filenameField === "string" ? filenameField : "note");
    const blob = await put(`notes/${bookingId}/${filename}`, file, {
      access: "public",
      contentType: file.type,
      addRandomSuffix: true,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    const note = await prisma.note.create({
      data: {
        bookingId,
        uploadedById: user.id,
        title: title.trim(),
        fileUrl: blob.url,
        fileName: filename,
        fileSize: file.size,
        mimeType: file.type,
      },
      include: noteInclude,
    });

    await recordAuditLog({
      actorId: user.id,
      action: "NOTE_UPLOADED",
      resourceType: "Note",
      resourceId: note.id,
      metadata: { bookingId },
    });

    const { subject, html } = noteSharedEmail({
      studentName: note.booking.student.user.name,
      mentorName: note.uploadedBy.name,
      subjectName: note.booking.subject.name,
      noteTitle: note.title,
      downloadUrl: note.fileUrl,
    });
    await sendEmail({ to: note.booking.student.user.email, subject, html });

    return NextResponse.json({ note: toDto(note) }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, "-").slice(0, 100) || "note";
}
