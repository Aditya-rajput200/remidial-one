import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/rbac";
import { ForbiddenError } from "@/lib/auth/errors";
import { errorResponse } from "@/lib/api/respond";
import { recordAuditLog } from "@/lib/audit/log";
import { loadAccessibleBooking } from "@/lib/bookings/access";
import { generateClassNotes } from "@/lib/ai/nvidia";
import { classNoteInclude, toClassNoteDto } from "@/lib/classNotes/dto";

// Base64 inflates size ~1.37x — this caps the encoded string around an 8MB
// source image, matching the cap validateNoteFile uses for uploaded files.
const MAX_DATA_URL_LENGTH = 11_000_000;

const postSchema = z.object({
  imageDataUrl: z
    .string()
    .startsWith("data:image/png;base64,", "Expected a PNG data URL")
    .max(MAX_DATA_URL_LENGTH, "Snapshot image is too large"),
});

/** Fetches the one AI class note for a booking, if generated. */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    await loadAccessibleBooking(id, user);

    const classNote = await prisma.classNote.findUnique({
      where: { bookingId: id },
      include: classNoteInclude,
    });

    return NextResponse.json({ classNote: classNote ? toClassNoteDto(classNote) : null });
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * Mentor-only: turns a whiteboard snapshot into AI class notes for this
 * booking. Uploads the snapshot to Vercel Blob (same server-side proxy
 * pattern as app/api/notes/route.ts), calls generateClassNotes(), then
 * upserts — regenerating replaces the previous note, it isn't versioned.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const { booking } = await loadAccessibleBooking(id, user);
    if (booking.mentor.userId !== user.id) {
      throw new ForbiddenError("Only the assigned mentor can generate class notes for this session");
    }

    const body = postSchema.parse(await request.json());

    const fullBooking = await prisma.booking.findUniqueOrThrow({
      where: { id },
      select: {
        scheduledAt: true,
        subject: { select: { name: true } },
        mentor: { select: { user: { select: { name: true } } } },
        student: { select: { user: { select: { name: true } } } },
      },
    });

    let snapshotImageUrl: string | null = null;
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const base64 = body.imageDataUrl.slice(body.imageDataUrl.indexOf(",") + 1);
      const buffer = Buffer.from(base64, "base64");
      const blob = await put(`class-notes/${id}/snapshot.png`, buffer, {
        access: "public",
        contentType: "image/png",
        addRandomSuffix: true,
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
      snapshotImageUrl = blob.url;
    }

    const result = await generateClassNotes({
      imageDataUrl: body.imageDataUrl,
      subjectName: fullBooking.subject.name,
      mentorName: fullBooking.mentor.user.name,
      studentName: fullBooking.student.user.name,
      scheduledAt: fullBooking.scheduledAt.toISOString(),
    });

    if (!result.ok) {
      const message =
        result.reason === "not_configured"
          ? "AI class notes aren't configured yet. Set NVIDIA_API_KEY."
          : "Could not generate class notes right now. Please try again.";
      return NextResponse.json({ error: message }, { status: result.reason === "not_configured" ? 503 : 502 });
    }

    const classNote = await prisma.classNote.upsert({
      where: { bookingId: id },
      create: {
        bookingId: id,
        generatedById: user.id,
        content: result.content,
        snapshotImageUrl,
        model: result.model,
      },
      update: {
        generatedById: user.id,
        content: result.content,
        snapshotImageUrl,
        model: result.model,
      },
      include: classNoteInclude,
    });

    await recordAuditLog({
      actorId: user.id,
      action: "CLASS_NOTES_GENERATED",
      resourceType: "ClassNote",
      resourceId: classNote.id,
      metadata: { bookingId: id },
    });

    return NextResponse.json({ classNote: toClassNoteDto(classNote) }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
