import { create } from "zustand";
import { invert, toBatch, type UndoableAction, type WhiteboardObjectRecord } from "./undoRedoStack";

export type WhiteboardTool = "select" | "pan" | "pen" | "highlighter" | "eraser" | "rectangle" | "line" | "laser";

type WhiteboardStoreState = {
  objects: Record<string, WhiteboardObjectRecord>;
  tool: WhiteboardTool;
  strokeColor: string;
  strokeWidth: number;
  selectedIds: string[];
  undoStack: UndoableAction[];
  redoStack: UndoableAction[];

  /** Whoever currently has "Present" toggled on (null if nobody), their
   * broadcast pan/zoom, and whether THIS client is currently mirroring it.
   * `isFollowingPresenter` defaults true and snaps back to true whenever a
   * *new* presenter starts, so viewers auto-follow without opting in —
   * they can still break away via setFollowingPresenter(false). */
  presenterId: string | null;
  presenterIsMentor: boolean;
  presenterViewport: { x: number; y: number; scale: number } | null;
  isFollowingPresenter: boolean;

  setPresenterViewport: (userId: string, isMentor: boolean, viewport: { x: number; y: number; scale: number }) => void;
  /** No-ops unless `userId` is the current presenter — a stale stop signal
   * (e.g. from a presenter who already handed off) shouldn't clear a newer one. */
  clearPresenter: (userId: string) => void;
  setFollowingPresenter: (following: boolean) => void;

  /** Last "someone else just opened the whiteboard" ping (see WhiteboardPanel
   * and the room page's notification banner) — `at` makes every occurrence a
   * distinct object even if the same person re-opens it twice in a row, so a
   * consumer's effect fires again instead of seeing an unchanged reference. */
  peerBoardOpenEvent: { isMentor: boolean; at: number } | null;
  notePeerBoardOpen: (isMentor: boolean) => void;
  dismissPeerBoardOpen: () => void;

  setTool: (tool: WhiteboardTool) => void;
  setStrokeColor: (color: string) => void;
  setStrokeWidth: (width: number) => void;

  /** Replaces the selection with a single object, or clears it (null). */
  setSelected: (id: string | null) => void;
  /** Replaces the selection wholesale — used by marquee (drag-box) select. */
  setSelectedIds: (ids: string[]) => void;
  /** Shift/Ctrl+click: add if not selected, remove if already selected. */
  toggleSelected: (id: string) => void;
  clearSelection: () => void;

  /** Apply an object create/update/delete without touching the undo stack —
   * used for the initial page hydration and for ops that arrive over the
   * socket (our own optimistic changes echo back idempotently; remote
   * peers' changes should never land on our own undo stack). */
  upsertObjectLocal: (object: WhiteboardObjectRecord) => void;
  removeObjectLocal: (id: string) => void;
  replaceAllObjects: (objects: WhiteboardObjectRecord[]) => void;

  /** User-initiated local mutations — apply optimistically AND record an
   * undo entry. Callers are responsible for sending the corresponding op
   * over the socket separately (these don't touch the network). */
  createObjectLocal: (object: WhiteboardObjectRecord) => void;
  updateObjectLocal: (id: string, changes: Partial<WhiteboardObjectRecord>) => void;
  deleteObjectLocal: (id: string) => void;

  /** Moves objects by (dx, dy) with NO undo entry — used for live visual
   * feedback on every pointer-move frame while dragging a multi-selection.
   * Pair with commitMove once at drag end to record the actual undo step. */
  translateObjectsLocal: (ids: string[], dx: number, dy: number) => void;
  /** Records one undo step (a BATCH if >1) for a completed move, given each
   * object's position before the drag started. Positions must already be
   * applied (via translateObjectsLocal/updateObjectLocal) — this only
   * books the undo entry. Returns the actions actually recorded, keyed by
   * id, so the caller can send one OBJECT_UPDATE op per moved object. */
  commitMove: (before: Record<string, { x: number; y: number }>) => { id: string; x: number; y: number }[];

  /** Deletes every currently-selected object as one undo step. Returns the
   * deleted records so the caller can send one OBJECT_DELETE op each. */
  deleteSelectedLocal: () => WhiteboardObjectRecord[];

  /** Pops the top of the undo/redo stack, applies the inverse locally, and
   * returns the action that was applied so the caller can translate it
   * into wire ops and send it. Returns null if the stack is empty. */
  undo: () => UndoableAction | null;
  redo: () => UndoableAction | null;

  reset: () => void;
};

export const useWhiteboardStore = create<WhiteboardStoreState>((set, get) => ({
  objects: {},
  tool: "select",
  strokeColor: "#111111",
  strokeWidth: 4,
  selectedIds: [],
  undoStack: [],
  redoStack: [],

  presenterId: null,
  presenterIsMentor: false,
  presenterViewport: null,
  isFollowingPresenter: true,

  setPresenterViewport: (userId, isMentor, viewport) =>
    set((state) => ({
      presenterId: userId,
      presenterIsMentor: isMentor,
      presenterViewport: viewport,
      isFollowingPresenter: state.presenterId === userId ? state.isFollowingPresenter : true,
    })),
  clearPresenter: (userId) =>
    set((state) => (state.presenterId === userId ? { presenterId: null, presenterViewport: null } : state)),
  setFollowingPresenter: (following) => set({ isFollowingPresenter: following }),

  peerBoardOpenEvent: null,
  notePeerBoardOpen: (isMentor) => set({ peerBoardOpenEvent: { isMentor, at: Date.now() } }),
  dismissPeerBoardOpen: () => set({ peerBoardOpenEvent: null }),

  setTool: (tool) => set({ tool, selectedIds: tool === "select" ? get().selectedIds : [] }),
  setStrokeColor: (strokeColor) => set({ strokeColor }),
  setStrokeWidth: (strokeWidth) => set({ strokeWidth }),

  setSelected: (id) => set({ selectedIds: id ? [id] : [] }),
  setSelectedIds: (ids) => set({ selectedIds: ids }),
  toggleSelected: (id) =>
    set((state) => ({
      selectedIds: state.selectedIds.includes(id)
        ? state.selectedIds.filter((existing) => existing !== id)
        : [...state.selectedIds, id],
    })),
  clearSelection: () => set({ selectedIds: [] }),

  upsertObjectLocal: (object) => set((state) => ({ objects: { ...state.objects, [object.id]: object } })),
  removeObjectLocal: (id) =>
    set((state) => {
      const objects = { ...state.objects };
      delete objects[id];
      return { objects, selectedIds: state.selectedIds.filter((existing) => existing !== id) };
    }),
  replaceAllObjects: (objects) =>
    set({ objects: Object.fromEntries(objects.map((object) => [object.id, object])) }),

  createObjectLocal: (object) =>
    set((state) => ({
      objects: { ...state.objects, [object.id]: object },
      undoStack: [...state.undoStack, { kind: "CREATE", object }],
      redoStack: [],
    })),

  updateObjectLocal: (id, changes) =>
    set((state) => {
      const before = state.objects[id];
      if (!before) return state;
      const after: WhiteboardObjectRecord = { ...before, ...changes };
      const beforeSnapshot: Partial<WhiteboardObjectRecord> = {};
      const afterSnapshot: Partial<WhiteboardObjectRecord> = {};
      for (const key of Object.keys(changes) as (keyof WhiteboardObjectRecord)[]) {
        (beforeSnapshot as Record<string, unknown>)[key] = before[key];
        (afterSnapshot as Record<string, unknown>)[key] = after[key];
      }
      return {
        objects: { ...state.objects, [id]: after },
        undoStack: [...state.undoStack, { kind: "UPDATE", id, before: beforeSnapshot, after: afterSnapshot }],
        redoStack: [],
      };
    }),

  deleteObjectLocal: (id) =>
    set((state) => {
      const object = state.objects[id];
      if (!object) return state;
      const objects = { ...state.objects };
      delete objects[id];
      return {
        objects,
        selectedIds: state.selectedIds.filter((existing) => existing !== id),
        undoStack: [...state.undoStack, { kind: "DELETE", object }],
        redoStack: [],
      };
    }),

  translateObjectsLocal: (ids, dx, dy) =>
    set((state) => {
      if (dx === 0 && dy === 0) return state;
      const objects = { ...state.objects };
      for (const id of ids) {
        const obj = objects[id];
        if (obj) objects[id] = { ...obj, x: obj.x + dx, y: obj.y + dy };
      }
      return { objects };
    }),

  commitMove: (before) => {
    const { objects } = get();
    const moved: { id: string; x: number; y: number }[] = [];
    const actions: UndoableAction[] = [];

    for (const [id, prev] of Object.entries(before)) {
      const current = objects[id];
      if (!current) continue;
      if (current.x === prev.x && current.y === prev.y) continue; // no actual movement
      moved.push({ id, x: current.x, y: current.y });
      actions.push({ kind: "UPDATE", id, before: { x: prev.x, y: prev.y }, after: { x: current.x, y: current.y } });
    }

    const batch = toBatch(actions);
    if (batch) set((state) => ({ undoStack: [...state.undoStack, batch], redoStack: [] }));
    return moved;
  },

  deleteSelectedLocal: () => {
    const { selectedIds, objects } = get();
    const deleted = selectedIds.map((id) => objects[id]).filter((o): o is WhiteboardObjectRecord => Boolean(o));
    if (deleted.length === 0) return [];

    set((state) => {
      const nextObjects = { ...state.objects };
      for (const object of deleted) delete nextObjects[object.id];
      const batch = toBatch(deleted.map((object) => ({ kind: "DELETE" as const, object })));
      return {
        objects: nextObjects,
        selectedIds: [],
        undoStack: batch ? [...state.undoStack, batch] : state.undoStack,
        redoStack: [],
      };
    });
    return deleted;
  },

  undo: () => {
    const { undoStack } = get();
    const action = undoStack[undoStack.length - 1];
    if (!action) return null;
    const inverse = invert(action);
    applyActionLocally(set, inverse);
    set((state) => ({ undoStack: state.undoStack.slice(0, -1), redoStack: [...state.redoStack, action] }));
    return inverse;
  },

  redo: () => {
    const { redoStack } = get();
    const action = redoStack[redoStack.length - 1];
    if (!action) return null;
    applyActionLocally(set, action);
    set((state) => ({ redoStack: state.redoStack.slice(0, -1), undoStack: [...state.undoStack, action] }));
    return action;
  },

  reset: () =>
    set({
      objects: {},
      selectedIds: [],
      undoStack: [],
      redoStack: [],
      presenterId: null,
      presenterViewport: null,
      isFollowingPresenter: true,
      peerBoardOpenEvent: null,
    }),
}));

function applyActionLocally(
  set: (partial: Partial<WhiteboardStoreState> | ((state: WhiteboardStoreState) => Partial<WhiteboardStoreState>)) => void,
  action: UndoableAction,
): void {
  if (action.kind === "CREATE") {
    set((state) => ({ objects: { ...state.objects, [action.object.id]: action.object } }));
    return;
  }
  if (action.kind === "DELETE") {
    set((state) => {
      const objects = { ...state.objects };
      delete objects[action.object.id];
      return { objects, selectedIds: state.selectedIds.filter((id) => id !== action.object.id) };
    });
    return;
  }
  if (action.kind === "BATCH") {
    for (const sub of action.actions) applyActionLocally(set, sub);
    return;
  }
  set((state) => {
    const existing = state.objects[action.id];
    if (!existing) return state;
    return { objects: { ...state.objects, [action.id]: { ...existing, ...action.after } } };
  });
}
