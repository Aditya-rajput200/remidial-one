import { create } from "zustand";

export type LaserPoint = { x: number; y: number; t: number };

// How long a laser point stays visible before it's pruned — matches
// Excalidraw's laser pointer: a point fades out and disappears ~3s after
// being drawn, never persisted anywhere (no undo entry, no OBJECT_CREATE op).
export const LASER_TRAIL_TTL_MS = 3000;

type LaserState = {
  // Keyed by userId (local user included, using its own real id once known
  // from the socket's "hello" message) so multiple people's trails render
  // and expire independently.
  trails: Record<string, LaserPoint[]>;
  addPoint: (userId: string, x: number, y: number) => void;
  /** Drops points older than the TTL; drops a user's entry entirely once empty. */
  prune: (now: number) => void;
};

export const useLaserStore = create<LaserState>((set) => ({
  trails: {},

  addPoint: (userId, x, y) =>
    set((state) => ({
      trails: {
        ...state.trails,
        [userId]: [...(state.trails[userId] ?? []), { x, y, t: performance.now() }],
      },
    })),

  prune: (now) =>
    set((state) => {
      let anyDropped = false;
      const trails: Record<string, LaserPoint[]> = {};
      for (const [userId, points] of Object.entries(state.trails)) {
        const kept = points.filter((p) => now - p.t < LASER_TRAIL_TTL_MS);
        if (kept.length !== points.length) anyDropped = true;
        if (kept.length > 0) trails[userId] = kept;
      }
      // Expired points are always actually dropped (no unbounded growth
      // during a long laser session) — but this fires every animation
      // frame, so reuse the old object when nothing aged out to avoid
      // handing zustand a new reference on every tick.
      return anyDropped ? { trails } : state;
    }),
}));
