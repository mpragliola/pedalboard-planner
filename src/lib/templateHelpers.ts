/** Object creation helpers for catalog templates and custom items. */
import { MM_TO_PX, DEFAULT_OBJECT_COLOR } from "../constants";
import type { CanvasObjectType, ObjectSubtype } from "../types";
import type { BoardTemplate } from "../data/boards";
import type { DeviceTemplate } from "../data/devices";
import type { Point } from "./vector";
import type { Shape3D } from "../shape3d";

/** Global counter for unique object IDs. Uses timestamp prefix to survive HMR. */
let nextObjectId = 1;
let idPrefix = Date.now();

/** Call when restoring state so new objects never get IDs that collide with existing ones. */
export function initNextObjectIdFromObjects(objects: CanvasObjectType[]): void {
  let maxId = 0;
  for (const o of objects) {
    // Handle both old numeric IDs and new prefixed IDs
    const parts = o.id.split("-");
    const n = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(n) && n > maxId) maxId = n;
  }
  nextObjectId = maxId + 1;
  // Reset prefix on load to ensure uniqueness even if IDs were corrupted
  idPrefix = Date.now();
}

/** Generate a unique object ID */
function generateId(): string {
  return `${idPrefix}-${nextObjectId++}`;
}

const IMAGE_PREFIX: Record<ObjectSubtype, string> = {
  board: "images/boards/",
  device: "images/devices/",
};

/** Create a canvas object from any template (board or device). */
export function createObjectFromTemplate(
  subtype: ObjectSubtype,
  template: BoardTemplate | DeviceTemplate,
  pos: Point
): CanvasObjectType {
  const shape: Shape3D | undefined = "shape" in template ? (template as DeviceTemplate).shape : undefined;
  return {
    id: generateId(),
    templateId: template.id,
    subtype,
    type: template.type,
    brand: template.brand,
    model: template.model,
    name: template.name,
    pos,
    width: template.wdh[0] * MM_TO_PX,
    depth: template.wdh[1] * MM_TO_PX,
    height: template.wdh[2] * MM_TO_PX,
    rotation: 0,
    ...(template.image ? {} : { color: template.color ?? DEFAULT_OBJECT_COLOR }),
    image: template.image ? `${IMAGE_PREFIX[subtype]}${template.image}` : null,
    ...(shape ? { shape } : {}),
  };
}

export interface CustomItemParams {
  widthMm: number;
  depthMm: number;
  color: string;
  name: string;
}

const CUSTOM_DEFAULTS: Record<ObjectSubtype, { id: string; type: string; defaultName: string; heightMm: number }> = {
  board: { id: "board-custom", type: "classic", defaultName: "Custom board", heightMm: 20 },
  device: { id: "device-custom", type: "pedal", defaultName: "Custom device", heightMm: 50 },
};

/** Create a custom canvas object (board or device) from user-specified dimensions. */
export function createCustomObject(subtype: ObjectSubtype, params: CustomItemParams, pos: Point): CanvasObjectType {
  const cfg = CUSTOM_DEFAULTS[subtype];
  const template: BoardTemplate | DeviceTemplate = {
    id: cfg.id,
    type: cfg.type as never, // narrowed by CUSTOM_DEFAULTS config
    brand: "",
    model: "Custom",
    name: params.name.trim() || cfg.defaultName,
    wdh: [params.widthMm, params.depthMm, cfg.heightMm],
    color: params.color,
    image: null,
  };
  return createObjectFromTemplate(subtype, template, pos);
}

/** @deprecated Use createCustomObject("board", ...) */
export const createObjectFromCustomBoard = (p: CustomItemParams, pos: Point) => createCustomObject("board", p, pos);
/** @deprecated Use createCustomObject("device", ...) */
export const createObjectFromCustomDevice = (p: CustomItemParams, pos: Point) => createCustomObject("device", p, pos);

/** Map catalog mode to object subtype. */
export function modeToSubtype(mode: "boards" | "devices"): ObjectSubtype {
  return mode === "boards" ? "board" : "device";
}
