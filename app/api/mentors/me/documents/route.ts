import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { errorResponse } from "@/lib/api/respond";
import { recordAuditLog } from "@/lib/audit/log";
import { TEACHER_DOCUMENT_TYPES, validateTeacherDocumentFile } from "@/lib/validation/teacher";
import type { TeacherDocumentType } from "@/lib/generated/prisma/enums";

function docDto(mentorProfileId: string, d: {
  id: string;
  type: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  createdAt: Date;
  verifiedAt: Date | null;
}) {
  return {
    id: d.id,
    type: d.type,
    fileName: d.fileName,
    fileSize: d.fileSize,
    mimeType: d.mimeType,
    createdAt: d.createdAt,
    verifiedAt: d.verifiedAt,
    downloadUrl: `/api/teacher-onboarding/${mentorProfileId}/documents/${d.id}/download`,
  };
}

export async function GET() {
  try {
    const user = await requireRole("MENTOR");
    const profile = await prisma.mentorProfile.findUnique({
      where: { userId: user.id },
      select: { id: true, documents: { orderBy: { createdAt: "desc" } } },
    });
    if (!profile) return NextResponse.json({ error: "Mentor profile not found" }, { status: 404 });
    return NextResponse.json({ documents: profile.documents.map((d) => docDto(profile.id, d)) });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json({ error: "File upload isn't configured yet. Set BLOB_READ_WRITE_TOKEN." }, { status: 503 });
    }
    const user = await requireRole("MENTOR");
    const profile = await prisma.mentorProfile.findUnique({ where: { userId: user.id }, select: { id: true, status: true } });
    if (!profile) return NextResponse.json({ error: "Mentor profile not found" }, { status: 404 });

    const formData = await request.formData();
    const file = formData.get("file");
    const type = formData.get("type");

    if (!(file instanceof Blob) || typeof type !== "string" || !TEACHER_DOCUMENT_TYPES.includes(type as never)) {
      return NextResponse.json({ error: "Malformed upload request" }, { status: 400 });
    }

    const validation = validateTeacherDocumentFile({ type: file.type, size: file.size });
    if (!validation.ok) return NextResponse.json({ error: validation.error }, { status: 400 });

    const originalName = typeof formData.get("filename") === "string" ? (formData.get("filename") as string) : "document";
    const safeName = originalName.replace(/[^a-zA-Z0-9.\-_]/g, "-").slice(0, 100) || "document";

    // Stored blob URL is never returned to any client — downloads are proxied
    // through the authorized route. The random suffix keeps the URL unguessable.
    const blob = await put(`teacher-docs/${profile.id}/${type}-${safeName}`, file, {
      access: "public",
      contentType: file.type,
      addRandomSuffix: true,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    const doc = await prisma.teacherDocument.create({
      data: {
        mentorProfileId: profile.id,
        type: type as TeacherDocumentType,
        blobPathname: blob.url,
        fileName: safeName,
        fileSize: file.size,
        mimeType: file.type,
        uploadedById: user.id,
      },
    });

    await recordAuditLog({
      actorId: user.id,
      action: "TEACHER_DOCUMENT_UPLOADED",
      resourceType: "MentorProfile",
      resourceId: profile.id,
      metadata: { documentId: doc.id, type },
    });

    return NextResponse.json({ document: docDto(profile.id, doc) }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
