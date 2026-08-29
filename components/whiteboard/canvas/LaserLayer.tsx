"use client";

import { useEffect, useRef } from "react";
import { Layer, Shape } from "react-konva";
import Konva from "konva";
import { useLaserStore, LASER_TRAIL_TTL_MS, type LaserPoint } from "../state/laserStore";

// Hot neon magenta glow around a near-white core — the classic "neon tube"
// look (colored light bleeding around a bright white-hot center), not just
// a flat colored line.
const LASER_GLOW_COLOR = "#FF16E0";
const LASER_CORE_COLOR = "#FFF2FD";

export function LaserLayer() {
  const layerRef = useRef<Konva.Layer | null>(null);
  // Only re-renders (mounting/unmounting a <LaserTrail>) when the SET of
  // active userIds changes — point-level aging within a trail is read fresh
  // every animation frame straight from the store (see LaserTrail's
  // sceneFunc), never via React re-renders, so the fade stays smooth without
  // re-rendering this component tree at 60fps.
  const userIds = useLaserStore((s) => Object.keys(s.trails).sort().join(","));

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;
    const anim = new Konva.Animation(() => {
      useLaserStore.getState().prune(performance.now());
    }, layer);
    anim.start();
    return () => {
      anim.stop();
    };
  }, []);

  return (
    <Layer ref={layerRef} listening={false}>
      {userIds
        .split(",")
        .filter(Boolean)
        .map((userId) => (
          <LaserTrail key={userId} userId={userId} />
        ))}
    </Layer>
  );
}

function LaserTrail({ userId }: { userId: string }) {
  return (
    <Shape
      listening={false}
      sceneFunc={(ctx, shape) => {
        const points = useLaserStore.getState().trails[userId];
        if (!points || points.length === 0) return;
        const now = performance.now();

        // Glow pass: a subtle halo, not a bloom — colored, lightly blurred.
        drawSegments(ctx, points, now, {
          color: LASER_GLOW_COLOR,
          minWidth: 2,
          maxWidth: 5,
          glow: true,
        });
        // Core pass: thin, crisp, near-white — the hot center.
        drawSegments(ctx, points, now, {
          color: LASER_CORE_COLOR,
          minWidth: 1,
          maxWidth: 2.5,
          glow: false,
        });

        // Head dot: a small, brighter marker at the current position so
        // the pointer stays clearly visible even between sparse samples.
        const head = points[points.length - 1];
        const headAge = now - head.t;
        const headLife = Math.max(0, 1 - headAge / LASER_TRAIL_TTL_MS);
        if (headLife > 0) {
          ctx.save();
          ctx.globalAlpha = headLife;
          ctx.shadowColor = LASER_GLOW_COLOR;
          ctx.shadowBlur = 6 * headLife;
          ctx.fillStyle = LASER_GLOW_COLOR;
          ctx.beginPath();
          ctx.arc(head.x, head.y, 3.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.fillStyle = LASER_CORE_COLOR;
          ctx.beginPath();
          ctx.arc(head.x, head.y, 1.6, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        // Shape requires a fill/stroke call for Konva to know it drew
        // something — the actual pixels above already exist on the canvas.
        ctx.fillStrokeShape(shape);
      }}
    />
  );
}

function drawSegments(
  ctx: Konva.Context,
  points: LaserPoint[],
  now: number,
  opts: { color: string; minWidth: number; maxWidth: number; glow: boolean },
): void {
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = opts.color;

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const point = points[i];
    const age = now - point.t;
    const lifeFrac = Math.max(0, 1 - age / LASER_TRAIL_TTL_MS);
    if (lifeFrac <= 0) continue;

    // Eased falloff — holds brighter near the head, then fades faster
    // toward the tail, reading as a cleaner "comet" than a linear fade.
    const eased = Math.pow(lifeFrac, 1.6);

    ctx.globalAlpha = opts.glow ? eased * 0.5 : eased;
    ctx.lineWidth = opts.minWidth + eased * (opts.maxWidth - opts.minWidth);
    if (opts.glow) {
      ctx.shadowColor = opts.color;
      ctx.shadowBlur = 6 * eased;
    } else {
      ctx.shadowBlur = 0;
    }

    ctx.beginPath();
    ctx.moveTo(prev.x, prev.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
  }

  ctx.restore();
}
