"use client";

import { Line, Rect } from "react-konva";
import type { KonvaEventObject } from "konva/lib/Node";
import type { WhiteboardObjectRecord } from "../../state/undoRedoStack";

type Props = {
  object: WhiteboardObjectRecord;
  draggable: boolean;
  onMouseDown: (e: KonvaEventObject<MouseEvent>) => void;
  onTouchStart: (e: KonvaEventObject<TouchEvent>) => void;
  onDragStart: () => void;
  onDragMove: (x: number, y: number) => void;
  onDragEnd: (x: number, y: number) => void;
};

/** RECTANGLE and LINE for the M6 MVP toolset — ELLIPSE/TRIANGLE/ARROW slot
 * in here the same way once their toolbar buttons land (M7). */
export function ShapeRenderer({ object, draggable, onMouseDown, onTouchStart, onDragStart, onDragMove, onDragEnd }: Props) {
  const stroke = (object.data.stroke as string) ?? "#111111";
  const strokeWidth = (object.data.strokeWidth as number) ?? 3;
  const fill = object.data.fill as string | undefined;

  const handleDragMove = (e: KonvaEventObject<DragEvent>) => onDragMove(e.target.x(), e.target.y());
  const handleDragEnd = (e: KonvaEventObject<DragEvent>) => onDragEnd(e.target.x(), e.target.y());

  if (object.type === "LINE") {
    const points = (object.data.points as number[]) ?? [0, 0, 0, 0];
    return (
      <Line
        x={object.x}
        y={object.y}
        points={points}
        stroke={stroke}
        strokeWidth={strokeWidth}
        lineCap="round"
        draggable={draggable}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        onDragStart={onDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
      />
    );
  }

  // RECTANGLE (default)
  return (
    <Rect
      x={object.x}
      y={object.y}
      width={object.width ?? 0}
      height={object.height ?? 0}
      rotation={object.rotation}
      stroke={stroke}
      strokeWidth={strokeWidth}
      fill={fill}
      draggable={draggable}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      onDragStart={onDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
    />
  );
}
