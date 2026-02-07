/**
 * Mini3D-specific math and layout helpers.
 */

import { getObjectDimensions } from "../../lib/stateManager";
import { normalizeRotation } from "../../lib/geometry";
import { rectsOverlap, type Rect } from "../../lib/geometry2d";
import { getBounds2DCenter, getBounds2DOfRects, getBounds2DSize } from "../../lib/bounds";
import type { Vec2 } from "../../lib/vector";
import type { Rgb } from "../../lib/color";
import type { CanvasObjectType } from "../../types";

export interface StackedObject {
  obj: CanvasObjectType;
  width: number;
  depth: number;
  height: number;
  baseZ: number;
  rect: Rect;
}

export interface SceneMetrics {
  center: Vec2;
  width: number;
  depth: number;
  maxZ: number;
  maxDim: number;
}

export const FALLBACK_COLOR: Rgb = { r: 72, g: 72, b: 82 };
export const DEFAULT_CAMERA_YAW = -Math.PI / 4;
export const MIN_PITCH = 0.15;
export const MAX_PITCH = 1.2;
export const PITCH_OFFSET_MIN = -1.1;
export const PITCH_OFFSET_MAX = 1.1;
const CONVERGENCE_DURATION = 800;
export const PER_COMPONENT_DELAY = 40;
export const CONVERGENCE_OFFSET_DISTANCE = 180;

export function getConvergenceTotal(count: number): number {
  return CONVERGENCE_DURATION + Math.max(0, count - 1) * PER_COMPONENT_DELAY;
}

export function getFootprintRect(
  obj: CanvasObjectType
): { rect: Rect; width: number; depth: number; height: number } | null {
  const [width, depth, rawHeight] = getObjectDimensions(obj);
  if (width <= 0 || depth <= 0) return null;

  const height = Math.max(0, rawHeight);
  const rotation = normalizeRotation(obj.rotation ?? 0);
  const is90or270 = rotation === 90 || rotation === 270;
  const bboxW = is90or270 ? depth : width;
  const bboxH = is90or270 ? width : depth;
  const left = obj.pos.x + (width - bboxW) / 2;
  const top = obj.pos.y + (depth - bboxH) / 2;

  return {
    rect: { minX: left, minY: top, maxX: left + bboxW, maxY: top + bboxH },
    width,
    depth,
    height,
  };
}

export function computeStackedObjects(objects: CanvasObjectType[]): StackedObject[] {
  const stacked: StackedObject[] = [];

  for (const obj of objects) {
    const footprint = getFootprintRect(obj);
    if (!footprint) continue;

    let baseZ = 0;
    for (const below of stacked) {
      if (rectsOverlap(footprint.rect, below.rect)) {
        baseZ = Math.max(baseZ, below.baseZ + below.height);
      }
    }

    stacked.push({
      obj,
      width: footprint.width,
      depth: footprint.depth,
      height: footprint.height,
      baseZ,
      rect: footprint.rect,
    });
  }

  return stacked;
}

export function getSceneMetrics(stacked: StackedObject[]): SceneMetrics {
  if (stacked.length === 0) {
    return {
      center: { x: 0, y: 0 },
      width: 1,
      depth: 1,
      maxZ: 1,
      maxDim: 1,
    };
  }

  const footprintBounds = getBounds2DOfRects(stacked.map((item) => item.rect));
  if (!footprintBounds) {
    return {
      center: { x: 0, y: 0 },
      width: 1,
      depth: 1,
      maxZ: 1,
      maxDim: 1,
    };
  }

  const center = getBounds2DCenter(footprintBounds);
  const size = getBounds2DSize(footprintBounds);

  let maxZ = 0;
  for (const item of stacked) {
    maxZ = Math.max(maxZ, item.baseZ + item.height);
  }

  const width = Math.max(1, size.width);
  const depth = Math.max(1, size.height);
  const normalizedMaxZ = Math.max(1, maxZ);

  return {
    center,
    width,
    depth,
    maxZ: normalizedMaxZ,
    maxDim: Math.max(width, depth, normalizedMaxZ),
  };
}
