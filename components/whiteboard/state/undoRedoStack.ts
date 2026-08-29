import type { WhiteboardObjectType } from "@/lib/whiteboard/protocol";

export type WhiteboardObjectRecord = {
  id: string;
  type: WhiteboardObjectType;
  x: number;
  y: number;
  width: number | null;
  height: number | null;
  rotation: number;
  zIndex: number;
  data: Record<string, unknown>;
  createdById: string;
};

export type UndoableAction =
  | { kind: "CREATE"; object: WhiteboardObjectRecord }
  | { kind: "DELETE"; object: WhiteboardObjectRecord }
  | { kind: "UPDATE"; id: string; before: Partial<WhiteboardObjectRecord>; after: Partial<WhiteboardObjectRecord> }
  // Multiple sub-actions that undo/redo as a single step — e.g. deleting or
  // dragging a multi-selection. The wire protocol has no batch op, so the
  // caller still sends one message per sub-action; only the local undo
  // stack treats them as one unit.
  | { kind: "BATCH"; actions: UndoableAction[] };

/**
 * Undo/redo here is local, not global — it doesn't need awareness of other
 * users' ops. Undoing a CREATE synthesizes a DELETE of the same object;
 * undoing a DELETE recreates it from the snapshot captured when it was
 * deleted; undoing an UPDATE reverts to the pre-change snapshot captured
 * when the change was first made. Pure and I/O-free so it's unit-testable
 * without a store or socket.
 */
export function invert(action: UndoableAction): UndoableAction {
  switch (action.kind) {
    case "CREATE":
      return { kind: "DELETE", object: action.object };
    case "DELETE":
      return { kind: "CREATE", object: action.object };
    case "UPDATE":
      return { kind: "UPDATE", id: action.id, before: action.after, after: action.before };
    case "BATCH":
      // Reverse order: if the batch created A then moved A, undoing must
      // move A back before deleting it, not the other way around.
      return { kind: "BATCH", actions: [...action.actions].reverse().map(invert) };
  }
}

/** Wraps 0+ actions as a single undo step. 0 -> null (nothing to record), 1
 * -> that action unwrapped (no point in a one-element batch), 2+ -> BATCH. */
export function toBatch(actions: UndoableAction[]): UndoableAction | null {
  if (actions.length === 0) return null;
  if (actions.length === 1) return actions[0];
  return { kind: "BATCH", actions };
}

/** Flattens a (possibly nested) BATCH down to its ordered leaf actions —
 * used when a caller needs to act on each sub-action individually, e.g.
 * sending one wire op per object in a batched undo/redo. */
export function flattenUndoable(action: UndoableAction): Exclude<UndoableAction, { kind: "BATCH" }>[] {
  if (action.kind === "BATCH") return action.actions.flatMap(flattenUndoable);
  return [action];
}
