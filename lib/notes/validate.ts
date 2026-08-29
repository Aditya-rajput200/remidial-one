export const ALLOWED_NOTE_TYPES = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
]);

export const MAX_NOTE_BYTES = 20 * 1024 * 1024; // 20MB — generous for a scanned worksheet or slide deck

export type NoteFileValidation = { ok: true } | { ok: false; error: string };

/** Pure validation for an uploaded note file — checked before it ever reaches Blob storage. */
export function validateNoteFile(file: { type: string; size: number }): NoteFileValidation {
  if (!ALLOWED_NOTE_TYPES.has(file.type)) {
    return { ok: false, error: "Unsupported file type. Upload a PDF, image, text, Word, or PowerPoint file." };
  }
  if (file.size > MAX_NOTE_BYTES) {
    return { ok: false, error: "File is too large (20MB max)." };
  }
  if (file.size <= 0) {
    return { ok: false, error: "File is empty." };
  }
  return { ok: true };
}
