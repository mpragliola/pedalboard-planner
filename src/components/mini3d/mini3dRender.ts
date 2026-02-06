/**
 * Mini3D render helpers: projection, convergence, and canvas layout.
 */

import { DEFAULT_OBJECT_COLOR } from "../../constants";
import { normalizeRotation } from "../../lib/geometry";
import { clamp, easeOutCubic } from "../../lib/math";
import { parseColor } from "../../lib/color";
import { getDirectionalOffset } from "../../lib/geometry2d";
import { getBounds2DOfPointSets } from "../../lib/bounds";
import { resolveImageSrc } from "./mini3dAssets";
import {
  vec3Dot,
  vec3Normalize,
  createCamera,
  projectPerspective,
  faceDepth,
  depthForPoint,
  faceNormal,
  isFaceVisible,
} from "../../lib/geometry3d";
import type { Vec3 } from "../../lib/vector";
import {
  FALLBACK_COLOR,
  MIN_PITCH,
  MAX_PITCH,
  getSceneMetrics,
  type Face,
  type StackedObject,
} from "./mini3dMath";

const CANVAS_PADDING = 12;
const FACE_SORT_EPS = 1e-4;
const CONVERGENCE_DURATION = 600;
const PER_COMPONENT_DELAY = 40;
const OFFSET_DISTANCE = 80;

export type RenderFace = Face & { order: number };
export type Size = { width: number; height: number };
export type Bounds = { minX: number; minY: number; maxX: number; maxY: number };
export type CanvasTransform = { scale: number; offsetX: number; offsetY: number };

export function sortFacesByDepth(faces: RenderFace[]): void {
  // Stable-ish depth sort to reduce flicker when faces are nearly co-planar.
  faces.sort((a, b) => {
    const byMax = b.maxDepth - a.maxDepth;
    if (Math.abs(byMax) > FACE_SORT_EPS) return byMax;
    const byDepth = b.depth - a.depth;
    if (Math.abs(byDepth) > FACE_SORT_EPS) return byDepth;
    return a.order - b.order;
  });
}

export function getFacesBounds(faces: RenderFace[]): Bounds | null {
  return getBounds2DOfPointSets(faces.map((face) => face.points));
}

export function computeCanvasTransform(bounds: Bounds, size: Size): CanvasTransform | null {
  const contentW = bounds.maxX - bounds.minX;
  const contentH = bounds.maxY - bounds.minY;
  if (contentW <= 0 || contentH <= 0) return null;
  const scale = Math.min(
    (size.width - CANVAS_PADDING * 2) / contentW,
    (size.height - CANVAS_PADDING * 2) / contentH
  );
  if (!Number.isFinite(scale) || scale <= 0) return null;
  const offsetX =
    CANVAS_PADDING + (size.width - CANVAS_PADDING * 2 - contentW * scale) / 2 - bounds.minX * scale;
  const offsetY =
    CANVAS_PADDING + (size.height - CANVAS_PADDING * 2 - contentH * scale) / 2 - bounds.minY * scale;
  return { scale, offsetX, offsetY };
}

export function prepareCanvas(
  canvas: HTMLCanvasElement,
  size: Size,
  dpr: number
): CanvasRenderingContext2D | null {
  const targetW = Math.max(1, Math.floor(size.width * dpr));
  const targetH = Math.max(1, Math.floor(size.height * dpr));
  if (canvas.width !== targetW) canvas.width = targetW;
  if (canvas.height !== targetH) canvas.height = targetH;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  return ctx;
}

export function getConvergenceTotal(count: number): number {
  return CONVERGENCE_DURATION + Math.max(0, count - 1) * PER_COMPONENT_DELAY;
}

export function applyConvergence(
  time: number,
  stackedTargets: StackedObject[],
  startTime: number,
  opening: boolean
): StackedObject[] {
  if (stackedTargets.length === 0) return stackedTargets;
  const metrics = getSceneMetrics(stackedTargets);
  return stackedTargets.map((item, index) => {
    const elapsed = time - startTime - index * PER_COMPONENT_DELAY;
    const t = clamp(elapsed / CONVERGENCE_DURATION, 0, 1);
    const progress = opening ? 1 - easeOutCubic(t) : easeOutCubic(t);
    if (progress <= 0) return item;

    // Move each item toward/away from the scene center for convergence.
    const centerX = item.obj.x + item.width / 2;
    const centerY = item.obj.y + item.depth / 2;
    const { offsetX, offsetY } = getDirectionalOffset(
      centerX - metrics.center.x,
      centerY - metrics.center.y,
      OFFSET_DISTANCE * progress
    );
    if (offsetX === 0 && offsetY === 0) return item;
    return {
      ...item,
      obj: { ...item.obj, x: item.obj.x + offsetX, y: item.obj.y + offsetY },
    };
  });
}

export function buildFaces(stacked: StackedObject[], yaw: number, pitchOffset: number): RenderFace[] {
  // Convert stacked objects into renderable faces for the current camera angle.
  const metrics = getSceneMetrics(stacked);
  const pitch = clamp(metrics.basePitch + pitchOffset, MIN_PITCH, MAX_PITCH);
  const camera = createCamera(metrics.center, metrics.radius, yaw, pitch);
  const lightDir = vec3Normalize({ x: -0.4, y: -0.6, z: 1 });
  const faces: RenderFace[] = [];
  let order = 0;

  for (const data of stacked) {
    const { obj, width, depth, height, baseZ } = data;
    const rotation = (normalizeRotation(obj.rotation ?? 0) * Math.PI) / 180;
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);
    const cx = obj.x + width / 2;
    const cy = obj.y + depth / 2;
    const depthFor = (p: Vec3) => depthForPoint(p, camera);

    // Build world-space corners for the object's base and top.
    const local = [
      { x: -width / 2, y: -depth / 2 },
      { x: width / 2, y: -depth / 2 },
      { x: width / 2, y: depth / 2 },
      { x: -width / 2, y: depth / 2 },
    ];
    const baseWorld = local.map((p) => ({
      x: cx + p.x * cos - p.y * sin,
      y: cy + p.x * sin + p.y * cos,
      z: baseZ,
    }));
    const topWorld = baseWorld.map((p) => ({ x: p.x, y: p.y, z: baseZ + height }));

    // Project world-space corners into camera space.
    const baseProj = baseWorld.map((p) => projectPerspective(p, camera));
    const topProj = topWorld.map((p) => projectPerspective(p, camera));

    const topDepths = topWorld.map(depthFor);
    const baseDepths = baseWorld.map(depthFor);
    const color = parseColor(obj.color ?? DEFAULT_OBJECT_COLOR) ?? FALLBACK_COLOR;
    const textureSrc = obj.image ? resolveImageSrc(obj.image) : null;
    const topUv = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 0, y: 1 },
    ];

    // Top face (optionally textured).
    const topNormal = faceNormal(topWorld[0], topWorld[1], topWorld[2]);
    if (isFaceVisible(topWorld, topNormal, camera)) {
      faces.push({
        points: topProj,
        depth: faceDepth(topWorld, camera),
        depths: topDepths,
        maxDepth: Math.max(...topDepths),
        kind: "top",
        color,
        shade: 1,
        textureSrc,
        uv: topUv,
        order: order++,
      });
    }

    // Bottom face (darker shading).
    const bottomNormal = faceNormal(baseWorld[2], baseWorld[1], baseWorld[0]);
    if (isFaceVisible(baseWorld, bottomNormal, camera)) {
      faces.push({
        points: baseProj,
        depth: faceDepth(baseWorld, camera),
        depths: baseDepths,
        maxDepth: Math.max(...baseDepths),
        kind: "bottom",
        color,
        shade: 0.6,
        order: order++,
      });
    }

    // Side faces with directional lighting.
    for (let i = 0; i < 4; i += 1) {
      const i2 = (i + 1) % 4;
      const world = [baseWorld[i], baseWorld[i2], topWorld[i2], topWorld[i]];
      const proj = [baseProj[i], baseProj[i2], topProj[i2], topProj[i]];
      const normal = faceNormal(world[0], world[1], world[2]);
      if (!isFaceVisible(world, normal, camera)) continue;
      const lit = Math.max(0, vec3Dot(normal, lightDir));
      const shadeValue = 0.5 + 0.5 * lit;
      const sideDepths = world.map(depthFor);
      faces.push({
        points: proj,
        depth: faceDepth(world, camera),
        depths: sideDepths,
        maxDepth: Math.max(...sideDepths),
        kind: "side",
        color,
        shade: shadeValue,
        order: order++,
      });
    }
  }
  return faces;
}
