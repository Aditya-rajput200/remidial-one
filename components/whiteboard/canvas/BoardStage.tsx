"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Layer, Line, Rect, Stage } from "react-konva";
import type Konva from "konva";
import type { KonvaEventObject } from "konva/lib/Node";
import { useWhiteboardStore } from "../state/whiteboardStore";
import { useLaserStore } from "../state/laserStore";
import type { WhiteboardObjectRecord } from "../state/undoRedoStack";
import { nextZIndex } from "../state/nextZIndex";
import { ObjectLayer } from "./ObjectLayer";
import { SelectionOverlay } from "./SelectionOverlay";
import { LaserLayer } from "./LaserLayer";
import { getObjectBounds } from "./bounds";
import type { ObjectCreatePayload, WhiteboardOperationType } from "@/lib/whiteboard/protocol";

type Props = {
  pageId: string | null;
  canEdit: boolean;
  sendOp: (opType: WhiteboardOperationType, pageId: string | null, payload: unknown) => void;
  /** Only needed for the laser-pointer tool — every other tool goes through sendOp. */
  userId?: string | null;
  sendLaser?: (pageId: string, x: number, y: number) => void;
  /** True while this client has "Present" toggled on — see the viewport
   * broadcast effect below. */
  isPresenting?: boolean;
  sendViewport?: (pageId: string, x: number, y: number, scale: number, presenting: boolean) => void;
};

export type BoardStageHandle = {
  /** Renders the current board to a PNG data URL, or null if the stage isn't mounted yet. */
  getSnapshot: () => string | null;
};

type DraftShape =
  | { kind: "path"; points: number[] } // absolute world coords while drawing
  | { kind: "rect" | "line" | "marquee"; start: { x: number; y: number }; current: { x: number; y: number } }
  | null;

const MARQUEE_DRAG_THRESHOLD = 4; // px in world space — below this, treat as a click, not a drag

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 4;
const ZOOM_STEP = 1.05;

const LASER_SAMPLE_INTERVAL_MS = 35; // ~28 samples/sec on the wire — smooth trail without flooding the socket
const VIEWPORT_SAMPLE_INTERVAL_MS = 80; // ~12/sec — panning/zoom doesn't need laser-trail smoothness

export const BoardStage = forwardRef<BoardStageHandle, Props>(function BoardStage(
  { pageId, canEdit, sendOp, userId, sendLaser, isPresenting = false, sendViewport },
  ref,
) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<Konva.Stage | null>(null);
  const drawingRef = useRef(false);
  const lastLaserSampleRef = useRef(0);
  const lastViewportSampleRef = useRef(0);
  const wasPresentingRef = useRef(false);
  // Mirrors `draft` so handlePointerUp can read the latest value synchronously
  // and run its side effects (setSelectedIds, commitDraft, ...) as plain
  // event-handler code — NOT inside a setDraft updater, where React forbids
  // triggering other components' state updates ("Cannot update a component
  // while rendering a different component").
  const draftRef = useRef<DraftShape>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [stageTransform, setStageTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [draft, setDraft] = useState<DraftShape>(null);

  const tool = useWhiteboardStore((s) => s.tool);
  const strokeColor = useWhiteboardStore((s) => s.strokeColor);
  const strokeWidth = useWhiteboardStore((s) => s.strokeWidth);
  const createObjectLocal = useWhiteboardStore((s) => s.createObjectLocal);
  const setSelected = useWhiteboardStore((s) => s.setSelected);
  const setSelectedIds = useWhiteboardStore((s) => s.setSelectedIds);
  const clearSelection = useWhiteboardStore((s) => s.clearSelection);
  const presenterViewport = useWhiteboardStore((s) => s.presenterViewport);
  const isFollowingPresenter = useWhiteboardStore((s) => s.isFollowingPresenter);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setSize({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Broadcasts this client's own pan/zoom while presenting (throttled, same
  // idea as the laser sampler), and fires one explicit stop the moment
  // presenting turns off — a silent stop would leave followers frozen on
  // the last frame with no signal that presenting ended.
  useEffect(() => {
    if (!isPresenting || !pageId) {
      if (wasPresentingRef.current && pageId) sendViewport?.(pageId, stageTransform.x, stageTransform.y, stageTransform.scale, false);
      wasPresentingRef.current = false;
      return;
    }
    const justStarted = !wasPresentingRef.current;
    const now = performance.now();
    if (!justStarted && now - lastViewportSampleRef.current < VIEWPORT_SAMPLE_INTERVAL_MS) return;
    lastViewportSampleRef.current = now;
    wasPresentingRef.current = true;
    sendViewport?.(pageId, stageTransform.x, stageTransform.y, stageTransform.scale, true);
  }, [isPresenting, pageId, stageTransform, sendViewport]);

  const isLockedToPresenter = !isPresenting && isFollowingPresenter && Boolean(presenterViewport);
  // Derived, not synced into stageTransform via an effect: while following,
  // the presenter's broadcast IS the transform for render purposes, but the
  // underlying local `stageTransform` stays untouched — the moment the
  // viewer stops following, their own pan/zoom simply resumes from wherever
  // it was, with no extra state-copying step in between.
  const displayTransform = isLockedToPresenter && presenterViewport ? presenterViewport : stageTransform;

  const getWorldPointer = useCallback((): { x: number; y: number } | null => {
    const pos = stageRef.current?.getRelativePointerPosition();
    return pos ? { x: pos.x, y: pos.y } : null;
  }, []);

  const handlePointerDown = useCallback(
    (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
      if (!canEdit || !pageId) return;

      if (tool === "select") {
        // Only start a marquee when the click lands on empty canvas — a
        // click on a shape is handled by that shape's own onMouseDown in
        // ObjectLayer (Konva still bubbles it up here too, so e.target is
        // how the two cases are told apart).
        const stage = stageRef.current;
        if (!stage || e.target !== stage) return;
        const point = getWorldPointer();
        if (!point) return;
        drawingRef.current = true;
        draftRef.current = { kind: "marquee", start: point, current: point };
        setDraft(draftRef.current);
        return;
      }

      if (tool === "pan") return;
      // Laser has no draft/commit step (nothing is ever persisted), but it
      // still only draws click-and-drag, same press-driven gesture as pen —
      // handlePointerMove gates on drawingRef just like the other tools.
      if (tool === "laser") {
        drawingRef.current = true;
        return;
      }

      const point = getWorldPointer();
      if (!point) return;
      drawingRef.current = true;

      if (tool === "pen" || tool === "highlighter") {
        draftRef.current = { kind: "path", points: [point.x, point.y] };
      } else if (tool === "rectangle") {
        draftRef.current = { kind: "rect", start: point, current: point };
      } else if (tool === "line") {
        draftRef.current = { kind: "line", start: point, current: point };
      }
      setDraft(draftRef.current);
    },
    [canEdit, pageId, tool, getWorldPointer],
  );

  const handlePointerMove = useCallback(() => {
    if (tool === "laser") {
      // Click-and-drag only, same gesture as pen — never touches
      // sendOp/createObjectLocal though: no undo entry, nothing persisted,
      // matches the dedicated "laser" wire message (see
      // lib/whiteboard/protocol.ts) rather than "op".
      if (!drawingRef.current || !pageId || !userId) return;
      const now = performance.now();
      if (now - lastLaserSampleRef.current < LASER_SAMPLE_INTERVAL_MS) return;
      lastLaserSampleRef.current = now;
      const point = getWorldPointer();
      if (!point) return;
      useLaserStore.getState().addPoint(userId, point.x, point.y);
      sendLaser?.(pageId, point.x, point.y);
      return;
    }

    if (!drawingRef.current) return;
    const point = getWorldPointer();
    if (!point) return;
    setDraft((current) => {
      if (!current) return current;
      const next = current.kind === "path" ? { ...current, points: [...current.points, point.x, point.y] } : { ...current, current: point };
      draftRef.current = next; // ref-only mutation — safe inside an updater, unlike calling another setState
      return next;
    });
  }, [tool, pageId, userId, sendLaser, getWorldPointer]);

  const handlePointerUp = useCallback(() => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    const current = draftRef.current;
    draftRef.current = null;
    setDraft(null);
    if (!current) return;

    // Everything below is a genuine side effect (setSelectedIds, commitDraft
    // -> createObjectLocal/sendOp) — it must run as plain event-handler code,
    // never inside the setDraft updater above (see draftRef's comment).
    if (current.kind === "marquee") {
      const dx = Math.abs(current.current.x - current.start.x);
      const dy = Math.abs(current.current.y - current.start.y);
      if (dx < MARQUEE_DRAG_THRESHOLD && dy < MARQUEE_DRAG_THRESHOLD) {
        // A plain click on empty canvas — deselect everything.
        clearSelection();
        return;
      }
      const box = {
        x: Math.min(current.start.x, current.current.x),
        y: Math.min(current.start.y, current.current.y),
        width: dx,
        height: dy,
      };
      const objects = useWhiteboardStore.getState().objects;
      const matched = Object.values(objects)
        .filter((object) => rectsIntersect(box, getObjectBounds(object)))
        .map((object) => object.id);
      setSelectedIds(matched);
      return;
    }

    if (pageId) {
      commitDraft(current, {
        tool,
        strokeColor,
        strokeWidth,
        pageId,
        createObjectLocal,
        sendOp,
        onCreated: setSelected,
      });
    }
  }, [pageId, tool, strokeColor, strokeWidth, createObjectLocal, sendOp, setSelected, setSelectedIds, clearSelection]);

  const handleWheel = useCallback((e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    if (isLockedToPresenter) return; // following — the presenter's broadcast drives the transform, not local input
    const stage = stageRef.current;
    if (!stage) return;

    // Matches Figma/Excalidraw/Miro: plain wheel/trackpad scroll pans the
    // board (this is what "scrollable up and down" means for an infinite
    // canvas — there's no scrollbar, panning IS the scroll). Zooming only
    // happens with Ctrl/Cmd held, which is also how browsers report a
    // trackpad pinch-to-zoom gesture (synthetic wheel event, ctrlKey=true) —
    // so pinch-zoom keeps working without a dedicated gesture handler.
    const isZoomGesture = e.evt.ctrlKey || e.evt.metaKey;

    if (!isZoomGesture) {
      setStageTransform((current) => ({
        ...current,
        x: current.x - e.evt.deltaX,
        y: current.y - e.evt.deltaY,
      }));
      return;
    }

    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    setStageTransform((current) => {
      // Scale the zoom step by gesture intensity (deltaY magnitude) instead
      // of a fixed step — a light trackpad pinch nudges the zoom, a sharp
      // one jumps further, which reads as smooth rather than a fixed tick
      // regardless of how hard the user pinched.
      const intensity = Math.min(Math.abs(e.evt.deltaY), 100) / 100;
      const factor = 1 + intensity * (ZOOM_STEP - 1) * 4;
      const direction = e.evt.deltaY > 0 ? -1 : 1;
      const newScale = clamp(current.scale * (direction > 0 ? 1 / factor : factor), MIN_ZOOM, MAX_ZOOM);
      const worldPoint = { x: (pointer.x - current.x) / current.scale, y: (pointer.y - current.y) / current.scale };
      return { scale: newScale, x: pointer.x - worldPoint.x * newScale, y: pointer.y - worldPoint.y * newScale };
    });
  }, [isLockedToPresenter]);

  useImperativeHandle(ref, () => ({
    getSnapshot: () => stageRef.current?.toDataURL({ mimeType: "image/png", pixelRatio: 2 }) ?? null,
  }));

  const isPanning = tool === "pan";

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden bg-white">
      <Stage
        ref={stageRef}
        width={size.width}
        height={size.height}
        x={displayTransform.x}
        y={displayTransform.y}
        scaleX={displayTransform.scale}
        scaleY={displayTransform.scale}
        draggable={isPanning && !isLockedToPresenter}
        onDragEnd={(e) => {
          if (!isPanning || isLockedToPresenter) return;
          setStageTransform((current) => ({ ...current, x: e.target.x(), y: e.target.y() }));
        }}
        onWheel={handleWheel}
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
        style={{ cursor: cursorFor(tool) }}
      >
        <Layer>
          <ObjectLayer pageId={pageId} canEdit={canEdit} sendOp={sendOp} />
          <SelectionOverlay />
          <DraftPreview draft={draft} strokeColor={strokeColor} strokeWidth={strokeWidth} tool={tool} />
        </Layer>
        {/* Its own layer so the ~60fps glow animation only redraws this,
            never the (potentially large) content layer above. */}
        <LaserLayer />
      </Stage>
    </div>
  );
});

function DraftPreview({
  draft,
  strokeColor,
  strokeWidth,
  tool,
}: {
  draft: DraftShape;
  strokeColor: string;
  strokeWidth: number;
  tool: string;
}) {
  if (!draft) return null;

  if (draft.kind === "path") {
    const isHighlighter = tool === "highlighter";
    return (
      <Line
        points={draft.points}
        stroke={strokeColor}
        strokeWidth={isHighlighter ? strokeWidth * 3 : strokeWidth}
        opacity={isHighlighter ? 0.35 : 1}
        lineCap="round"
        lineJoin="round"
        listening={false}
      />
    );
  }

  if (draft.kind === "rect") {
    return (
      <Rect
        x={Math.min(draft.start.x, draft.current.x)}
        y={Math.min(draft.start.y, draft.current.y)}
        width={Math.abs(draft.current.x - draft.start.x)}
        height={Math.abs(draft.current.y - draft.start.y)}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        dash={[4, 4]}
        listening={false}
      />
    );
  }

  if (draft.kind === "marquee") {
    return (
      <Rect
        x={Math.min(draft.start.x, draft.current.x)}
        y={Math.min(draft.start.y, draft.current.y)}
        width={Math.abs(draft.current.x - draft.start.x)}
        height={Math.abs(draft.current.y - draft.start.y)}
        fill="rgba(122, 156, 31, 0.08)"
        stroke="#7A9C1F"
        strokeWidth={1}
        listening={false}
      />
    );
  }

  return (
    <Line
      points={[draft.start.x, draft.start.y, draft.current.x, draft.current.y]}
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      dash={[4, 4]}
      listening={false}
    />
  );
}

function commitDraft(
  draft: NonNullable<DraftShape>,
  ctx: {
    tool: string;
    strokeColor: string;
    strokeWidth: number;
    pageId: string;
    createObjectLocal: (object: WhiteboardObjectRecord) => void;
    sendOp: (opType: WhiteboardOperationType, pageId: string | null, payload: unknown) => void;
    onCreated: (id: string) => void;
  },
): void {
  const id = crypto.randomUUID();
  // createdById is a transient placeholder for the local optimistic copy —
  // it's not read by any renderer, and gets overwritten with the real
  // actor id the moment the server's OBJECT_CREATE confirmation arrives
  // (see useWhiteboardSocket's applyIncomingOp).
  const createdById = "";
  // One more than the current highest zIndex — new objects always land on
  // top. Never Date.now(): zIndex is a Postgres 32-bit integer column and
  // a millisecond timestamp (~1.7 trillion) overflows it outright.
  const zIndex = nextZIndex();

  if (draft.kind === "path") {
    if (draft.points.length < 4) return; // fewer than 2 points isn't a stroke
    const bounds = pathBounds(draft.points);
    const isHighlighter = ctx.tool === "highlighter";
    const object: WhiteboardObjectRecord = {
      id,
      type: "PATH",
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
      rotation: 0,
      zIndex,
      data: {
        points: toRelativePoints(draft.points, bounds.x, bounds.y),
        stroke: ctx.strokeColor,
        strokeWidth: isHighlighter ? ctx.strokeWidth * 3 : ctx.strokeWidth,
        opacity: isHighlighter ? 0.35 : 1,
        composite: isHighlighter ? "multiply" : undefined,
      },
      createdById,
    };
    ctx.createObjectLocal(object);
    ctx.sendOp("OBJECT_CREATE", ctx.pageId, toCreatePayload(object));
    return;
  }

  const width = draft.current.x - draft.start.x;
  const height = draft.current.y - draft.start.y;
  if (Math.abs(width) < 2 && Math.abs(height) < 2) return; // ignore a stray click

  if (draft.kind === "rect") {
    const object: WhiteboardObjectRecord = {
      id,
      type: "RECTANGLE",
      x: Math.min(draft.start.x, draft.current.x),
      y: Math.min(draft.start.y, draft.current.y),
      width: Math.abs(width),
      height: Math.abs(height),
      rotation: 0,
      zIndex,
      data: { stroke: ctx.strokeColor, strokeWidth: ctx.strokeWidth },
      createdById,
    };
    ctx.createObjectLocal(object);
    ctx.sendOp("OBJECT_CREATE", ctx.pageId, toCreatePayload(object));
    return;
  }

  const object: WhiteboardObjectRecord = {
    id,
    type: "LINE",
    x: draft.start.x,
    y: draft.start.y,
    width: Math.abs(width),
    height: Math.abs(height),
    rotation: 0,
    zIndex,
    data: { points: [0, 0, width, height], stroke: ctx.strokeColor, strokeWidth: ctx.strokeWidth },
    createdById,
  };
  ctx.createObjectLocal(object);
  ctx.sendOp("OBJECT_CREATE", ctx.pageId, toCreatePayload(object));
}

function toCreatePayload(object: WhiteboardObjectRecord): ObjectCreatePayload {
  return {
    id: object.id,
    type: object.type,
    x: object.x,
    y: object.y,
    width: object.width,
    height: object.height,
    rotation: object.rotation,
    zIndex: object.zIndex,
    data: object.data,
  };
}

function pathBounds(points: number[]): { x: number; y: number; width: number; height: number } {
  let minX = points[0];
  let maxX = points[0];
  let minY = points[1];
  let maxY = points[1];
  for (let i = 0; i < points.length; i += 2) {
    minX = Math.min(minX, points[i]);
    maxX = Math.max(maxX, points[i]);
    minY = Math.min(minY, points[i + 1]);
    maxY = Math.max(maxY, points[i + 1]);
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

function toRelativePoints(points: number[], originX: number, originY: number): number[] {
  const relative: number[] = [];
  for (let i = 0; i < points.length; i += 2) {
    relative.push(points[i] - originX, points[i + 1] - originY);
  }
  return relative;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function rectsIntersect(
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number },
): boolean {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function cursorFor(tool: string): string {
  if (tool === "pan") return "grab";
  if (tool === "select") return "default";
  if (tool === "eraser") return "cell";
  // The glowing head dot (see LaserLayer) is the pointer while this tool is
  // active — an OS cursor on top of it would fight the "clean" laser look.
  if (tool === "laser") return "none";
  return "crosshair";
}
