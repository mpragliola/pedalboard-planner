/** Object creation helpers for catalog templates and custom items. */
import { DEFAULT_OBJECT_COLOR } from "../constants/defaults";
import { MM_TO_PX } from "../constants/interaction";
import type { CanvasObjectType, ObjectSubtype } from "../types";
import type { BoardTemplate } from "../data/boards";
import type { DeviceTemplate } from "../data/devices";
import type { Point } from "./vector";
import type { Shape3D } from "../shape3d";
import type { ObjectIdGenerator } from "./objectIdGenerator";

const IMAGE_PREFIX: Record<ObjectSubtype, string> = {
  board: "images/boards/",
  device: "images/devices/",
};

/** Create a canvas object from any template (board or device). */
export function createObjectFromTemplate(
  subtype: ObjectSubtype,
  template: BoardTemplate | DeviceTemplate,
  pos: Point,
  idGenerator: ObjectIdGenerator
): CanvasObjectType {
  const shape: Shape3D | undefined = "shape" in template ? (template as DeviceTemplate).shape : undefined;
  return {
    id: idGenerator.nextId(),
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
export function createCustomObject(
  subtype: ObjectSubtype,
  params: CustomItemParams,
  pos: Point,
  idGenerator: ObjectIdGenerator
): CanvasObjectType {
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
  return createObjectFromTemplate(subtype, template, pos, idGenerator);
}

/** @deprecated Use createCustomObject("board", ...) */
export const createObjectFromCustomBoard = (
  p: CustomItemParams,
  pos: Point,
  idGenerator: ObjectIdGenerator
) => createCustomObject("board", p, pos, idGenerator);
/** @deprecated Use createCustomObject("device", ...) */
export const createObjectFromCustomDevice = (
  p: CustomItemParams,
  pos: Point,
  idGenerator: ObjectIdGenerator
) => createCustomObject("device", p, pos, idGenerator);

/** Map catalog mode to object subtype. */
export function modeToSubtype(mode: "boards" | "devices"): ObjectSubtype {
  return mode === "boards" ? "board" : "device";
}
