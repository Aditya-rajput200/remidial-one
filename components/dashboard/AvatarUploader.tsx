"use client";

import { useRef, useState } from "react";
import { Camera, Loader2, X } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { useSession } from "@/lib/auth/SessionProvider";

const ACCEPTED_TYPES = "image/png,image/jpeg,image/webp";

export function AvatarUploader({
  avatarUrl,
  name,
  onChange,
}: {
  avatarUrl: string | null;
  name: string;
  onChange: (avatarUrl: string | null) => void;
}) {
  const { refreshSession } = useSession();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(file: File) {
    setBusy(true);
    setError("");
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch("/api/users/me/avatar", { method: "POST", body: formData });
    const body = await response.json().catch(() => ({}));
    setBusy(false);
    if (!response.ok) {
      setError(body?.error ?? "Could not upload photo. Please try again.");
      return;
    }
    onChange(body.avatarUrl);
    await refreshSession();
  }

  async function handleRemove() {
    setBusy(true);
    setError("");
    const response = await fetch("/api/users/me/avatar", { method: "DELETE" });
    setBusy(false);
    if (!response.ok) {
      setError("Could not remove photo. Please try again.");
      return;
    }
    onChange(null);
    await refreshSession();
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <Avatar src={avatarUrl} alt={name} size="lg" />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          aria-label="Change photo"
          className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-ink text-white shadow-card transition-colors duration-150 hover:bg-ink-soft disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Camera className="h-4 w-4" aria-hidden />}
        </button>
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
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-ink">Profile photo</p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="text-sm font-semibold text-ink underline underline-offset-4"
          >
            Upload photo
          </button>
          {avatarUrl ? (
            <button
              type="button"
              onClick={handleRemove}
              disabled={busy}
              className="inline-flex items-center gap-1 text-sm text-muted hover:text-error"
            >
              <X className="h-3.5 w-3.5" aria-hidden />
              Remove
            </button>
          ) : null}
        </div>
        {error ? <p className="text-xs font-medium text-error">{error}</p> : null}
      </div>
    </div>
  );
}
