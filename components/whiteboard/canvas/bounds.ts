import type { WhiteboardObjectRecord } from "../state/undoRedoStack";

/** Bounding box in world coordinates, used for the selection outline. Shapes
 * with an explicit width/height (RECTANGLE) use those directly; point-based
 * shapes (PATH, LINE) compute it from their (origin-relative) points. */
export function getObjectBounds(object: WhiteboardObjectRecord): { x: number; y: number; width: number; height: number } {
  if (object.width != null && object.height != null) {
    return { x: object.x, y: object.y, width: object.width, height: object.height };
  }

  const points = (object.data.points as number[] | undefined) ?? [];
  if (points.length < 2) {
    return { x: object.x, y: object.y, width: 0, height: 0 };
  }

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

  return { x: object.x + minX, y: object.y + minY, width: maxX - minX, height: maxY - minY };
}
