import { useWhiteboardStore } from "./whiteboardStore";

/** One more than the current highest zIndex — new objects always land on
 * top. Never use Date.now() here: zIndex is a Postgres 32-bit integer
 * column and a millisecond timestamp overflows it outright. */
export function nextZIndex(): number {
  let max = -1;
  for (const object of Object.values(useWhiteboardStore.getState().objects)) {
    if (object.zIndex > max) max = object.zIndex;
  }
  return max + 1;
}
