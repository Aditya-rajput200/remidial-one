// Client-side mirror of Server/src/ws/protocol.ts. The two projects can't
// share code directly (separate npm projects, separate deploys), so these
// types are kept in sync by hand — the Server's zod schemas remain the
// actual source of truth/enforcement; this file exists only so the
// Next.js client has typed wire messages instead of `any`.

export type WhiteboardObjectType =
  | "PATH"
  | "LINE"
  | "ARROW"
  | "RECTANGLE"
  | "ELLIPSE"
  | "TRIANGLE"
  | "TEXT"
  | "STICKY_NOTE"
  | "EQUATION"
  | "IMAGE";

export type WhiteboardOperationType =
  | "OBJECT_CREATE"
  | "OBJECT_UPDATE"
  | "OBJECT_DELETE"
  | "PAGE_CREATE"
  | "PAGE_UPDATE"
  | "PAGE_DELETE"
  | "PAGE_REORDER"
  | "BOARD_LOCK"
  | "BOARD_UNLOCK";

export type WhiteboardPermissionLevel = "VIEW_ONLY" | "COLLABORATE" | "FULL_COLLABORATION";

export type WhiteboardBackground = "BLANK" | "GRID" | "RULED" | "DOTTED" | "GRAPH_PAPER";

export type ClientMessage =
  | { type: "op"; clientOpId: string; opType: WhiteboardOperationType; pageId: string | null; payload: unknown }
  | { type: "cursor"; pageId: string; x: number; y: number }
  | { type: "laser"; pageId: string; x: number; y: number }
  | { type: "viewport"; pageId: string; x: number; y: number; scale: number; presenting: boolean }
  // Fired once when this client switches its own local view over to the
  // whiteboard (see app/session/[id]/room/page.tsx's boardActive toggle) —
  // lets the other participant get nudged to open it too instead of missing
  // that the board is now in use.
  | { type: "board_open" }
  | { type: "ping" };

export type SyncedObject = {
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
};

export type ServerMessage =
  | {
      type: "hello";
      whiteboardId: string;
      userId: string;
      permission: WhiteboardPermissionLevel;
      isMentor: boolean;
      participantCount: number;
    }
  // Sent once, right after hello: the current state of the board's first
  // page (single page for now — see Server/src/ws/connection.ts's
  // sendInitialSync). A full replace, not a diff.
  | { type: "sync"; pageId: string; objects: SyncedObject[] }
  | {
      type: "op";
      id: string;
      whiteboardId: string;
      pageId: string | null;
      objectId: string | null;
      opType: WhiteboardOperationType;
      actorId: string;
      clientOpId: string;
      payload: unknown;
      createdAt: string;
    }
  | { type: "cursor"; userId: string; pageId: string; x: number; y: number }
  | { type: "laser"; userId: string; pageId: string; x: number; y: number }
  // Ephemeral, same as cursor/laser — a "present" toggle broadcasts the
  // presenter's own pan/zoom so viewers in follow mode can mirror their
  // view exactly. `presenting: false` is one explicit stop signal, not a
  // timeout — see WhiteboardPanel's presenter banner for the viewer side.
  | { type: "viewport"; userId: string; pageId: string; x: number; y: number; scale: number; presenting: boolean; isMentor: boolean }
  | { type: "board_open"; userId: string; isMentor: boolean }
  | { type: "error"; code: string; message: string }
  | { type: "pong" };

// OBJECT_CREATE / OBJECT_UPDATE payload shapes this client sends — must stay
// compatible with Server/src/operations/validate.ts's objectFieldsSchema /
// objectUpdatePayloadSchema (id/type/x/y/width/height/rotation/zIndex/data).
export type ObjectCreatePayload = {
  id: string;
  type: WhiteboardObjectType;
  x: number;
  y: number;
  width?: number | null;
  height?: number | null;
  rotation?: number;
  zIndex?: number;
  data: Record<string, unknown>;
};

export type ObjectUpdatePayload = {
  id: string;
  type: WhiteboardObjectType;
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

export type ObjectDeletePayload = { id: string };
