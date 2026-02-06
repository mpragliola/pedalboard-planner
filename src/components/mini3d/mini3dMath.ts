/**
 * Mini3D-specific math and layout helpers.
 * Generic math utilities live in src/lib.
 */

import { getObjectDimensions } from "../../lib/stateManager";
import { normalizeRotation } from "../../lib/geometry";
import { rectsOverlap, type Rect } from "../../lib/geometry2d";
import type { Vec2, Vec3 } from "../../lib/vector";
import type { Rgb } from "../../lib/color";
import { BASE_URL } from "../../constants";
import type { CanvasObjectType } from "../../types";

// ============================================================================
// Type Definitions
// ============================================================================

export type ImageCacheEntry = HTMLImageElement | "error";
export type ZAnimState = { current: number; target: number };

export interface Face {
  points: Vec2[];
  depth: number;
  depths: number[];
  maxDepth: number;
  kind: "top" | "bottom" | "side";
  color: Rgb;
  shade: number;
  textureSrc?: string | null;
  uv?: Vec2[];
}

export interface StackedObject {
  obj: CanvasObjectType;
  width: number;
  depth: number;
  height: number;
  baseZ: number;
  rect: Rect;
}

// ============================================================================
// Constants
// ============================================================================

export const FALLBACK_COLOR: Rgb = { r: 72, g: 72, b: 82 };
export const DEFAULT_CAMERA_YAW = -Math.PI / 4;
export const MIN_PITCH = 0.15;
export const MAX_PITCH = 1.2;
export const PITCH_OFFSET_MIN = -1.1;
export const PITCH_OFFSET_MAX = 1.1;

// ============================================================================
// Image and Resource Loading
// ============================================================================

// Resolve optional image paths to absolute URLs.
export function resolveImageSrc(path: string | null | undefined): string {
  if (!path) return "";
  if (path.startsWith("/") || path.startsWith("http") || path.startsWith("data:")) return path;
  const base = BASE_URL.endsWith("/") ? BASE_URL : `${BASE_URL}/`;
  return `${base}${path}`;
}

export function getTextureImage(
  src: string,
  imageCache: Map<string, ImageCacheEntry>,
  onLoad: () => void
): HTMLImageElement | null {
  // Cache and reuse image resources for top textures.
  const cachedImage = imageCache.get(src);
  if (cachedImage === "error") return null;
  let img = cachedImage as HTMLImageElement | undefined;
  if (!img) {
    img = new Image();
    img.decoding = "async";
    img.src = src;
    img.onload = () => onLoad();
    img.onerror = () => {
      imageCache.set(src, "error");
      onLoad();
    };
    imageCache.set(src, img);
  }
  if (!img.complete || img.naturalWidth === 0) return null;
  return img;
}

// ============================================================================
// 3D Stacking and Spatial Layout
// ============================================================================

// Get the 2D footprint for stacking, accounting for rotations.
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
  const left = obj.x + (width - bboxW) / 2;
  const top = obj.y + (depth - bboxH) / 2;
  return {
    rect: { minX: left, minY: top, maxX: left + bboxW, maxY: top + bboxH },
    width,
    depth,
    height,
  };
}

export function computeStackedObjects(objects: CanvasObjectType[]): StackedObject[] {
  // Build a simple Z stack: later items sit on top of overlaps.
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

export function getSceneMetrics(stacked: StackedObject[]): { center: Vec3; radius: number; basePitch: number } {
  // Compute a camera target and radius that fit the full stack.
  if (stacked.length === 0) {
    return { center: { x: 0, y: 0, z: 0 }, radius: 1, basePitch: 0.35 };
  }
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let maxZ = 0;
  for (const s of stacked) {
    minX = Math.min(minX, s.rect.minX);
    minY = Math.min(minY, s.rect.minY);
    maxX = Math.max(maxX, s.rect.maxX);
    maxY = Math.max(maxY, s.rect.maxY);
    maxZ = Math.max(maxZ, s.baseZ + s.height);
  }
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const centerZ = maxZ / 2;
  const w = maxX - minX;
  const h = maxY - minY;
  const d = maxZ;
  const maxDim = Math.max(w, h, d);
  const radius = maxDim * 1.5;
  return { center: { x: centerX, y: centerY, z: centerZ }, radius, basePitch: 0.35 };
}
