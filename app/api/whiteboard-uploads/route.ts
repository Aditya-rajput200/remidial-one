import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { requireUser } from "@/lib/auth/rbac";
import { errorResponse } from "@/lib/api/respond";
import { ForbiddenError } from "@/lib/auth/errors";
import { loadAccessibleWhiteboard } from "@/lib/whiteboard/access";

const ALLOWED_CONTENT_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10MB — generous for a rendered PDF page or a photo

/**
 * Uploads a whiteboard image/PDF-page render to Vercel Blob and returns its
 * URL. This proxies the bytes through our own server (rather than the
 * @vercel/blob/client browser-direct-upload flow) because that client path
 * now signs uploads via a request to vercel.com from the browser, which
 * local (non-Vercel-hosted) dev has no way to satisfy CORS for — a server-
 * side `put()` call has no such restriction. No DB write happens here; the
 * client sends a normal OBJECT_CREATE (type IMAGE) op over the whiteboard
 * WS once it has the URL, keeping "every board mutation flows through WS"
 * intact.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        { error: "Image upload isn't configured yet. Set BLOB_READ_WRITE_TOKEN." },
        { status: 503 },
      );
    }

    const user = await requireUser();

    const formData = await request.formData();
    const file = formData.get("file");
    const bookingId = formData.get("bookingId");
    const filenameField = formData.get("filename");

    if (!(file instanceof Blob) || typeof bookingId !== "string" || !bookingId) {
      return NextResponse.json({ error: "Malformed upload request" }, { status: 400 });
    }

    const { whiteboard, permission } = await loadAccessibleWhiteboard(bookingId, user);
    if (permission === "VIEW_ONLY") {
      throw new ForbiddenError("You do not have permission to add images to this board");
    }

    if (!ALLOWED_CONTENT_TYPES.has(file.type)) {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: "File is too large (10MB max)" }, { status: 400 });
    }

    const filename = sanitizeFilename(typeof filenameField === "string" ? filenameField : "upload.png");
    const blob = await put(`whiteboards/${whiteboard.id}/${filename}`, file, {
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

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, "-").slice(0, 100) || "upload.png";
}
