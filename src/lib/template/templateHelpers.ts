/** Object creation helpers for catalog templates and custom items. */
import { DEFAULT_OBJECT_COLOR } from "../../constants/defaults";
import { MM_TO_PX } from "../../constants/interaction";
import type { Cable, CanvasObjectType, ConnectorKind, ObjectSubtype } from "../../types";
import type { BoardTemplate } from "../../data/boards";
import type { DeviceTemplate } from "../../data/devices";
import type { Point } from "../vector";
import type { Shape3D } from "../../shape3d";
import type { ObjectIdGenerator } from "../object/objectIdGenerator";

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
  // Centralized config keeps "custom board" and "custom device" defaults
  // (template id, fallback name, default height) in one place.
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

/** Map catalog mode to object subtype. */
export function modeToSubtype(mode: "boards" | "devices"): ObjectSubtype {
  return mode === "boards" ? "board" : "device";
}

/**
 * Generates ids with the same shape used by existing cable records.
 *
 * Format: `cable-<timestamp>-<randomSuffix>`.
 * The timestamp keeps ids loosely ordered by creation time, while the random
 * suffix avoids collisions when multiple cables are created in the same ms.
 */
export function createCableId(): string {
  return `cable-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export interface CreateCableFromPointsOptions {
  id?: string;
  color: string;
  connectorA: ConnectorKind;
  connectorB: ConnectorKind;
  connectorAName?: string;
  connectorBName?: string;
}

/**
 * Creates a normalized cable object from a polyline and connector metadata.
 *
 * Why this helper exists:
 * 1. `AddCableModal` previously built cable objects inline.
 * 2. Creation and edit code paths duplicated normalization logic.
 * 3. Optional connector names needed consistent trimming/omission behavior.
 *
 * Consolidating this into one factory keeps shape/validation rules in one place.
 */
export function createCableFromPoints(segments: Point[], options: CreateCableFromPointsOptions): Cable {
  // Every cable must have at least one segment (two points).
  if (segments.length < 2) {
    throw new Error("Cable must contain at least two points.");
  }

  const cable: Cable = {
    // Reuse provided id when editing; generate one for brand new cables.
    id: options.id ?? createCableId(),
    // Copy points to avoid accidental downstream mutation of source arrays.
    segments: segments.map((point) => ({ x: point.x, y: point.y })),
    color: options.color,
    connectorA: options.connectorA,
    connectorB: options.connectorB,
  };

  // Normalize optional labels:
  // - trim user input
  // - store only non-empty values to keep saved payload minimal
  const connectorAName = options.connectorAName?.trim();
  const connectorBName = options.connectorBName?.trim();
  if (connectorAName) cable.connectorAName = connectorAName;
  if (connectorBName) cable.connectorBName = connectorBName;
  return cable;
}
