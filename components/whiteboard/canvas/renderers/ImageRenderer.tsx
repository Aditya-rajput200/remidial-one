"use client";

import { useEffect, useState } from "react";
import { Image as KonvaImage } from "react-konva";
import type { KonvaEventObject } from "konva/lib/Node";
import type { WhiteboardObjectRecord } from "../../state/undoRedoStack";

/** react-konva has no built-in remote-image loader — load it as a plain
 * HTMLImageElement and re-render once it's ready. An IMAGE object's src
 * never changes after creation in practice, so a stale image briefly
 * surviving a src change isn't a real-world concern here. */
function useHtmlImage(src: string | undefined): HTMLImageElement | null {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!src) return;
    let cancelled = false;
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (!cancelled) setImage(img);
    };
    img.onerror = () => {
      if (!cancelled) console.warn(`Whiteboard image failed to load: ${src}`);
    };
    img.src = src;
    return () => {
      cancelled = true;
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  return image;
}

type Props = {
  object: WhiteboardObjectRecord;
  draggable: boolean;
  onMouseDown: (e: KonvaEventObject<MouseEvent>) => void;
  onTouchStart: (e: KonvaEventObject<TouchEvent>) => void;
  onDragStart: () => void;
  onDragMove: (x: number, y: number) => void;
  onDragEnd: (x: number, y: number) => void;
};

export function ImageRenderer({ object, draggable, onMouseDown, onTouchStart, onDragStart, onDragMove, onDragEnd }: Props) {
  const src = object.data.src as string | undefined;
  const image = useHtmlImage(src);
  if (!image) return null;

  return (
    <KonvaImage
      image={image}
      x={object.x}
      y={object.y}
      width={object.width ?? image.width}
      height={object.height ?? image.height}
      rotation={object.rotation}
      draggable={draggable}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      onDragStart={onDragStart}
      onDragMove={(e: KonvaEventObject<DragEvent>) => onDragMove(e.target.x(), e.target.y())}
      onDragEnd={(e: KonvaEventObject<DragEvent>) => onDragEnd(e.target.x(), e.target.y())}
    />
  );
}
