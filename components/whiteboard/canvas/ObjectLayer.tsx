"use client";

import { useRef } from "react";
import type { KonvaEventObject } from "konva/lib/Node";
import { useWhiteboardStore } from "../state/whiteboardStore";
import { PathRenderer } from "./renderers/PathRenderer";
import { ShapeRenderer } from "./renderers/ShapeRenderer";
import { ImageRenderer } from "./renderers/ImageRenderer";
import type { WhiteboardOperationType } from "@/lib/whiteboard/protocol";

type Props = {
  pageId: string | null;
  canEdit: boolean;
  sendOp: (opType: WhiteboardOperationType, pageId: string | null, payload: unknown) => void;
};

export function ObjectLayer({ pageId, canEdit, sendOp }: Props) {
  const objects = useWhiteboardStore((s) => s.objects);
  const tool = useWhiteboardStore((s) => s.tool);
  const selectedIds = useWhiteboardStore((s) => s.selectedIds);
  const setSelected = useWhiteboardStore((s) => s.setSelected);
  const toggleSelected = useWhiteboardStore((s) => s.toggleSelected);
  const updateObjectLocal = useWhiteboardStore((s) => s.updateObjectLocal);
  const deleteObjectLocal = useWhiteboardStore((s) => s.deleteObjectLocal);
  const translateObjectsLocal = useWhiteboardStore((s) => s.translateObjectsLocal);
  const commitMove = useWhiteboardStore((s) => s.commitMove);

  const sorted = Object.values(objects).sort((a, b) => a.zIndex - b.zIndex);

  // Group-drag bookkeeping: when the drag starts, snapshot where every
  // selected object was (so commitMove can diff against it) and the
  // dragged shape's own start position (so every frame's delta is relative
  // to a fixed origin — accumulating per-frame deltas would drift from
  // rounding). Refs, not state: this changes every pointermove frame and
  // must never trigger a re-render itself.
  const dragOriginRef = useRef<{ x: number; y: number } | null>(null);
  const dragSnapshotRef = useRef<Record<string, { x: number; y: number }>>({});

  function isShiftClick(e: KonvaEventObject<MouseEvent> | KonvaEventObject<TouchEvent>): boolean {
    const evt = e.evt as MouseEvent;
    return Boolean(evt.shiftKey || evt.ctrlKey || evt.metaKey);
  }

  function handlePointerDown(id: string, e: KonvaEventObject<MouseEvent> | KonvaEventObject<TouchEvent>) {
    if (!canEdit) return;
    if (tool === "select") {
      if (isShiftClick(e)) {
        toggleSelected(id);
      } else if (!selectedIds.includes(id)) {
        // Clicking an object already part of the selection keeps the whole
        // group selected (so it can be dragged together); clicking a new
        // object replaces the selection with just that one.
        setSelected(id);
      }
      return;
    }
    if (tool === "eraser") {
      deleteObjectLocal(id);
      sendOp("OBJECT_DELETE", pageId, { id });
    }
  }

  function handleDragStart(id: string) {
    const ids = selectedIds.includes(id) ? selectedIds : [id];
    const origin = objects[id];
    if (!origin) return;
    dragOriginRef.current = { x: origin.x, y: origin.y };
    dragSnapshotRef.current = Object.fromEntries(
      ids.map((selectedId) => {
        const obj = objects[selectedId];
        return [selectedId, { x: obj?.x ?? 0, y: obj?.y ?? 0 }];
      }),
    );
  }

  // Fires on every pointermove while dragging — moves every OTHER selected
  // object by the same delta in real time so a multi-selection drags as one
  // visual unit instead of only the grabbed shape animating. Each object's
  // target is computed as (its own snapshot position + delta), not
  // (current position + delta) — the latter would compound rounding error
  // every single frame of the drag.
  function handleDragMove(id: string, x: number, y: number) {
    const origin = dragOriginRef.current;
    if (!origin) return;
    const others = selectedIds.filter((selectedId) => selectedId !== id);
    if (others.length === 0) return;

    const dx = x - origin.x;
    const dy = y - origin.y;
    const snapshot = dragSnapshotRef.current;
    const currentObjects = useWhiteboardStore.getState().objects;

    for (const otherId of others) {
      const start = snapshot[otherId];
      const current = currentObjects[otherId];
      if (!start || !current) continue;
      const targetX = start.x + dx;
      const targetY = start.y + dy;
      if (current.x !== targetX || current.y !== targetY) {
        translateObjectsLocal([otherId], targetX - current.x, targetY - current.y);
      }
    }
  }

  function handleDragEnd(id: string, x: number, y: number) {
    const type = objects[id]?.type;
    if (!type) return;

    const snapshot = dragSnapshotRef.current;
    dragOriginRef.current = null;
    dragSnapshotRef.current = {};

    const ids = selectedIds.includes(id) ? selectedIds : [id];
    if (ids.length <= 1) {
      // Single-object drag — unchanged fast path.
      updateObjectLocal(id, { x, y });
      sendOp("OBJECT_UPDATE", pageId, { id, type, changes: { x, y } });
      return;
    }

    // The dragged shape's own final position hasn't been written to the
    // store yet (Konva moved it visually; only the siblings were synced via
    // translateObjectsLocal above) — apply it now, then commit one batched
    // undo step covering every object that actually moved.
    const currentObjects = useWhiteboardStore.getState().objects;
    if (currentObjects[id]) {
      useWhiteboardStore.setState({ objects: { ...currentObjects, [id]: { ...currentObjects[id], x, y } } });
    }

    const moved = commitMove(snapshot);
    for (const m of moved) {
      const movedType = useWhiteboardStore.getState().objects[m.id]?.type;
      if (!movedType) continue;
      sendOp("OBJECT_UPDATE", pageId, { id: m.id, type: movedType, changes: { x: m.x, y: m.y } });
    }
  }

  return (
    <>
      {sorted.map((object) => {
        const props = {
          object,
          draggable: canEdit && tool === "select",
          onMouseDown: (e: KonvaEventObject<MouseEvent>) => handlePointerDown(object.id, e),
          onTouchStart: (e: KonvaEventObject<TouchEvent>) => handlePointerDown(object.id, e),
          onDragStart: () => handleDragStart(object.id),
          onDragMove: (x: number, y: number) => handleDragMove(object.id, x, y),
          onDragEnd: (x: number, y: number) => handleDragEnd(object.id, x, y),
        };
        if (object.type === "PATH") return <PathRenderer key={object.id} {...props} />;
        if (object.type === "IMAGE") return <ImageRenderer key={object.id} {...props} />;
        return <ShapeRenderer key={object.id} {...props} />;
      })}
    </>
  );
}
