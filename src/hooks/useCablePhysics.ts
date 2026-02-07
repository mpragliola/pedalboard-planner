import { useRef, useState, useEffect } from "react";

interface Point {
  x: number;
  y: number;
}

interface Particle {
  x: number;
  y: number;
  prevX: number;
  prevY: number;
}

/** Number of point-masses in the rope chain. */
const NUM_PARTICLES = 20;
/** 
 * Downward acceleration in mm per frame² (canvas coords, y-down). 
 * NOTE: this is thought for a side view, while the application has a top
 * view. The slack should remain therefore minimal.
 * */
const GRAVITY = 0.4;
/** Velocity retention per frame (1 = no damping). */
const DAMPING = 0.2;
/** Constraint-solver passes per frame – more = stiffer rope. */
const CONSTRAINT_ITERS = 10;
/** Rope length as a multiple of the straight-line endpoint distance. */
const SLACK = 0.001;
/** Minimum rest length between adjacent particles (mm) so tiny distances don't collapse. */
const MIN_SEG_REST = 2;

function initChain(a: Point, b: Point): Particle[] {
  const out: Particle[] = [];
  for (let i = 0; i < NUM_PARTICLES; i++) {
    const t = i / (NUM_PARTICLES - 1);
    const x = a.x + (b.x - a.x) * t;
    const y = a.y + (b.y - a.y) * t;
    out.push({ x, y, prevX: x, prevY: y });
  }
  return out;
}

/**
 * Verlet rope physics for the uncommitted cable segment.
 * Returns an array of canvas-space points forming a smooth wobbly curve
 * pinned at `anchorA` (segment start) and `anchorB` (mouse position).
 */
export function useCablePhysics(anchorA: Point | null, anchorB: Point | null, enabled: boolean): Point[] {
  const particlesRef = useRef<Particle[]>([]);
  const aRef = useRef<Point | null>(null);
  const bRef = useRef<Point | null>(null);
  const prevARef = useRef<Point | null>(null);
  const enabledRef = useRef(false);
  const rafRef = useRef(0);
  const [points, setPoints] = useState<Point[]>([]);

  // Keep refs in sync so the rAF loop always reads fresh values.
  aRef.current = anchorA;
  bRef.current = anchorB;
  enabledRef.current = enabled;

  useEffect(() => {
    if (!enabled) {
      particlesRef.current = [];
      prevARef.current = null;
      setPoints([]);
      return;
    }

    const tick = () => {
      const a = aRef.current;
      const b = bRef.current;

      if (!a || !b) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      // (Re-)initialise when anchorA jumps (new segment started).
      const prev = prevARef.current;
      if (!prev || particlesRef.current.length === 0 || Math.hypot(a.x - prev.x, a.y - prev.y) > 1) {
        particlesRef.current = initChain(a, b);
        prevARef.current = { x: a.x, y: a.y };
      }

      const ps = particlesRef.current;
      const N = ps.length;
      const last = N - 1;

      // Pin endpoints.
      ps[0].x = a.x;
      ps[0].y = a.y;
      ps[0].prevX = a.x;
      ps[0].prevY = a.y;
      ps[last].x = b.x;
      ps[last].y = b.y;
      ps[last].prevX = b.x;
      ps[last].prevY = b.y;

      // Verlet integration for inner particles.
      for (let i = 1; i < last; i++) {
        const p = ps[i];
        const vx = (p.x - p.prevX) * DAMPING;
        const vy = (p.y - p.prevY) * DAMPING;
        p.prevX = p.x;
        p.prevY = p.y;
        p.x += vx;
        p.y += vy + GRAVITY;
      }

      // Distance constraints.
      const dist = Math.hypot(b.x - a.x, b.y - a.y);
      const segRest = Math.max((dist * SLACK) / (N - 1), MIN_SEG_REST);

      for (let iter = 0; iter < CONSTRAINT_ITERS; iter++) {
        for (let i = 0; i < N - 1; i++) {
          const p1 = ps[i];
          const p2 = ps[i + 1];
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const d = Math.hypot(dx, dy);
          if (d < 0.001) continue;
          const diff = (segRest - d) / d;
          const ox = dx * diff * 0.5;
          const oy = dy * diff * 0.5;
          if (i !== 0) {
            p1.x -= ox;
            p1.y -= oy;
          }
          if (i + 1 !== last) {
            p2.x += ox;
            p2.y += oy;
          }
        }
      }

      // Publish to React.
      setPoints(ps.map((p) => ({ x: p.x, y: p.y })));
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [enabled]);

  return points;
}
