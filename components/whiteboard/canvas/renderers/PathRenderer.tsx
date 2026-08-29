"use client";

import { Line } from "react-konva";
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

export function PathRenderer({ object, draggable, onMouseDown, onTouchStart, onDragStart, onDragMove, onDragEnd }: Props) {
  const points = (object.data.points as number[]) ?? [];
  const stroke = (object.data.stroke as string) ?? "#111111";
  const strokeWidth = (object.data.strokeWidth as number) ?? 4;
  const opacity = (object.data.opacity as number) ?? 1;
  const composite = object.data.composite as GlobalCompositeOperation | undefined;

  return (
    <Line
      x={object.x}
      y={object.y}
      points={points}
      stroke={stroke}
      strokeWidth={strokeWidth}
      opacity={opacity}
      lineCap="round"
      lineJoin="round"
      globalCompositeOperation={composite}
      draggable={draggable}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      onDragStart={onDragStart}
      onDragMove={(e: KonvaEventObject<DragEvent>) => onDragMove(e.target.x(), e.target.y())}
      onDragEnd={(e: KonvaEventObject<DragEvent>) => onDragEnd(e.target.x(), e.target.y())}
    />
  );
}
