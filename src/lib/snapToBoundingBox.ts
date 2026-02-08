/** Object snapping helpers based on axis-aligned bounding boxes. */
import { normalizeRotation } from "./geometry";
import { closestPointOnRectPerimeter } from "./geometry2d";
import type { CanvasObjectType } from "../types";
import type { Point } from "./vector";

/** Axis-aligned rectangle in canvas coordinates. */
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
  const left = obj.pos.x + (width - bboxW) / 2;
  const top = obj.pos.y + (depth - bboxH) / 2;
  return { left, top, width: bboxW, height: bboxH };
}

/** Closest point on the perimeter of a rectangle to (px, py). */
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
): Point {
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
