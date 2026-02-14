/**
 * Custom 3D geometry builders for non-box shapes.
 *
 * Every geometry uses the same 6 material groups as THREE.BoxGeometry:
 *   0 = +X (right),  1 = -X (left),  2 = +Y (top),
 *   3 = -Y (bottom), 4 = +Z (front), 5 = -Z (back)
 *
 * Coordinate convention (centered at origin):
 *   X = width,  Y = height,  Z = depth
 *   -Y = bottom,  +Y = top,  +Z = front (toward user),  -Z = back
 *
 * All faces use CCW winding when viewed from outside the solid.
 * Verified face winding convention (cross-product checked):
 *   +X: front-bottom → back-bottom → back-top → front-top
 *   -X: back-bottom → front-bottom → front-top → back-top
 *   +Y: back-left → front-left → front-right → back-right
 *   -Y: back-left → back-right → front-right → front-left
 *   +Z: left-bottom → right-bottom → right-top → left-top
 *   -Z: right-bottom → left-bottom → left-top → right-top
 */
import * as THREE from "three";
import type { Shape3D } from "../../../shape3d";

// ── Cache ────────────────────────────────────────────────────────────

const cache = new Map<string, THREE.BufferGeometry>();

function cacheKey(w: number, h: number, d: number, shape: Shape3D): string {
  return JSON.stringify([w, h, d, shape]);
}

/** Get or build a BufferGeometry for the given shape + dimensions. */
export function getShapeGeometry(
  w: number, h: number, d: number, shape: Shape3D,
): THREE.BufferGeometry {
  if (shape.type === "box") return new THREE.BoxGeometry(w, h, d);
  const key = cacheKey(w, h, d, shape);
  let geom = cache.get(key);
  if (!geom) {
    geom = buildShapeGeometry(w, h, d, shape);
    cache.set(key, geom);
  }
  return geom;
}

export function clearShapeGeometryCache(): void {
  for (const geom of cache.values()) geom.dispose();
  cache.clear();
}

// ── Dispatcher ───────────────────────────────────────────────────────

function buildShapeGeometry(
  w: number, h: number, d: number, shape: Shape3D,
): THREE.BufferGeometry {
  switch (shape.type) {
    case "box":              return new THREE.BoxGeometry(w, h, d);
    case "wedge":            return buildWedge(w, h, d, shape.ratio);
    case "pedal-boss-type":  return buildBossType(w, h, d, shape.ratio);
    case "wah":              return buildWah(w, h, d);
    case "half-wedge":       return buildHalfWedge(w, h, d, shape.topRatio, shape.frontRatio);
    case "rail-wedge":       return buildRailWedge(w, h, d, shape.position, shape.rail, shape.ratio);
  }
}

// ── Helper types & utilities ─────────────────────────────────────────

type V3 = [number, number, number];
type V2 = [number, number];

/**
 * Accumulator for building indexed geometry with 6 material groups.
 * Call addFace() for each face, then finish() to get the BufferGeometry.
 */
class GeometryBuilder {
  private positions: number[] = [];
  private normals: number[] = [];
  private uvs: number[] = [];
  private indices: number[] = [];
  private groups: { start: number; count: number; materialIndex: number }[] = [];
  private vertexCount = 0;
  private indexCount = 0;

  /** Add a vertex, return its index. */
  private addVertex(pos: V3, normal: V3, uv: V2): number {
    this.positions.push(...pos);
    this.normals.push(...normal);
    this.uvs.push(...uv);
    return this.vertexCount++;
  }

  /**
   * Add a convex polygon face (3+ vertices) as a triangle fan.
   * Vertices must be in counter-clockwise order when viewed from outside.
   * materialIndex maps to the 6 boxGeometry material slots.
   */
  addFace(
    materialIndex: number,
    vertices: V3[],
    normal: V3,
    uvCoords: V2[],
  ): void {
    const start = this.indexCount;
    const idxBase = vertices.map((v, i) => this.addVertex(v, normal, uvCoords[i]));
    // Triangle fan: 0-1-2, 0-2-3, 0-3-4, ...
    for (let i = 1; i < vertices.length - 1; i++) {
      this.indices.push(idxBase[0], idxBase[i], idxBase[i + 1]);
    }
    const triCount = (vertices.length - 2) * 3;
    this.indexCount += triCount;

    // Merge with previous group if same material (keeps group count at 6).
    const prev = this.groups.length > 0 ? this.groups[this.groups.length - 1] : null;
    if (prev && prev.materialIndex === materialIndex && prev.start + prev.count === start) {
      prev.count += triCount;
    } else {
      this.groups.push({ start, count: triCount, materialIndex });
    }
  }

  finish(): THREE.BufferGeometry {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(this.positions, 3));
    geo.setAttribute("normal", new THREE.Float32BufferAttribute(this.normals, 3));
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(this.uvs, 2));
    geo.setIndex(this.indices);
    for (const g of this.groups) {
      geo.addGroup(g.start, g.count, g.materialIndex);
    }
    return geo;
  }
}

/** Compute the outward unit normal for a CCW-wound triangle. */
function triNormal(a: V3, b: V3, c: V3): V3 {
  const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2];
  const vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
  const nx = uy * vz - uz * vy;
  const ny = uz * vx - ux * vz;
  const nz = ux * vy - uy * vx;
  const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
  return [nx / len, ny / len, nz / len];
}

/**
 * Orthographic top-down UV: maps X→u, Z→v, ignoring Y.
 * THREE textures loaded via TextureLoader default to flipY=true, so we invert
 * V here to keep top images aligned with 2D canvas orientation.
 */
function topUV(x: number, z: number, hw: number, hd: number): V2 {
  const u = (x + hw) / (2 * hw);
  const v = 1 - (z + hd) / (2 * hd);
  return [u, v];
}

// ── WEDGE ────────────────────────────────────────────────────────────
// Side profile: back full height, front = height * ratio.
//
//   v4 ---- v5          (y = +h/2,  z = -d/2)  back top
//   /        \
//  v6 ------ v7         (y = yf,    z = +d/2)  front top
//  v2 ------ v3         (y = -h/2,  z = +d/2)  front bottom
//  v0 ------ v1         (y = -h/2,  z = -d/2)  back bottom

function buildWedge(w: number, h: number, d: number, ratio: number): THREE.BufferGeometry {
  const hw = w / 2, hh = h / 2, hd = d / 2;
  const yf = -hh + h * ratio; // front top Y

  const v0: V3 = [-hw, -hh, -hd]; // bottom-back-left
  const v1: V3 = [+hw, -hh, -hd]; // bottom-back-right
  const v2: V3 = [-hw, -hh, +hd]; // bottom-front-left
  const v3: V3 = [+hw, -hh, +hd]; // bottom-front-right
  const v4: V3 = [-hw, +hh, -hd]; // top-back-left
  const v5: V3 = [+hw, +hh, -hd]; // top-back-right
  const v6: V3 = [-hw, yf,  +hd]; // top-front-left
  const v7: V3 = [+hw, yf,  +hd]; // top-front-right

  const b = new GeometryBuilder();
  const topN = triNormal(v4, v6, v7);

  // +X right: front-bottom → back-bottom → back-top → front-top
  b.addFace(0, [v3, v1, v5, v7], [1, 0, 0],
    [[0, 0], [1, 0], [1, 1], [0, 1]]);
  // -X left: back-bottom → front-bottom → front-top → back-top
  b.addFace(1, [v0, v2, v6, v4], [-1, 0, 0],
    [[0, 0], [1, 0], [1, 1], [0, 1]]);
  // +Y top (sloped): back-left → front-left → front-right → back-right
  b.addFace(2, [v4, v6, v7, v5], topN,
    [topUV(-hw, -hd, hw, hd), topUV(-hw, +hd, hw, hd), topUV(+hw, +hd, hw, hd), topUV(+hw, -hd, hw, hd)]);
  // -Y bottom: back-left → back-right → front-right → front-left
  b.addFace(3, [v0, v1, v3, v2], [0, -1, 0],
    [[0, 0], [1, 0], [1, 1], [0, 1]]);
  // +Z front: left-bottom → right-bottom → right-top → left-top
  b.addFace(4, [v2, v3, v7, v6], [0, 0, 1],
    [[0, 0], [1, 0], [1, 1], [0, 1]]);
  // -Z back: right-bottom → left-bottom → left-top → right-top
  b.addFace(5, [v1, v0, v4, v5], [0, 0, -1],
    [[0, 0], [1, 0], [1, 1], [0, 1]]);

  return b.finish();
}

// ── BOSS-TYPE PEDAL ──────────────────────────────────────────────────
// Cross section (side view, front=left, back=right):
//            --------
//            |      |
//   ---------|      |
//   |               |
//   |----------------|
//
// Front (+Z, toward user) = higher platform.
// Back (-Z) = lower platform (back upper part "subtracted").
// ratio = fraction of depth occupied by the lower back platform.
// Step height: front top is at 60% of full height.

const BOSS_STEP_HEIGHT = 0.6;

function buildBossType(w: number, h: number, d: number, ratio: number): THREE.BufferGeometry {
  const hw = w / 2, hh = h / 2, hd = d / 2;
  const stepZ = -hd + d * ratio; // Z where step occurs
  const yBack = -hh + h * BOSS_STEP_HEIGHT; // back platform top Y (lower)

  // Bottom 4
  const v0: V3 = [-hw, -hh, -hd]; // back-left
  const v1: V3 = [+hw, -hh, -hd]; // back-right
  const v2: V3 = [-hw, -hh, +hd]; // front-left
  const v3: V3 = [+hw, -hh, +hd]; // front-right
  // Back top 2 (lower platform)
  const v4: V3 = [-hw, yBack, -hd];
  const v5: V3 = [+hw, yBack, -hd];
  // Step edge low (back platform height)
  const v6: V3 = [-hw, yBack, stepZ];
  const v7: V3 = [+hw, yBack, stepZ];
  // Step edge high (front platform height)
  const v8: V3 = [-hw, +hh, stepZ];
  const v9: V3 = [+hw, +hh, stepZ];
  // Front top (full height)
  const v10: V3 = [-hw, +hh, +hd];
  const v11: V3 = [+hw, +hh, +hd];

  const b = new GeometryBuilder();

  // +X right: L-shaped hex, front-bottom → back-bottom → back-top → step-high → step-low → front-top
  b.addFace(0, [v3, v1, v5, v7, v9, v11], [1, 0, 0],
    [[0, 0], [1, 0], [1, 1], [0.55, 1], [0.55, 0.6], [0, 0.6]]);
  // -X left: L-shaped hex, back-bottom → front-bottom → front-top → step-low → step-high → back-top
  b.addFace(1, [v0, v2, v10, v8, v6, v4], [-1, 0, 0],
    [[0, 0], [1, 0], [1, 0.6], [0.45, 0.6], [0.45, 1], [0, 1]]);
  // +Y top back: back-left → front-left → front-right → back-right
  b.addFace(2, [v4, v6, v7, v5], [0, 1, 0],
    [topUV(-hw, -hd, hw, hd), topUV(-hw, stepZ, hw, hd), topUV(+hw, stepZ, hw, hd), topUV(+hw, -hd, hw, hd)]);
  // +Y top front (higher platform): left → front-left → front-right → right
  b.addFace(2, [v8, v10, v11, v9], [0, 1, 0],
    [topUV(-hw, stepZ, hw, hd), topUV(-hw, +hd, hw, hd), topUV(+hw, +hd, hw, hd), topUV(+hw, stepZ, hw, hd)]);
  // -Y bottom
  b.addFace(3, [v0, v1, v3, v2], [0, -1, 0],
    [[0, 0], [1, 0], [1, 1], [0, 1]]);
  // +Z front face (shorter): left-bottom → right-bottom → right-top → left-top
  b.addFace(4, [v2, v3, v11, v10], [0, 0, 1],
    [[0, 0], [1, 0], [1, 1], [0, 1]]);
  // -Z step face (vertical rise from back to front): left-high → right-high → right-low → left-low
  b.addFace(5, [v8, v9, v7, v6], [0, 0, -1],
    [[0, 0], [1, 0], [1, 1], [0, 1]]);
  // -Z back: right-bottom → left-bottom → left-top → right-top
  b.addFace(5, [v1, v0, v4, v5], [0, 0, -1],
    [[0, 0], [1, 0], [1, 1], [0, 1]]);

  return b.finish();
}

// ── WAH ──────────────────────────────────────────────────────────────
// Top face narrows toward front: front edge = 80% width.
// Bottom stays full width. Side faces are non-planar quads.

const WAH_TAPER = 0.8;

function buildWah(w: number, h: number, d: number): THREE.BufferGeometry {
  const hw = w / 2, hh = h / 2, hd = d / 2;
  const fhw = hw * WAH_TAPER; // front half-width (narrower)

  // Bottom 4 (full width)
  const v0: V3 = [-hw,  -hh, -hd];
  const v1: V3 = [+hw,  -hh, -hd];
  const v2: V3 = [-hw,  -hh, +hd];
  const v3: V3 = [+hw,  -hh, +hd];
  // Top back 2 (full width)
  const v4: V3 = [-hw,  +hh, -hd];
  const v5: V3 = [+hw,  +hh, -hd];
  // Top front 2 (narrower)
  const v6: V3 = [-fhw, +hh, +hd];
  const v7: V3 = [+fhw, +hh, +hd];

  const b = new GeometryBuilder();

  // +X right (non-planar quad): front-bottom → back-bottom → back-top → front-top
  const rightN = triNormal(v3, v1, v5);
  b.addFace(0, [v3, v1, v5, v7], rightN,
    [[0, 0], [1, 0], [1, 1], [0, 1]]);
  // -X left (non-planar quad): back-bottom → front-bottom → front-top → back-top
  const leftN = triNormal(v0, v2, v6);
  b.addFace(1, [v0, v2, v6, v4], leftN,
    [[0, 0], [1, 0], [1, 1], [0, 1]]);
  // +Y top (trapezoid): back-left → front-left → front-right → back-right
  b.addFace(2, [v4, v6, v7, v5], [0, 1, 0],
    [topUV(-hw, -hd, hw, hd), topUV(-fhw, +hd, hw, hd), topUV(+fhw, +hd, hw, hd), topUV(+hw, -hd, hw, hd)]);
  // -Y bottom
  b.addFace(3, [v0, v1, v3, v2], [0, -1, 0],
    [[0, 0], [1, 0], [1, 1], [0, 1]]);
  // +Z front (narrower): left-bottom → right-bottom → right-top → left-top
  b.addFace(4, [v2, v3, v7, v6], [0, 0, 1],
    [[0, 0], [1, 0], [1, 1], [0, 1]]);
  // -Z back: right-bottom → left-bottom → left-top → right-top
  b.addFace(5, [v1, v0, v4, v5], [0, 0, -1],
    [[0, 0], [1, 0], [1, 1], [0, 1]]);

  return b.finish();
}

// ── HALF-WEDGE ───────────────────────────────────────────────────────
// Top face: back portion flat, front portion slopes down.
//   topRatio = fraction of depth that is tilted (from front)
//   frontRatio = front top height / full height
//
// Side view:
//   --------+
//            \
//             |
//   ----------

function buildHalfWedge(
  w: number, h: number, d: number,
  topRatio: number, frontRatio: number,
): THREE.BufferGeometry {
  const hw = w / 2, hh = h / 2, hd = d / 2;
  const tiltZ = -hd + d * (1 - topRatio); // Z where tilt begins
  const yf = -hh + h * frontRatio; // front top Y

  // Bottom 4
  const v0: V3 = [-hw, -hh, -hd];
  const v1: V3 = [+hw, -hh, -hd];
  const v2: V3 = [-hw, -hh, +hd];
  const v3: V3 = [+hw, -hh, +hd];
  // Top back
  const v4: V3 = [-hw, +hh, -hd];
  const v5: V3 = [+hw, +hh, -hd];
  // Tilt transition (still at full height)
  const v6: V3 = [-hw, +hh, tiltZ];
  const v7: V3 = [+hw, +hh, tiltZ];
  // Front top (lower)
  const v8: V3 = [-hw, yf, +hd];
  const v9: V3 = [+hw, yf, +hd];

  const b = new GeometryBuilder();
  const slopeN = triNormal(v6, v8, v9);

  // +X right (pentagon): front-bottom → back-bottom → back-top → tilt-start → front-top
  b.addFace(0, [v3, v1, v5, v7, v9], [1, 0, 0],
    [[0, 0], [1, 0], [1, 1], [0.5, 1], [0, 0.5]]);
  // -X left (pentagon): back-bottom → front-bottom → front-top → tilt-start → back-top
  b.addFace(1, [v0, v2, v8, v6, v4], [-1, 0, 0],
    [[0, 0], [1, 0], [1, 0.5], [0.5, 1], [0, 1]]);
  // +Y flat top: back-left → front-left → front-right → back-right
  b.addFace(2, [v4, v6, v7, v5], [0, 1, 0],
    [topUV(-hw, -hd, hw, hd), topUV(-hw, tiltZ, hw, hd), topUV(+hw, tiltZ, hw, hd), topUV(+hw, -hd, hw, hd)]);
  // +Y tilted top: tilt-left → front-left → front-right → tilt-right
  b.addFace(2, [v6, v8, v9, v7], slopeN,
    [topUV(-hw, tiltZ, hw, hd), topUV(-hw, +hd, hw, hd), topUV(+hw, +hd, hw, hd), topUV(+hw, tiltZ, hw, hd)]);
  // -Y bottom
  b.addFace(3, [v0, v1, v3, v2], [0, -1, 0],
    [[0, 0], [1, 0], [1, 1], [0, 1]]);
  // +Z front: left-bottom → right-bottom → right-top → left-top
  b.addFace(4, [v2, v3, v9, v8], [0, 0, 1],
    [[0, 0], [1, 0], [1, 1], [0, 1]]);
  // -Z back: right-bottom → left-bottom → left-top → right-top
  b.addFace(5, [v1, v0, v4, v5], [0, 0, -1],
    [[0, 0], [1, 0], [1, 1], [0, 1]]);

  return b.finish();
}

// ── RAIL-WEDGE ───────────────────────────────────────────────────────
// Wedge with a flat horizontal rail band on the tilted surface.
//   position = rail distance from top edge (fraction of depth)
//   rail = rail size (fraction of depth)
//   ratio = front/back height ratio (same as wedge)
//
// Side view:
//   \           <- upper slope
//    ------     <- rail (horizontal)
//          \    <- lower slope

function buildRailWedge(
  w: number, h: number, d: number,
  position: number, rail: number, ratio: number,
): THREE.BufferGeometry {
  const hw = w / 2, hh = h / 2, hd = d / 2;

  // Height at any depth fraction f (0 = back, 1 = front):
  const railStart = position;
  const railEnd = position + rail;
  const railY = hh - railStart * h * (1 - ratio);

  const zRailStart = -hd + d * railStart;
  const zRailEnd = -hd + d * railEnd;
  const yf = -hh + h * ratio; // front top Y

  // Bottom 4
  const v0: V3 = [-hw, -hh, -hd];
  const v1: V3 = [+hw, -hh, -hd];
  const v2: V3 = [-hw, -hh, +hd];
  const v3: V3 = [+hw, -hh, +hd];
  // Top back
  const v4: V3 = [-hw, +hh, -hd];
  const v5: V3 = [+hw, +hh, -hd];
  // Rail start
  const v6: V3 = [-hw, railY, zRailStart];
  const v7: V3 = [+hw, railY, zRailStart];
  // Rail end
  const v8: V3 = [-hw, railY, zRailEnd];
  const v9: V3 = [+hw, railY, zRailEnd];
  // Front top
  const v10: V3 = [-hw, yf, +hd];
  const v11: V3 = [+hw, yf, +hd];

  const b = new GeometryBuilder();
  const upperSlopeN = triNormal(v4, v6, v7);
  const lowerSlopeN = triNormal(v8, v10, v11);

  // +X right (hexagon): front-bottom → back-bottom → back-top → rail-start → rail-end → front-top
  b.addFace(0, [v3, v1, v5, v7, v9, v11], [1, 0, 0],
    [[0, 0], [1, 0], [1, 1], [0.5, 0.8], [0.6, 0.8], [0, 0.3]]);
  // -X left (hexagon): back-bottom → front-bottom → front-top → rail-end → rail-start → back-top
  b.addFace(1, [v0, v2, v10, v8, v6, v4], [-1, 0, 0],
    [[0, 0], [1, 0], [1, 0.3], [0.4, 0.8], [0.5, 0.8], [0, 1]]);
  // +Y upper slope: back-left → front-left → front-right → back-right
  b.addFace(2, [v4, v6, v7, v5], upperSlopeN,
    [topUV(-hw, -hd, hw, hd), topUV(-hw, zRailStart, hw, hd), topUV(+hw, zRailStart, hw, hd), topUV(+hw, -hd, hw, hd)]);
  // +Y rail (flat): left → front-left → front-right → right
  b.addFace(2, [v6, v8, v9, v7], [0, 1, 0],
    [topUV(-hw, zRailStart, hw, hd), topUV(-hw, zRailEnd, hw, hd), topUV(+hw, zRailEnd, hw, hd), topUV(+hw, zRailStart, hw, hd)]);
  // +Y lower slope
  b.addFace(2, [v8, v10, v11, v9], lowerSlopeN,
    [topUV(-hw, zRailEnd, hw, hd), topUV(-hw, +hd, hw, hd), topUV(+hw, +hd, hw, hd), topUV(+hw, zRailEnd, hw, hd)]);
  // -Y bottom
  b.addFace(3, [v0, v1, v3, v2], [0, -1, 0],
    [[0, 0], [1, 0], [1, 1], [0, 1]]);
  // +Z front: left-bottom → right-bottom → right-top → left-top
  b.addFace(4, [v2, v3, v11, v10], [0, 0, 1],
    [[0, 0], [1, 0], [1, 1], [0, 1]]);
  // -Z back: right-bottom → left-bottom → left-top → right-top
  b.addFace(5, [v1, v0, v4, v5], [0, 0, -1],
    [[0, 0], [1, 0], [1, 1], [0, 1]]);

  return b.finish();
}
