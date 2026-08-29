import { renderFileToPages } from "./renderFileToPages";
import { nextZIndex } from "../state/nextZIndex";
import type { WhiteboardObjectRecord } from "../state/undoRedoStack";
import type { ObjectCreatePayload, WhiteboardOperationType } from "@/lib/whiteboard/protocol";

const MAX_DISPLAY_WIDTH = 720; // caps how much board space one page occupies at insert time
const PAGE_GAP = 40; // vertical spacing between stacked pages of a multi-page PDF

export type InsertFilesContext = {
  bookingId: string;
  pageId: string;
  createObjectLocal: (object: WhiteboardObjectRecord) => void;
  sendOp: (opType: WhiteboardOperationType, pageId: string | null, payload: unknown) => void;
};

/**
 * Renders a file (PDF pages, or a single image) to one or more pages,
 * uploads each to Vercel Blob, and places them on the board as ordinary
 * IMAGE objects stacked vertically — pen/shape objects created afterward
 * naturally render on top via normal z-index ordering, so "draw over the
 * document" needs no special-casing.
 */
export async function insertFilesOntoBoard(files: FileList | File[], ctx: InsertFilesContext): Promise<void> {
  let offsetY = 40;

  for (const file of Array.from(files)) {
    const pages = await renderFileToPages(file);

    for (const page of pages) {
      const scale = page.width > MAX_DISPLAY_WIDTH ? MAX_DISPLAY_WIDTH / page.width : 1;
      const width = page.width * scale;
      const height = page.height * scale;

      const { url } = await uploadToBoard(ctx.bookingId, page.blob, `${sanitizeFilename(file.name)}.png`);

      const object: WhiteboardObjectRecord = {
        id: crypto.randomUUID(),
        type: "IMAGE",
        x: 40,
        y: offsetY,
        width,
        height,
        rotation: 0,
        zIndex: nextZIndex(),
        data: { src: url },
        createdById: "",
      };

      ctx.createObjectLocal(object);
      ctx.sendOp("OBJECT_CREATE", ctx.pageId, toCreatePayload(object));

      offsetY += height + PAGE_GAP;
    }
  }
}

/**
 * Posts the rendered page's bytes to our own upload route (which uploads
 * to Vercel Blob server-side — see the route's doc comment for why this
 * proxies through our server rather than uploading directly from the
 * browser).
 */
async function uploadToBoard(bookingId: string, blob: Blob, filename: string): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append("file", blob, filename);
  formData.append("bookingId", bookingId);
  formData.append("filename", filename);

  const response = await fetch("/api/whiteboard-uploads", { method: "POST", body: formData });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body?.error ?? "Could not upload the file.");
  return { url: body.url as string };
}

function toCreatePayload(object: WhiteboardObjectRecord): ObjectCreatePayload {
  return {
    id: object.id,
    type: object.type,
    x: object.x,
    y: object.y,
    width: object.width,
    height: object.height,
    rotation: object.rotation,
    zIndex: object.zIndex,
    data: object.data,
  };
}

function sanitizeFilename(name: string): string {
  return name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9-_]/g, "-").slice(0, 60) || "upload";
}
