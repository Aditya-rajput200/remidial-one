import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/db/prisma";
import { errorResponse } from "@/lib/api/respond";
import { recordAuditLog } from "@/lib/audit/log";
import { TEACHER_DOCUMENT_TYPES, validateTeacherDocumentFile } from "@/lib/validation/teacher";
import { resolveApplicationToken } from "@/lib/teacher/application-token";
import type { TeacherDocumentType } from "@/lib/generated/prisma/enums";

function docDto(d: { id: string; type: string; fileName: string; fileSize: number; mimeType: string; createdAt: Date; verifiedAt: Date | null }) {
  return {
    id: d.id,
    type: d.type,
    fileName: d.fileName,
    fileSize: d.fileSize,
    mimeType: d.mimeType,
    createdAt: d.createdAt,
    verifiedAt: d.verifiedAt,
  };
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const profile = await resolveApplicationToken(token, {
      documents: { orderBy: { createdAt: "desc" } },
    });
    if (!profile) return NextResponse.json({ error: "This application link is invalid or has expired" }, { status: 404 });
    return NextResponse.json({ documents: profile.documents.map(docDto) });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json({ error: "File upload isn't configured yet." }, { status: 503 });
    }
    const { token } = await params;
    const profile = await resolveApplicationToken(token, { user: { select: { id: true } } });
    if (!profile) return NextResponse.json({ error: "This application link is invalid or has expired" }, { status: 404 });

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
        uploadedById: profile.user.id,
      },
    });

    await recordAuditLog({
      actorId: profile.user.id,
      action: "TEACHER_DOCUMENT_UPLOADED",
      resourceType: "MentorProfile",
      resourceId: profile.id,
      metadata: { documentId: doc.id, type, via: "apply-link" },
    });

    return NextResponse.json({ document: docDto(doc) }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
