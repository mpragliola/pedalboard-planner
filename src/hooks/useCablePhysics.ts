import { useEffect, useRef, useState } from "react";
import type { Point } from "../lib/vector";
import {
  advanceCablePhysics,
  cablePhysicsParticlesToPoints,
  createCablePhysicsState,
  maxPointDelta,
} from "../lib/cablePhysics";

/** Suppress React publishes for tiny per-frame movement to reduce render churn. */
const PUBLISH_DELTA_THRESHOLD = 0.05;

/**
 * Verlet rope physics for the uncommitted cable segment.
 * Returns an array of canvas-space points forming a smooth wobbly curve
 * pinned at `anchorA` (segment start) and `anchorB` (mouse position).
 */
export function useCablePhysics(anchorA: Point | null, anchorB: Point | null, enabled: boolean): Point[] {
  const stateRef = useRef(createCablePhysicsState());
  const publishedPointsRef = useRef<Point[]>([]);
  const aRef = useRef<Point | null>(null);
  const bRef = useRef<Point | null>(null);
  const rafRef = useRef(0);
  const [points, setPoints] = useState<Point[]>([]);

  // Keep refs in sync so the rAF loop always reads fresh values.
  aRef.current = anchorA;
  bRef.current = anchorB;

  useEffect(() => {
    if (!enabled) {
      stateRef.current = createCablePhysicsState();
      publishedPointsRef.current = [];
      setPoints([]);
      return;
    }

    const tick = (timestampMs: number) => {
      const a = aRef.current;
      const b = bRef.current;

      if (!a || !b) {
        stateRef.current = { ...stateRef.current, lastTimestampMs: timestampMs };
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      stateRef.current = advanceCablePhysics(stateRef.current, a, b, timestampMs);
      const nextPoints = cablePhysicsParticlesToPoints(stateRef.current.particles);
      const shouldPublish =
        publishedPointsRef.current.length !== nextPoints.length ||
        maxPointDelta(publishedPointsRef.current, nextPoints) >= PUBLISH_DELTA_THRESHOLD;
      if (shouldPublish) {
        publishedPointsRef.current = nextPoints;
        setPoints(nextPoints);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [enabled]);

  return points;
}
