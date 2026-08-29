"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Presentation, WifiOff } from "lucide-react";
import clsx from "clsx";
import { useWhiteboardStore } from "./state/whiteboardStore";
import { flattenUndoable, type UndoableAction } from "./state/undoRedoStack";
import { useWhiteboardSocket } from "./useWhiteboardSocket";
import { BoardStage, type BoardStageHandle } from "./canvas/BoardStage";
import { Toolbar } from "./Toolbar";
import { insertFilesOntoBoard } from "./upload/insertFilesOntoBoard";
import type { WhiteboardOperationType } from "@/lib/whiteboard/protocol";
import type { WhiteboardTool } from "./state/whiteboardStore";

type Props = {
  bookingId: string;
  /** Whether the ROOM page currently has this panel in view (vs. the video
   * call) — the panel itself is always mounted regardless (see
   * app/session/[id]/room/page.tsx), so this is purely a "did the local
   * user just switch over to it" signal for the peer-notification ping. */
  active?: boolean;
};

const SHORTCUT_TOOLS: Record<string, WhiteboardTool> = {
  v: "select",
  h: "pan",
  p: "pen",
  g: "highlighter", // "h" is taken by pan above; g(lowlighter) keeps a one-key shortcut without clashing
  e: "eraser",
  r: "rectangle",
  l: "line",
  k: "laser", // matches Excalidraw's own laser-pointer shortcut
};

export function WhiteboardPanel({ bookingId, active = true }: Props) {
  const {
    status,
    userId,
    permission,
    isMentor,
    isLocked,
    activePageId,
    errorMessage,
    sendOp,
    sendLaser,
    sendViewport,
    sendBoardOpen,
  } = useWhiteboardSocket(bookingId);
  const setTool = useWhiteboardStore((s) => s.setTool);
  const selectedIds = useWhiteboardStore((s) => s.selectedIds);
  const deleteSelectedLocal = useWhiteboardStore((s) => s.deleteSelectedLocal);
  const createObjectLocal = useWhiteboardStore((s) => s.createObjectLocal);
  const undo = useWhiteboardStore((s) => s.undo);
  const redo = useWhiteboardStore((s) => s.redo);
  const presenterId = useWhiteboardStore((s) => s.presenterId);
  const presenterIsMentor = useWhiteboardStore((s) => s.presenterIsMentor);
  const isFollowingPresenter = useWhiteboardStore((s) => s.isFollowingPresenter);
  const setFollowingPresenter = useWhiteboardStore((s) => s.setFollowingPresenter);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const boardStageRef = useRef<BoardStageHandle | null>(null);
  const [isInserting, setIsInserting] = useState(false);
  const [insertError, setInsertError] = useState<string | null>(null);
  const [isGeneratingNotes, setIsGeneratingNotes] = useState(false);
  const [notesMessage, setNotesMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  // Raw toggle vs. the effective value below: a dropped/reconnecting socket
  // can't relay a "stop presenting", so the effective flag folds in
  // `status` too — computed at render time rather than synced back into
  // state via an effect (BoardStage's own effect only sends the stop signal
  // on an isPresenting transition, not on socket loss, so this is what
  // actually clears the toolbar/badge when the connection drops).
  const [isPresentingRaw, setIsPresentingRaw] = useState(false);
  const isPresenting = isPresentingRaw && status === "open";

  // Pings the other participant the moment THIS client switches its own
  // view over to the board (active: false -> true) — a network send inside
  // a ref-tracked effect, not a setState call, so this doesn't trip the
  // set-state-in-effect rule the way syncing `active` into local state would.
  // Tracks "already sent for this activation" separately from `active`
  // itself: activating before the socket reaches "open" must NOT be marked
  // sent yet, or the real send (once status flips to "open" and this effect
  // re-runs) gets silently skipped forever for that activation.
  const hasSentForActivationRef = useRef(false);
  useEffect(() => {
    if (!active) {
      hasSentForActivationRef.current = false;
      return;
    }
    if (status !== "open" || hasSentForActivationRef.current) return;
    hasSentForActivationRef.current = true;
    sendBoardOpen();
  }, [active, status, sendBoardOpen]);

  const canEdit = permission !== null && permission !== "VIEW_ONLY" && !isLocked;

  const handleTogglePresent = useCallback(() => {
    if (!canEdit) return;
    setIsPresentingRaw((current) => !current);
  }, [canEdit]);

  const handleInsertClick = useCallback(() => {
    if (!canEdit) return;
    fileInputRef.current?.click();
  }, [canEdit]);

  const handleFilesSelected = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      // event.target.files is a LIVE FileList tied to the input element —
      // snapshot it into a plain array before resetting .value, which
      // clears that same live list out from under us if read afterward.
      const files = event.target.files ? Array.from(event.target.files) : [];
      event.target.value = ""; // allow re-selecting the same file later
      if (files.length === 0 || !activePageId) return;

      setInsertError(null);
      setIsInserting(true);
      try {
        await insertFilesOntoBoard(files, { bookingId, pageId: activePageId, createObjectLocal, sendOp });
      } catch (error) {
        setInsertError(error instanceof Error ? error.message : "Could not add that file to the board.");
      } finally {
        setIsInserting(false);
      }
    },
    [bookingId, activePageId, createObjectLocal, sendOp],
  );

  const sendUndoRedoOp = useCallback(
    (action: UndoableAction) => {
      // Wire protocol has no batch op — a batched undo/redo just fans out to
      // one message per sub-action; only the LOCAL undo stack treats a BATCH
      // as one step. Flatten first instead of recursing into this same
      // callback (a self-reference here would read a stale closure).
      const leaves = flattenUndoable(action);
      for (const leaf of leaves) {
        if (leaf.kind === "CREATE") {
          sendOp("OBJECT_CREATE" satisfies WhiteboardOperationType, activePageId, {
            id: leaf.object.id,
            type: leaf.object.type,
            x: leaf.object.x,
            y: leaf.object.y,
            width: leaf.object.width,
            height: leaf.object.height,
            rotation: leaf.object.rotation,
            zIndex: leaf.object.zIndex,
            data: leaf.object.data,
          });
        } else if (leaf.kind === "DELETE") {
          sendOp("OBJECT_DELETE" satisfies WhiteboardOperationType, activePageId, { id: leaf.object.id });
        } else {
          const type = useWhiteboardStore.getState().objects[leaf.id]?.type;
          if (!type) continue;
          sendOp("OBJECT_UPDATE" satisfies WhiteboardOperationType, activePageId, { id: leaf.id, type, changes: leaf.after });
        }
      }
    },
    [sendOp, activePageId],
  );

  const handleGenerateNotes = useCallback(async () => {
    const snapshot = boardStageRef.current?.getSnapshot();
    if (!snapshot) {
      setNotesMessage({ tone: "error", text: "Could not capture the board — try again in a moment." });
      return;
    }

    setNotesMessage(null);
    setIsGeneratingNotes(true);
    try {
      const response = await fetch(`/api/bookings/${bookingId}/class-notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageDataUrl: snapshot }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        setNotesMessage({ tone: "error", text: body?.error ?? "Could not generate class notes." });
        return;
      }
      setNotesMessage({ tone: "success", text: "Class notes generated — visible under Resources → Class Notes." });
    } catch {
      setNotesMessage({ tone: "error", text: "Could not generate class notes. Check your connection and try again." });
    } finally {
      setIsGeneratingNotes(false);
    }
  }, [bookingId]);

  const handleUndo = useCallback(() => {
    if (!canEdit) return;
    const applied = undo();
    if (applied) sendUndoRedoOp(applied);
  }, [canEdit, undo, sendUndoRedoOp]);

  const handleRedo = useCallback(() => {
    if (!canEdit) return;
    const applied = redo();
    if (applied) sendUndoRedoOp(applied);
  }, [canEdit, redo, sendUndoRedoOp]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA"].includes(target.tagName)) return;

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) handleRedo();
        else handleUndo();
        return;
      }

      if ((event.key === "Delete" || event.key === "Backspace") && selectedIds.length > 0 && canEdit) {
        event.preventDefault();
        const deleted = deleteSelectedLocal();
        for (const object of deleted) sendOp("OBJECT_DELETE", activePageId, { id: object.id });
        return;
      }

      const tool = SHORTCUT_TOOLS[event.key.toLowerCase()];
      if (tool && canEdit) setTool(tool);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [canEdit, selectedIds, activePageId, deleteSelectedLocal, sendOp, setTool, handleUndo, handleRedo]);

  return (
    // flex + flex-1 (not h-full) so this stretches inside its parent flex
    // column in app/session/[id]/room/page.tsx — a child sized only with
    // h-full/percentage never gets a definite height there (it has no
    // flex-grow, so it shrinks to auto/content, which is 0 here), the exact
    // failure mode already documented on that page's video wrapper.
    <div className="relative flex min-h-0 w-full flex-1 flex-col bg-white">
      <BoardStage
        ref={boardStageRef}
        pageId={activePageId}
        canEdit={canEdit}
        sendOp={sendOp}
        userId={userId}
        sendLaser={sendLaser}
        isPresenting={isPresenting}
        sendViewport={sendViewport}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,application/pdf"
        multiple
        onChange={handleFilesSelected}
        className="hidden"
      />

      {status !== "open" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/90 text-black/60">
          {status === "connecting" ? (
            <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
          ) : (
            <WifiOff className="h-6 w-6" aria-hidden />
          )}
          <span className="text-sm font-medium">
            {status === "connecting" ? "Connecting to whiteboard…" : (errorMessage ?? "Whiteboard disconnected")}
          </span>
        </div>
      )}

      <div className="pointer-events-none absolute left-3 top-3 z-20 flex flex-col items-start gap-2">
        {status === "open" && permission === "VIEW_ONLY" && (
          <span className="rounded-full bg-black/80 px-3 py-1 text-xs font-medium text-white">View only</span>
        )}
        {status === "open" && isLocked && permission !== null && permission !== "FULL_COLLABORATION" && (
          <span className="rounded-full bg-black/80 px-3 py-1 text-xs font-medium text-white">Board locked</span>
        )}
        {isPresenting && (
          <span className="flex items-center gap-1.5 rounded-full bg-[#C4EE40] px-3 py-1 text-xs font-medium text-black">
            <Presentation className="h-3 w-3" aria-hidden />
            You are presenting
          </span>
        )}
        {!isPresenting && presenterId && (
          <span className="pointer-events-auto flex items-center gap-1.5 rounded-full bg-black/80 py-1 pl-3 pr-1.5 text-xs font-medium text-white">
            <Presentation className="h-3 w-3 shrink-0" aria-hidden />
            {isFollowingPresenter
              ? `Following ${presenterIsMentor ? "mentor" : "student"}'s view`
              : `${presenterIsMentor ? "Mentor" : "Student"} is presenting`}
            <button
              type="button"
              onClick={() => setFollowingPresenter(!isFollowingPresenter)}
              className="rounded-full bg-white/15 px-2 py-0.5 font-semibold hover:bg-white/25"
            >
              {isFollowingPresenter ? "Stop following" : "Resume"}
            </button>
          </span>
        )}
        {isInserting && (
          <span className="flex items-center gap-1.5 rounded-full bg-black/80 px-3 py-1 text-xs font-medium text-white">
            <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
            Adding document…
          </span>
        )}
        {insertError && (
          <span className="pointer-events-auto rounded-full bg-red-600/90 px-3 py-1 text-xs font-medium text-white">
            {insertError}
          </span>
        )}
        {notesMessage && (
          <span
            className={clsx(
              "pointer-events-auto rounded-full px-3 py-1 text-xs font-medium text-white",
              notesMessage.tone === "success" ? "bg-[#7A9C1F]/90" : "bg-red-600/90",
            )}
          >
            {notesMessage.text}
          </span>
        )}
      </div>

      <Toolbar
        canEdit={canEdit}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onInsertFile={handleInsertClick}
        isMentor={isMentor}
        isGeneratingNotes={isGeneratingNotes}
        onGenerateNotes={handleGenerateNotes}
        isPresenting={isPresenting}
        onTogglePresent={handleTogglePresent}
      />
    </div>
  );
}
