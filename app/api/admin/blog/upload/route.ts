import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { requirePermission } from "@/lib/auth/rbac";
import { errorResponse } from "@/lib/api/respond";

const ALLOWED_CONTENT_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5MB — generous for a blog cover/inline image

export async function POST(request: NextRequest) {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        { error: "Image upload isn't configured yet. Set BLOB_READ_WRITE_TOKEN." },
        { status: 503 },
      );
    }

    const user = await requirePermission("cms.update");

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
    const blob = await put(`blog/${user.id}-${Date.now()}.${extension}`, file, {
      access: "public",
      contentType: file.type,
      addRandomSuffix: true,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    return errorResponse(error);
  }
}
