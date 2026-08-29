"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { useSession } from "@/lib/auth/SessionProvider";
import { EmptyState } from "@/components/ui/EmptyState";

type ClassNoteDto = {
  id: string;
  bookingId: string;
  content: string;
  snapshotImageUrl: string | null;
  createdAt: string;
  generatedByName: string;
  scheduledAt: string;
  subjectName: string;
  mentorName: string;
  studentName: string;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

/**
 * Read-only list of AI-generated class notes (see app/api/class-notes) —
 * distinct from NotesPanel, which lists mentor-uploaded files. Generation
 * only happens from the live session whiteboard (mentor-only, manual
 * trigger); this panel just surfaces the results for revision.
 */
export function ClassNotesPanel() {
  const { session } = useSession();
  const isMentor = session?.role === "mentor";

  const [classNotes, setClassNotes] = useState<ClassNoteDto[] | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const response = await fetch("/api/class-notes");
      if (cancelled || !response.ok) return;
      const body = await response.json();
      setClassNotes(body.classNotes as ClassNoteDto[]);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (classNotes === null) return null;

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Class Notes</h2>

      {classNotes.length > 0 ? (
        <div className="flex flex-col divide-y divide-border rounded-2xl border border-border bg-white">
          {classNotes.map((note) => {
            const expanded = expandedId === note.id;
            return (
              <div key={note.id} className="p-4 sm:p-5">
                <button
                  type="button"
                  onClick={() => setExpandedId(expanded ? null : note.id)}
                  className="flex w-full items-center gap-4 text-left"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-lime-soft text-ink">
                    <Sparkles className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">{note.subjectName} — Class Notes</p>
                    <p className="text-xs text-muted">
                      {isMentor ? note.studentName : note.mentorName} · {formatDate(note.scheduledAt)}
                    </p>
                  </div>
                  {expanded ? (
                    <ChevronUp className="h-4 w-4 shrink-0 text-muted" aria-hidden />
                  ) : (
                    <ChevronDown className="h-4 w-4 shrink-0 text-muted" aria-hidden />
                  )}
                </button>

                {expanded ? (
                  <div className="mt-4 flex flex-col gap-4 border-t border-border pt-4">
                    {note.snapshotImageUrl ? (
                      <a href={note.snapshotImageUrl} target="_blank" rel="noreferrer" className="relative block h-64 w-full max-w-md">
                        <Image
                          src={note.snapshotImageUrl}
                          alt="Whiteboard snapshot this note was generated from"
                          fill
                          className="rounded-lg border border-border object-contain"
                        />
                      </a>
                    ) : null}
                    <div className="whitespace-pre-wrap text-sm leading-relaxed text-ink">{note.content}</div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Sparkles}
          title="No class notes yet"
          description={
            isMentor
              ? "Generate AI class notes from the whiteboard during a live session and they'll appear here."
              : "AI-generated notes from your classes will appear here for revision."
          }
        />
      )}
    </div>
  );
}
