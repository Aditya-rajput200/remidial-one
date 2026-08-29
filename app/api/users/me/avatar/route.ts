import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/rbac";
import { errorResponse } from "@/lib/api/respond";
import { recordAuditLog } from "@/lib/audit/log";

const ALLOWED_CONTENT_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5MB — generous for a profile photo

export async function POST(request: NextRequest) {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        { error: "Photo upload isn't configured yet. Set BLOB_READ_WRITE_TOKEN." },
        { status: 503 },
      );
    }

    const user = await requireUser();

    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof Blob)) {
      return NextResponse.json({ error: "Malformed upload request" }, { status: 400 });
    }
    if (!ALLOWED_CONTENT_TYPES.has(file.type)) {
      return NextResponse.json({ error: "Please upload a PNG, JPEG, or WebP image" }, { status: 400 });
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: "Image is too large (5MB max)" }, { status: 400 });
    }

    const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const blob = await put(`avatars/${user.id}.${extension}`, file, {
      access: "public",
      contentType: file.type,
      addRandomSuffix: true,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    await prisma.user.update({ where: { id: user.id }, data: { avatarUrl: blob.url } });
    await recordAuditLog({ actorId: user.id, action: "AVATAR_UPDATED", resourceType: "User", resourceId: user.id });

    return NextResponse.json({ avatarUrl: blob.url });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE() {
  try {
    const user = await requireUser();
    await prisma.user.update({ where: { id: user.id }, data: { avatarUrl: null } });
    await recordAuditLog({ actorId: user.id, action: "AVATAR_REMOVED", resourceType: "User", resourceId: user.id });
    return NextResponse.json({ avatarUrl: null });
  } catch (error) {
    return errorResponse(error);
  }
}
