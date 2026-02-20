import type { Point } from "./vector";

export interface CableParticle {
  x: number;
  y: number;
  prevX: number;
  prevY: number;
}

export interface CablePhysicsState {
  particles: CableParticle[];
  accumulatorMs: number;
  lastTimestampMs: number | null;
  prevAnchorA: Point | null;
}

export interface CablePhysicsConfig {
  numParticles: number;
  gravity: number;
  damping: number;
  constraintIters: number;
  slack: number;
  minSegRest: number;
  simStepMs: number;
  maxSubstepsPerFrame: number;
  maxFrameDeltaMs: number;
  reinitAnchorEpsilon: number;
}

/** Default rope tuning for cable preview. Units are mm and ms. */
export const CABLE_PHYSICS_DEFAULT_CONFIG: CablePhysicsConfig = {
  numParticles: 20,
  gravity: 0.4,
  damping: 0.2,
  constraintIters: 10,
  slack: 0.001,
  minSegRest: 2,
  simStepMs: 1000 / 60,
  maxSubstepsPerFrame: 4,
  maxFrameDeltaMs: 100,
  reinitAnchorEpsilon: 1,
};

export function createCablePhysicsState(): CablePhysicsState {
  return {
    particles: [],
    accumulatorMs: 0,
    lastTimestampMs: null,
    prevAnchorA: null,
  };
}

/** Build a straight chain from anchor A to anchor B. */
export function initCablePhysicsChain(
  a: Point,
  b: Point,
  numParticles = CABLE_PHYSICS_DEFAULT_CONFIG.numParticles
): CableParticle[] {
  const out: CableParticle[] = [];
  for (let i = 0; i < numParticles; i += 1) {
    const t = i / (numParticles - 1);
    const x = a.x + (b.x - a.x) * t;
    const y = a.y + (b.y - a.y) * t;
    out.push({ x, y, prevX: x, prevY: y });
  }
  return out;
}

/** Convert particle coordinates to plain canvas points for rendering. */
export function cablePhysicsParticlesToPoints(particles: CableParticle[]): Point[] {
  return particles.map((particle) => ({ x: particle.x, y: particle.y }));
}

/** Maximum per-index displacement between two point arrays; Infinity when lengths differ. */
export function maxPointDelta(a: Point[], b: Point[]): number {
  if (a.length !== b.length) return Infinity;
  let max = 0;
  for (let idx = 0; idx < a.length; idx += 1) {
    const dx = b[idx].x - a[idx].x;
    const dy = b[idx].y - a[idx].y;
    const delta = Math.hypot(dx, dy);
    if (delta > max) max = delta;
  }
  return max;
}

/** Deterministic frame advance: given previous state + anchors + timestamp, returns next state. */
export function advanceCablePhysics(
  state: CablePhysicsState,
  anchorA: Point,
  anchorB: Point,
  timestampMs: number,
  config: CablePhysicsConfig = CABLE_PHYSICS_DEFAULT_CONFIG
): CablePhysicsState {
  const shouldReinit =
    state.particles.length === 0 ||
    !state.prevAnchorA ||
    Math.hypot(anchorA.x - state.prevAnchorA.x, anchorA.y - state.prevAnchorA.y) > config.reinitAnchorEpsilon;

  const baseParticles = shouldReinit
    ? initCablePhysicsChain(anchorA, anchorB, config.numParticles)
    : cloneParticles(state.particles);

  let lastTimestampMs = state.lastTimestampMs;
  if (lastTimestampMs == null) {
    lastTimestampMs = timestampMs;
  }

  const deltaMs = Math.min(Math.max(timestampMs - lastTimestampMs, 0), config.maxFrameDeltaMs);
  let accumulatorMs = state.accumulatorMs + deltaMs;

  let particles = baseParticles;
  let substeps = 0;
  while (accumulatorMs >= config.simStepMs && substeps < config.maxSubstepsPerFrame) {
    particles = simulateCablePhysicsStep(particles, anchorA, anchorB, config);
    accumulatorMs -= config.simStepMs;
    substeps += 1;
  }

  if (substeps === config.maxSubstepsPerFrame) {
    accumulatorMs = Math.min(accumulatorMs, config.simStepMs);
  }

  if (substeps === 0) {
    particles = pinCablePhysicsEndpoints(particles, anchorA, anchorB);
  }

  return {
    particles,
    accumulatorMs,
    lastTimestampMs: timestampMs,
    prevAnchorA: { x: anchorA.x, y: anchorA.y },
  };
}

function cloneParticles(particles: CableParticle[]): CableParticle[] {
  return particles.map((particle) => ({ ...particle }));
}

function pinCablePhysicsEndpoints(particles: CableParticle[], a: Point, b: Point): CableParticle[] {
  if (particles.length < 2) return particles;
  const next = cloneParticles(particles);
  const lastIdx = next.length - 1;
  next[0].x = a.x;
  next[0].y = a.y;
  next[0].prevX = a.x;
  next[0].prevY = a.y;
  next[lastIdx].x = b.x;
  next[lastIdx].y = b.y;
  next[lastIdx].prevX = b.x;
  next[lastIdx].prevY = b.y;
  return next;
}

function simulateCablePhysicsStep(
  particles: CableParticle[],
  anchorA: Point,
  anchorB: Point,
  config: CablePhysicsConfig
): CableParticle[] {
  const next = pinCablePhysicsEndpoints(particles, anchorA, anchorB);
  const n = next.length;
  if (n < 2) return next;
  const lastIdx = n - 1;

  for (let idx = 1; idx < lastIdx; idx += 1) {
    const particle = next[idx];
    const vx = (particle.x - particle.prevX) * config.damping;
    const vy = (particle.y - particle.prevY) * config.damping;
    particle.prevX = particle.x;
    particle.prevY = particle.y;
    particle.x += vx;
    particle.y += vy + config.gravity;
  }

  const dist = Math.hypot(anchorB.x - anchorA.x, anchorB.y - anchorA.y);
  const segRest = Math.max((dist * config.slack) / (n - 1), config.minSegRest);

  for (let iter = 0; iter < config.constraintIters; iter += 1) {
    for (let idx = 0; idx < n - 1; idx += 1) {
      const p1 = next[idx];
      const p2 = next[idx + 1];
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const d = Math.hypot(dx, dy);
      if (d < 0.001) continue;
      const diff = (segRest - d) / d;
      const ox = dx * diff * 0.5;
      const oy = dy * diff * 0.5;
      if (idx !== 0) {
        p1.x -= ox;
        p1.y -= oy;
      }
      if (idx + 1 !== lastIdx) {
        p2.x += ox;
        p2.y += oy;
      }
    }
  }

  return pinCablePhysicsEndpoints(next, anchorA, anchorB);
}
