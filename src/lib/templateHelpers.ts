/** Object creation helpers for catalog templates and custom items. */
import { MM_TO_PX, DEFAULT_OBJECT_COLOR } from "../constants";
import type { CanvasObjectType, ObjectSubtype } from "../types";
import type { BoardTemplate } from "../data/boards";
import type { DeviceTemplate } from "../data/devices";
import type { Point } from "./vector";

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
  };
}

const CUSTOM_BOARD_ID = "board-custom";
const CUSTOM_DEVICE_ID = "device-custom";
const CUSTOM_BOARD_HEIGHT_MM = 20;
const CUSTOM_DEVICE_HEIGHT_MM = 50;

export interface CustomItemParams {
  widthMm: number;
  depthMm: number;
  color: string;
  name: string;
}

export function createObjectFromCustomBoard(params: CustomItemParams, pos: Point): CanvasObjectType {
  const template: BoardTemplate = {
    id: CUSTOM_BOARD_ID,
    type: "classic",
    brand: "",
    model: "Custom",
    name: params.name.trim() || "Custom board",
    wdh: [params.widthMm, params.depthMm, CUSTOM_BOARD_HEIGHT_MM],
    color: params.color,
    image: null,
  };
  return createObjectFromTemplate("board", template, pos);
}

export function createObjectFromCustomDevice(params: CustomItemParams, pos: Point): CanvasObjectType {
  const template: DeviceTemplate = {
    id: CUSTOM_DEVICE_ID,
    type: "pedal",
    brand: "",
    model: "Custom",
    name: params.name.trim() || "Custom device",
    wdh: [params.widthMm, params.depthMm, CUSTOM_DEVICE_HEIGHT_MM],
    color: params.color,
    image: null,
  };
  return createObjectFromTemplate("device", template, pos);
}
