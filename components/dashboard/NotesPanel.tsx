"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Download, FolderOpen, Trash2, Upload } from "lucide-react";
import { useSession } from "@/lib/auth/SessionProvider";
import { fetchBookings, type BookingDto } from "@/lib/data/bookingAdapter";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { FormField } from "@/components/ui/FormField";

type NoteDto = {
  id: string;
  title: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
  bookingId: string;
  uploadedById: string;
  uploadedByName: string;
  subjectName: string;
  mentorName: string;
  studentName: string;
};

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

/**
 * Real, DB-backed notes shared on a specific booking — see app/api/notes.
 * Rendered above the still-mock video/assignment resource list on the
 * mentor/student Resources pages (see lib/data/useMentorData.ts).
 */
export function NotesPanel() {
  const { session } = useSession();
  const isMentor = session?.role === "mentor";

  const [notes, setNotes] = useState<NoteDto[] | null>(null);
  const [bookings, setBookings] = useState<BookingDto[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const refetch = useCallback(async () => {
    const response = await fetch("/api/notes");
    if (!response.ok) return;
    const body = await response.json();
    setNotes(body.notes as NoteDto[]);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const response = await fetch("/api/notes");
      if (cancelled || !response.ok) return;
      const body = await response.json();
      setNotes(body.notes as NoteDto[]);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isMentor) return;
    let cancelled = false;
    (async () => {
      const all = await fetchBookings();
      if (cancelled) return;
      setBookings(all.filter((b) => b.status !== "CANCELLED" && b.status !== "NO_SHOW"));
    })();
    return () => {
      cancelled = true;
    };
  }, [isMentor]);

  async function handleUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const file = formData.get("file");

    if (!formData.get("bookingId") || !String(formData.get("title") ?? "").trim() || !(file instanceof File) || file.size === 0) {
      setError("Choose a session, title, and file.");
      return;
    }
    formData.set("filename", file.name);

    setSubmitting(true);
    setError("");
    const response = await fetch("/api/notes", { method: "POST", body: formData });
    setSubmitting(false);

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      setError(body?.error ?? "Could not upload note.");
      return;
    }
    form.reset();
    setShowForm(false);
    await refetch();
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this note? Students will no longer be able to download it.")) return;
    const response = await fetch(`/api/notes/${id}`, { method: "DELETE" });
    if (response.ok) await refetch();
  }

  if (notes === null) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Shared Notes</h2>
        {isMentor ? (
          <Button size="sm" variant="primary-black" className="gap-1.5" onClick={() => setShowForm((v) => !v)}>
            <Upload className="h-4 w-4" aria-hidden />
            Upload Note
          </Button>
        ) : null}
      </div>

      {showForm ? (
        <form onSubmit={handleUpload} className="grid gap-4 rounded-2xl border border-border bg-white p-6 sm:grid-cols-2">
          <FormField label="Session" htmlFor="note-booking">
            <Select id="note-booking" name="bookingId" defaultValue="" required>
              <option value="" disabled>
                Select a session
              </option>
              {bookings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.subject.name} — {b.studentName} — {formatDate(b.scheduledAt)}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Title" htmlFor="note-title">
            <Input id="note-title" name="title" placeholder="e.g. Practice worksheet" required />
          </FormField>
          <div className="sm:col-span-2">
            <FormField label="File" htmlFor="note-file" hint="PDF, image, text, Word, or PowerPoint — up to 20MB">
              <input id="note-file" name="file" type="file" required className="block w-full text-sm text-ink" />
            </FormField>
          </div>
          <div className="flex items-center gap-3 sm:col-span-2">
            <Button type="submit" variant="primary-lime" size="sm" disabled={submitting}>
              {submitting ? "Uploading…" : "Share Note"}
            </Button>
            {error ? <p className="text-xs font-medium text-error">{error}</p> : null}
          </div>
        </form>
      ) : null}

      {notes.length > 0 ? (
        <div className="flex flex-col divide-y divide-border rounded-2xl border border-border bg-white">
          {notes.map((note) => (
            <div key={note.id} className="flex items-center gap-4 p-4 sm:p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-lime-soft text-ink">
                <FolderOpen className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink">{note.title}</p>
                <p className="text-xs text-muted">
                  {note.subjectName} · {isMentor ? note.studentName : note.mentorName} · {formatDate(note.createdAt)} ·{" "}
                  {formatSize(note.fileSize)}
                </p>
              </div>
              <a
                href={note.fileUrl}
                download={note.fileName}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-border px-3 text-xs font-semibold text-ink hover:border-ink/40"
              >
                <Download className="h-3.5 w-3.5" aria-hidden />
                Download
              </a>
              {isMentor && session?.id === note.uploadedById ? (
                <button
                  type="button"
                  onClick={() => handleDelete(note.id)}
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted hover:bg-error-soft hover:text-error"
                  aria-label="Delete note"
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                </button>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FolderOpen}
          title="No notes yet"
          description={
            isMentor
              ? "Upload notes and materials for your students after a session."
              : "Notes your mentor shares will appear here, ready to download."
          }
        />
      )}
    </div>
  );
}
