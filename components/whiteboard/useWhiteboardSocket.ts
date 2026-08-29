"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useWhiteboardStore } from "./state/whiteboardStore";
import { useLaserStore } from "./state/laserStore";
import type { WhiteboardObjectRecord } from "./state/undoRedoStack";
import type {
  ClientMessage,
  ServerMessage,
  WhiteboardBackground,
  WhiteboardOperationType,
  WhiteboardPermissionLevel,
} from "@/lib/whiteboard/protocol";

export type WhiteboardPageSummary = {
  id: string;
  name: string;
  position: number;
  background: WhiteboardBackground;
};

type TicketResponse = {
  ticket: string;
  wsUrl: string;
  whiteboard: { id: string; isLocked: boolean; defaultPermission: WhiteboardPermissionLevel };
  pages: WhiteboardPageSummary[];
  permission: WhiteboardPermissionLevel;
  isModerator: boolean;
};

export type ConnectionStatus = "idle" | "connecting" | "open" | "closed" | "error";

/**
 * Owns the whiteboard's WebSocket lifecycle for one booking: mints a join
 * ticket, connects, applies incoming ops directly to the shared zustand
 * store, and exposes send helpers. Reconnects independently of LiveKit's
 * video connection — they're two separate real-time subsystems.
 */
export function useWhiteboardSocket(bookingId: string) {
  const upsertObjectLocal = useWhiteboardStore((s) => s.upsertObjectLocal);
  const removeObjectLocal = useWhiteboardStore((s) => s.removeObjectLocal);
  const replaceAllObjects = useWhiteboardStore((s) => s.replaceAllObjects);
  const resetStore = useWhiteboardStore((s) => s.reset);

  const [status, setStatus] = useState<ConnectionStatus>("idle");
  const [userId, setUserId] = useState<string | null>(null);
  const [permission, setPermission] = useState<WhiteboardPermissionLevel | null>(null);
  const [isMentor, setIsMentor] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [pages, setPages] = useState<WhiteboardPageSummary[]>([]);
  const [activePageId, setActivePageId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let cancelled = false;
    // Plain closure var, not React state — the "hello" branch below sets it
    // synchronously and the "viewport" branch reads it in the same
    // long-lived onmessage closure, so there's no state-staleness risk the
    // way there would be reading a `userId` state value captured at effect-
    // setup time. Used only to skip our own echoed-back broadcast.
    let ownUserId: string | null = null;
    resetStore();

    (async () => {
      setStatus("connecting");
      setErrorMessage(null);

      let ticketBody: TicketResponse;
      try {
        const res = await fetch(`/api/bookings/${bookingId}/whiteboard-ticket`, { method: "POST" });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) {
          if (!cancelled) {
            setErrorMessage(body?.error ?? "Could not connect to the whiteboard.");
            setStatus("error");
          }
          return;
        }
        ticketBody = body as TicketResponse;
      } catch {
        if (!cancelled) {
          setErrorMessage("Could not reach the server.");
          setStatus("error");
        }
        return;
      }

      if (cancelled) return;

      setPermission(ticketBody.permission);
      setIsLocked(ticketBody.whiteboard.isLocked);
      setPages(ticketBody.pages);
      setActivePageId(ticketBody.pages[0]?.id ?? null);

      const socket = new WebSocket(`${ticketBody.wsUrl}/?ticket=${encodeURIComponent(ticketBody.ticket)}`);
      socketRef.current = socket;

      socket.onopen = () => {
        if (!cancelled) setStatus("open");
      };

      socket.onmessage = (event) => {
        let message: ServerMessage;
        try {
          message = JSON.parse(event.data as string) as ServerMessage;
        } catch {
          return;
        }

        if (message.type === "hello") {
          ownUserId = message.userId;
          setUserId(message.userId);
          setPermission(message.permission);
          setIsMentor(message.isMentor);
          return;
        }
        if (message.type === "sync") {
          setActivePageId(message.pageId);
          replaceAllObjects(message.objects.map(toObjectRecord));
          return;
        }
        if (message.type === "op") {
          applyIncomingOp(message, upsertObjectLocal, removeObjectLocal);
          return;
        }
        if (message.type === "error") {
          setErrorMessage(message.message);
        }
        if (message.type === "laser") {
          // Ephemeral, keyed by sender — feeds LaserLayer's animation loop
          // directly, bypassing the persisted-objects store entirely. Our
          // own points get echoed back too (see Server's connection.ts);
          // re-adding them here is harmless, just a redundant point at
          // nearly the same spot on our own already-optimistic trail.
          useLaserStore.getState().addPoint(message.userId, message.x, message.y);
          return;
        }
        if (message.type === "viewport") {
          // Unlike cursor/laser, our own echo genuinely needs skipping here
          // (not just harmless-redundant): otherwise the presenter would
          // immediately become their own "follower", fighting their own
          // pan/zoom with a one-message-late copy of itself.
          if (message.userId === ownUserId) return;
          if (message.presenting) {
            useWhiteboardStore
              .getState()
              .setPresenterViewport(message.userId, message.isMentor, { x: message.x, y: message.y, scale: message.scale });
          } else {
            useWhiteboardStore.getState().clearPresenter(message.userId);
          }
          return;
        }
        if (message.type === "board_open") {
          if (message.userId === ownUserId) return; // don't notify yourself about your own open
          useWhiteboardStore.getState().notePeerBoardOpen(message.isMentor);
          return;
        }
        // cursor/pong: not consumed here — a presence layer (later
        // milestone) will subscribe to cursor directly.
      };

      socket.onclose = () => {
        if (!cancelled) setStatus("closed");
      };

      socket.onerror = () => {
        if (!cancelled) setStatus("error");
      };
    })();

    return () => {
      cancelled = true;
      socketRef.current?.close();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- store setters are stable; re-running per bookingId is intentional
  }, [bookingId]);

  const sendOp = useCallback((opType: WhiteboardOperationType, pageId: string | null, payload: unknown) => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    const message: ClientMessage = { type: "op", clientOpId: crypto.randomUUID(), opType, pageId, payload };
    socket.send(JSON.stringify(message));
  }, []);

  const sendCursor = useCallback((pageId: string, x: number, y: number) => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    const message: ClientMessage = { type: "cursor", pageId, x, y };
    socket.send(JSON.stringify(message));
  }, []);

  const sendLaser = useCallback((pageId: string, x: number, y: number) => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    const message: ClientMessage = { type: "laser", pageId, x, y };
    socket.send(JSON.stringify(message));
  }, []);

  const sendViewport = useCallback((pageId: string, x: number, y: number, scale: number, presenting: boolean) => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    const message: ClientMessage = { type: "viewport", pageId, x, y, scale, presenting };
    socket.send(JSON.stringify(message));
  }, []);

  const sendBoardOpen = useCallback(() => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    const message: ClientMessage = { type: "board_open" };
    socket.send(JSON.stringify(message));
  }, []);

  return {
    status,
    userId,
    permission,
    isMentor,
    isLocked,
    pages,
    activePageId,
    errorMessage,
    sendOp,
    sendCursor,
    sendLaser,
    sendViewport,
    sendBoardOpen,
  };
}

function toObjectRecord(object: {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number | null;
  height: number | null;
  rotation: number;
  zIndex: number;
  data: unknown;
  createdById: string;
}): WhiteboardObjectRecord {
  return {
    id: object.id,
    type: object.type as WhiteboardObjectRecord["type"],
    x: object.x,
    y: object.y,
    width: object.width,
    height: object.height,
    rotation: object.rotation,
    zIndex: object.zIndex,
    data: (object.data as Record<string, unknown>) ?? {},
    createdById: object.createdById,
  };
}

function applyIncomingOp(
  message: Extract<ServerMessage, { type: "op" }>,
  upsertObjectLocal: (object: WhiteboardObjectRecord) => void,
  removeObjectLocal: (id: string) => void,
): void {
  if (message.opType === "OBJECT_DELETE") {
    const payload = message.payload as { id: string };
    removeObjectLocal(payload.id);
    return;
  }

  if (message.opType === "OBJECT_CREATE") {
    const payload = message.payload as {
      id: string;
      type: string;
      x: number;
      y: number;
      width?: number | null;
      height?: number | null;
      rotation?: number;
      zIndex?: number;
      data?: Record<string, unknown>;
    };
    upsertObjectLocal({
      id: payload.id,
      type: payload.type as WhiteboardObjectRecord["type"],
      x: payload.x,
      y: payload.y,
      width: payload.width ?? null,
      height: payload.height ?? null,
      rotation: payload.rotation ?? 0,
      zIndex: payload.zIndex ?? 0,
      data: payload.data ?? {},
      createdById: message.actorId,
    });
    return;
  }

  if (message.opType === "OBJECT_UPDATE") {
    const payload = message.payload as {
      id: string;
      type: string;
      changes: {
        x?: number;
        y?: number;
        width?: number | null;
        height?: number | null;
        rotation?: number;
        zIndex?: number;
        data?: Record<string, unknown>;
      };
    };
    const current = useWhiteboardStore.getState().objects[payload.id];
    const changes = payload.changes;
    upsertObjectLocal({
      id: payload.id,
      type: (current?.type ?? payload.type) as WhiteboardObjectRecord["type"],
      x: changes.x ?? current?.x ?? 0,
      y: changes.y ?? current?.y ?? 0,
      width: changes.width !== undefined ? changes.width : (current?.width ?? null),
      height: changes.height !== undefined ? changes.height : (current?.height ?? null),
      rotation: changes.rotation ?? current?.rotation ?? 0,
      zIndex: changes.zIndex ?? current?.zIndex ?? 0,
      data: changes.data ?? current?.data ?? {},
      createdById: current?.createdById ?? message.actorId,
    });
  }

  // PAGE_*/BOARD_* ops: handled in later milestones (page navigator, lock UI).
}
