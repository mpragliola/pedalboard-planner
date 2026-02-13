import { parseColor } from "../../lib/color";
import { normalizeRotation } from "../../lib/geometry";
import { rectsOverlap, type Rect } from "../../lib/geometry2d";
import { getObjectDimensions } from "../../lib/objectDimensions";
import type { CanvasObjectType } from "../../types";
import {
  GROUND_Y,
  MIN_BOX_HEIGHT,
  MIN_ORBIT_DISTANCE,
  MINI3D_DEFAULT_DEVICE_COLOR,
  MINI3D_PARSE_FALLBACK_COLOR,
  WORLD_SCALE,
} from "./mini3dConstants";
import type { SceneLayout } from "./mini3dTypes";
import { resolveImageSrc } from "./mini3dUtils";

export function buildSceneLayout(objects: CanvasObjectType[]): SceneLayout {
  const sceneObjects = objects.filter((obj) => obj.subtype === "board" || obj.subtype === "device");
  if (sceneObjects.length === 0) {
    return { boxes: [], orbitDistance: MIN_ORBIT_DISTANCE, targetY: GROUND_Y + 1 };
  }

  type RawObject = {
    id: string;
    subtype: "board" | "device";
    rect: Rect;
    centerX: number;
    centerY: number;
    width: number;
    depth: number;
    height: number;
    rotY: number;
    color: string;
    imageUrl: string | null;
  };

  const rawObjects: RawObject[] = [];
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  let boardMinX = Infinity;
  let boardMaxX = -Infinity;
  let boardMinY = Infinity;
  let boardMaxY = -Infinity;
  let hasBoard = false;

  for (const obj of sceneObjects) {
    const [widthMm, depthMm, heightMm] = getObjectDimensions(obj);
    if (widthMm <= 0 || depthMm <= 0) continue;

    const rotation = normalizeRotation(obj.rotation ?? 0);
    const is90or270 = rotation === 90 || rotation === 270;
    const footprintW = is90or270 ? depthMm : widthMm;
    const footprintD = is90or270 ? widthMm : depthMm;

    const centerX = obj.pos.x + widthMm / 2;
    const centerY = obj.pos.y + depthMm / 2;

    minX = Math.min(minX, centerX - footprintW / 2);
    maxX = Math.max(maxX, centerX + footprintW / 2);
    minY = Math.min(minY, centerY - footprintD / 2);
    maxY = Math.max(maxY, centerY + footprintD / 2);
    if (obj.subtype === "board") {
      hasBoard = true;
      boardMinX = Math.min(boardMinX, centerX - footprintW / 2);
      boardMaxX = Math.max(boardMaxX, centerX + footprintW / 2);
      boardMinY = Math.min(boardMinY, centerY - footprintD / 2);
      boardMaxY = Math.max(boardMaxY, centerY + footprintD / 2);
    }

    const fallbackColor = obj.subtype === "board" ? "rgb(96, 106, 120)" : MINI3D_DEFAULT_DEVICE_COLOR;
    const parsed = parseColor(obj.color ?? fallbackColor) ?? MINI3D_PARSE_FALLBACK_COLOR;
    rawObjects.push({
      id: obj.id,
      subtype: obj.subtype,
      rect: {
        minX: centerX - footprintW / 2,
        maxX: centerX + footprintW / 2,
        minY: centerY - footprintD / 2,
        maxY: centerY + footprintD / 2,
      },
      centerX,
      centerY,
      width: widthMm,
      depth: depthMm,
      height: heightMm,
      rotY: (-rotation * Math.PI) / 180,
      color: `rgb(${parsed.r}, ${parsed.g}, ${parsed.b})`,
      imageUrl: resolveImageSrc(obj.image),
    });
  }

  if (rawObjects.length === 0 || !Number.isFinite(minX) || !Number.isFinite(minY)) {
    return { boxes: [], orbitDistance: MIN_ORBIT_DISTANCE, targetY: GROUND_Y + 1 };
  }

  const anchorMinX = hasBoard ? boardMinX : minX;
  const anchorMaxX = hasBoard ? boardMaxX : maxX;
  const anchorMinY = hasBoard ? boardMinY : minY;
  const anchorMaxY = hasBoard ? boardMaxY : maxY;

  const centerX = (anchorMinX + anchorMaxX) / 2;
  const centerY = (anchorMinY + anchorMaxY) / 2;
  const spanX = Math.max(1, anchorMaxX - anchorMinX) * WORLD_SCALE;
  const spanY = Math.max(1, anchorMaxY - anchorMinY) * WORLD_SCALE;

  const stacked: Array<RawObject & { heightScaled: number; baseScaled: number }> = [];
  for (const item of rawObjects) {
    const heightScaled = Math.max(MIN_BOX_HEIGHT, item.height * WORLD_SCALE);
    let baseScaled = 0;

    for (const below of stacked) {
      if (rectsOverlap(item.rect, below.rect)) {
        baseScaled = Math.max(baseScaled, below.baseScaled + below.heightScaled);
      }
    }

    stacked.push({
      ...item,
      heightScaled,
      baseScaled,
    });
  }

  const maxStackHeight = stacked.reduce((max, item) => Math.max(max, item.baseScaled + item.heightScaled), 0);
  const sceneSpan = Math.max(spanX, spanY, maxStackHeight);

  const boxes = stacked.map((item) => ({
    id: item.id,
    subtype: item.subtype,
    x: (item.centerX - centerX) * WORLD_SCALE,
    y: GROUND_Y + item.baseScaled + item.heightScaled / 2,
    z: (item.centerY - centerY) * WORLD_SCALE,
    width: Math.max(0.05, item.width * WORLD_SCALE),
    depth: Math.max(0.05, item.depth * WORLD_SCALE),
    height: item.heightScaled,
    rotY: item.rotY,
    color: item.color,
    imageUrl: item.imageUrl,
  }));

  let minBoxY = Infinity;
  let maxBoxY = -Infinity;
  for (const box of boxes) {
    minBoxY = Math.min(minBoxY, box.y - box.height / 2);
    maxBoxY = Math.max(maxBoxY, box.y + box.height / 2);
  }
  const targetY = Number.isFinite(minBoxY) && Number.isFinite(maxBoxY)
    ? (minBoxY + maxBoxY) / 2
    : GROUND_Y + 1;

  return {
    boxes,
    orbitDistance: Math.max(MIN_ORBIT_DISTANCE, sceneSpan * 2 + 3),
    targetY,
  };
}
