import { normalizeRotation } from "./geometry";
import type { CanvasObjectType } from "../types";

export interface Aabb {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** Get axis-aligned bounding box of an object in canvas coordinates (same logic as centerView). */
export function getObjectAabb(
  obj: CanvasObjectType,
  getObjectDimensions: (o: CanvasObjectType) => [number, number, number]
): Aabb {
  const [width, depth] = getObjectDimensions(obj);
  const rotation = normalizeRotation(obj.rotation ?? 0);
  const is90or270 = rotation === 90 || rotation === 270;
  const bboxW = is90or270 ? depth : width;
  const bboxH = is90or270 ? width : depth;
  const left = obj.x + (width - bboxW) / 2;
  const top = obj.y + (depth - bboxH) / 2;
  return { left, top, width: bboxW, height: bboxH };
}

/** Closest point on the perimeter of a rectangle to (px, py). */
export function closestPointOnRectPerimeter(
  px: number,
  py: number,
  left: number,
  top: number,
  w: number,
  h: number
): { x: number; y: number } {
  const right = left + w;
  const bottom = top + h;
  const cx = Math.max(left, Math.min(right, px));
  const cy = Math.max(top, Math.min(bottom, py));
  const inside = px > left && px < right && py > top && py < bottom;
  if (inside) {
    const dl = cx - left;
    const dr = right - cx;
    const dt = cy - top;
    const db = bottom - cy;
    const minHoriz = Math.min(dl, dr);
    const minVert = Math.min(dt, db);
    if (minHoriz <= minVert) {
      return { x: px < left + w / 2 ? left : right, y: cy };
    }
    return { x: cx, y: py < top + h / 2 ? top : bottom };
  }
  return { x: cx, y: cy };
}

/** Default snap tolerance in canvas units (mm). Only snap when within this distance of an edge. */
export const SNAP_TOLERANCE_MM = 10;

/**
 * Snap (canvasX, canvasY) to the nearest point on any object's AABB perimeter when within tolerance.
 * If no objects or closest point is beyond tolerance, return the original point.
 */
export function snapToObjects(
  canvasX: number,
  canvasY: number,
  objects: CanvasObjectType[],
  getObjectDimensions: (o: CanvasObjectType) => [number, number, number],
  toleranceMm: number = SNAP_TOLERANCE_MM
): { x: number; y: number } {
  if (objects.length === 0) return { x: canvasX, y: canvasY };
  const maxDistSq = toleranceMm * toleranceMm;
  let bestX = canvasX;
  let bestY = canvasY;
  let bestDistSq = Infinity;
  for (const obj of objects) {
    const aabb = getObjectAabb(obj, getObjectDimensions);
    const { x, y } = closestPointOnRectPerimeter(canvasX, canvasY, aabb.left, aabb.top, aabb.width, aabb.height);
    const dx = x - canvasX;
    const dy = y - canvasY;
    const dSq = dx * dx + dy * dy;
    if (dSq < bestDistSq) {
      bestDistSq = dSq;
      bestX = x;
      bestY = y;
    }
  }
  if (bestDistSq > maxDistSq) return { x: canvasX, y: canvasY };
  return { x: bestX, y: bestY };
}
