import { describe, expect, it } from "vitest";
import { MAX_NOTE_BYTES, validateNoteFile } from "@/lib/notes/validate";

describe("validateNoteFile", () => {
  it("accepts an allowed type within the size limit", () => {
    expect(validateNoteFile({ type: "application/pdf", size: 1024 })).toEqual({ ok: true });
  });

  it("rejects an unsupported mime type", () => {
    const result = validateNoteFile({ type: "application/zip", size: 1024 });
    expect(result.ok).toBe(false);
  });

  it("rejects a file over the size limit", () => {
    const result = validateNoteFile({ type: "application/pdf", size: MAX_NOTE_BYTES + 1 });
    expect(result.ok).toBe(false);
  });

  it("accepts a file exactly at the size limit", () => {
    expect(validateNoteFile({ type: "application/pdf", size: MAX_NOTE_BYTES })).toEqual({ ok: true });
  });

  it("rejects an empty file", () => {
    const result = validateNoteFile({ type: "application/pdf", size: 0 });
    expect(result.ok).toBe(false);
  });
});
