"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImageUp, Loader2, X } from "lucide-react";

const ACCEPTED_TYPES = "image/png,image/jpeg,image/webp";

export function BlogCoverUploader({
  coverImageUrl,
  onChange,
}: {
  coverImageUrl: string | null;
  onChange: (url: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(file: File) {
    setBusy(true);
    setError("");
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch("/api/admin/blog/upload", { method: "POST", body: formData });
    const body = await response.json().catch(() => ({}));
    setBusy(false);
    if (!response.ok) {
      setError(body?.error ?? "Could not upload image. Please try again.");
      return;
    }
    onChange(body.url);
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-ink">Cover image</label>
      <div className="relative flex h-44 w-full items-center justify-center overflow-hidden rounded-2xl border border-dashed border-border-strong bg-surface">
        {coverImageUrl ? (
          <>
            <Image src={coverImageUrl} alt="" fill className="object-cover" />
            <button
              type="button"
              onClick={() => onChange(null)}
              aria-label="Remove cover image"
              className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-ink/70 text-white transition-colors hover:bg-ink"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="flex flex-col items-center gap-2 text-muted transition-colors hover:text-ink disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-6 w-6 animate-spin" aria-hidden /> : <ImageUp className="h-6 w-6" aria-hidden />}
            <span className="text-sm font-medium">Upload cover image</span>
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES}
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file) handleFile(file);
          }}
        />
      </div>
      {error ? <p className="text-xs font-medium text-error">{error}</p> : null}
    </div>
  );
}
