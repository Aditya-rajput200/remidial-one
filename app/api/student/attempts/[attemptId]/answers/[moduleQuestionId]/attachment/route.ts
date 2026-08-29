import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { ForbiddenError } from "@/lib/auth/errors";
import { errorResponse } from "@/lib/api/respond";
import { requireOwnAttempt } from "@/lib/assessment/access";
import { validateNoteFile } from "@/lib/notes/validate";

/**
 * Uploads a handwritten/photographed answer image (spec §8/§21) for an
 * IMAGE_ANSWER question. Same server-proxied-to-Blob pattern as
 * app/api/notes/route.ts (browser-direct upload can't satisfy CORS in local
 * dev). Ensures the underlying StudentAnswer/StudentQuestionAttempt exist so
 * an image-only answer still shows up as ANSWERED on the palette.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ attemptId: string; moduleQuestionId: string }> },
) {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json({ error: "File upload isn't configured yet. Set BLOB_READ_WRITE_TOKEN." }, { status: 503 });
    }

    const user = await requireRole("STUDENT");
    const { attemptId, moduleQuestionId } = await params;
    const attempt = await requireOwnAttempt(attemptId, user);
    if (attempt.status !== "IN_PROGRESS") throw new ForbiddenError("This attempt is no longer in progress");

    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof Blob)) {
      return NextResponse.json({ error: "Malformed upload request" }, { status: 400 });
    }

    const validation = validateNoteFile({ type: file.type, size: file.size });
    if (!validation.ok) return NextResponse.json({ error: validation.error }, { status: 400 });

    const qa = await prisma.studentQuestionAttempt.findUniqueOrThrow({
      where: { studentAssessmentId_moduleQuestionId: { studentAssessmentId: attemptId, moduleQuestionId } },
    });

    const blob = await put(`answer-attachments/${attemptId}/${moduleQuestionId}/${Date.now()}`, file, {
      access: "public",
      contentType: file.type,
      addRandomSuffix: true,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    const answer = await prisma.studentAnswer.upsert({
      where: { questionAttemptId: qa.id },
      update: {},
      create: { questionAttemptId: qa.id, response: { note: "" } },
    });

    const fileName = file instanceof File ? file.name : "answer";
    const attachment = await prisma.answerAttachment.create({
      data: { answerId: answer.id, fileUrl: blob.url, fileName: fileName || "answer", fileSize: file.size, mimeType: file.type },
    });

    const nextState = qa.state === "MARKED_FOR_REVIEW" || qa.state === "ANSWERED_MARKED" ? "ANSWERED_MARKED" : "ANSWERED";
    await prisma.studentQuestionAttempt.update({
      where: { id: qa.id },
      data: { state: nextState, firstAnsweredAt: qa.firstAnsweredAt ?? new Date(), lastAnsweredAt: new Date() },
    });

    return NextResponse.json({ attachment }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
