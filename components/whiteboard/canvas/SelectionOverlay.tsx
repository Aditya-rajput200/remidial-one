"use client";

import { Rect } from "react-konva";
import { useWhiteboardStore } from "../state/whiteboardStore";
import { getObjectBounds } from "./bounds";

const SELECTION_COLOR = "#7A9C1F"; // darker lime — readable as an outline against the white board

export function SelectionOverlay() {
  const objects = useWhiteboardStore((s) => s.objects);
  const selectedIds = useWhiteboardStore((s) => s.selectedIds);

  return (
    <>
      {selectedIds.map((id) => {
        const object = objects[id];
        if (!object) return null;
        const bounds = getObjectBounds(object);
        return (
          <Rect
            key={id}
            x={bounds.x - 4}
            y={bounds.y - 4}
            width={bounds.width + 8}
            height={bounds.height + 8}
            stroke={SELECTION_COLOR}
            strokeWidth={1.5}
            dash={[6, 4]}
            listening={false}
          />
        );
      })}
    </>
  );
}
