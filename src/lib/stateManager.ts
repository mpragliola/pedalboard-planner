/** Persistence and migration helpers for canvas/editor state. */
import type { CanvasObjectType, Cable } from "../types";
import { DEVICE_TEMPLATES } from "../data/devices";
import { BOARD_TEMPLATES } from "../data/boards";
import { MM_TO_PX } from "../constants";

/** Shape of state persisted to storage (e.g. localStorage). */
export interface SavedState {
  objects: CanvasObjectType[];
  past?: CanvasObjectType[][];
  future?: CanvasObjectType[][];
  zoom?: number;
  pan?: { x: number; y: number };
  showGrid?: boolean;
  unit?: "mm" | "in";
  cables?: Cable[];
}

/** Build a lookup map from template id to image path. */
const templateImageMap: Map<string, string | null> = new Map();
/** Build a lookup map from template id to [width, depth, height] in px. */
const templateWdhMap: Map<string, [number, number, number]> = new Map();
for (const t of DEVICE_TEMPLATES) {
  templateImageMap.set(t.id, t.image ? `images/devices/${t.image}` : null);
  if (t.wdh && t.wdh.length === 3) {
    templateWdhMap.set(t.id, [t.wdh[0] * MM_TO_PX, t.wdh[1] * MM_TO_PX, t.wdh[2] * MM_TO_PX]);
  }
}
for (const t of BOARD_TEMPLATES) {
  templateImageMap.set(t.id, t.image ? `images/boards/${t.image}` : null);
  if (t.wdh && t.wdh.length === 3) {
    templateWdhMap.set(t.id, [t.wdh[0] * MM_TO_PX, t.wdh[1] * MM_TO_PX, t.wdh[2] * MM_TO_PX]);
  }
}

/** Returns [width, depth, height] in px. For known templates, always from template (source of truth). */
export function getObjectDimensions(obj: CanvasObjectType): [number, number, number] {
  const tid = obj.templateId;
  if (tid && templateWdhMap.has(tid)) {
    return templateWdhMap.get(tid)!;
  }
  return [obj.width, obj.depth, obj.height];
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Safely extract a string value from a loosely-typed record. */
function str(o: Record<string, unknown>, key: string, fallback = ""): string {
  const v = o[key];
  return typeof v === "string" ? v : fallback;
}

/** Safely extract a number value from a loosely-typed record. */
function num(o: Record<string, unknown>, key: string, fallback = 0): number {
  const v = o[key];
  return typeof v === "number" ? v : fallback;
}

/** Custom elements have templateId of board-custom or device-custom. */
function isCustomObject(o: CanvasObjectType): boolean {
  return o.templateId === "board-custom" || o.templateId === "device-custom";
}

/** Strip image from all objects; keep name only for custom elements. Omit width /depth/height when template has known dimensions (restored from template on load). Round coordinates to 2 decimals. */
function serializeObjects(objects: CanvasObjectType[]): Record<string, unknown>[] {
  return objects.map((o) => {
    const { image, name, width, depth, height, pos, ...rest } = o as CanvasObjectType & {
      image?: string | null;
      name?: string;
      width?: number;
      depth?: number;
      height?: number;
    };
    const out: Record<string, unknown> = {
      ...rest,
      pos: { x: round2(pos.x), y: round2(pos.y) },
      name: o.name,
    };
    const hasKnownTemplateDims = o.templateId ? templateWdhMap.has(o.templateId) : false;
    if (isCustomObject(o)) {
      out.width = o.width;
      out.depth = o.depth;
      out.height = o.height;
    } else {
      delete out.name;
      if (!hasKnownTemplateDims) {
        out.width = o.width;
        out.depth = o.depth;
        out.height = o.height;
      }
    }
    return out;
  });
}

/** Restore image and dimensions from template when loading. Name derived from brand+model if missing. */
function normalizeLoadedObjects(objects: Record<string, unknown>[]): CanvasObjectType[] {
  return objects.map((o) => {
    const { x: _legacyX, y: _legacyY, pos: _rawPos, ...rest } = o;
    const rawPos = o.pos as Record<string, unknown> | undefined;
    const pos =
      typeof rawPos === "object" && rawPos !== null && typeof rawPos.x === "number" && typeof rawPos.y === "number"
        ? { x: rawPos.x, y: rawPos.y }
        : { x: num(o, "x"), y: num(o, "y") };
    const templateId = str(o, "templateId") || undefined;
    const brand = str(o, "brand");
    const model = str(o, "model");
    const type = str(o, "type");
    const name = str(o, "name") || `${brand} ${model}`.trim() || type || "Object";
    const image = templateId ? templateImageMap.get(templateId) ?? null : null;
    /* For known templates, always use template dims as source of truth. */
    const wdh = templateId ? templateWdhMap.get(templateId) : undefined;
    const width = wdh ? wdh[0] : num(o, "width");
    const depth = wdh ? wdh[1] : num(o, "depth");
    const height = wdh ? wdh[2] : num(o, "height");
    return { ...rest, templateId, type, brand, model, image, name, width, depth, height, pos } as CanvasObjectType;
  });
}

/**
 * Loads and saves app state to a storage backend (e.g. localStorage).
 * Validates loaded data and returns null on invalid or missing data.
 */
export class StateManager {
  constructor(private readonly storageKey: string = "pedal/state") {}

  load(): SavedState | null {
    try {
      const raw = typeof localStorage !== "undefined" ? localStorage.getItem(this.storageKey) : null;
      if (!raw) return null;
      return StateManager.parseState(raw);
    } catch {
      return null;
    }
  }

  /** Parse and validate JSON string into SavedState. Returns null on invalid or missing data. */
  static parseState(json: string): SavedState | null {
    try {
      const data = JSON.parse(json) as unknown;
      if (typeof data !== "object" || data === null || !("objects" in data)) return null;
      const d = data as Record<string, unknown>;
      const rawObjects = d.objects;
      if (!Array.isArray(rawObjects) || rawObjects.some((o) => typeof o !== "object" || o === null)) return null;
      const rawObjRecords = rawObjects as Record<string, unknown>[];
      if (!rawObjRecords.every(StateManager.isValidObjectRecord)) return null;
      const objects = normalizeLoadedObjects(rawObjRecords);

      const isValidSnapshot = (arr: unknown) =>
        Array.isArray(arr) && (arr as Record<string, unknown>[]).every(StateManager.isValidObjectRecord);
      const past = Array.isArray(d.past) && d.past.every(isValidSnapshot)
        ? d.past.map((arr: unknown) => normalizeLoadedObjects(arr as Record<string, unknown>[]))
        : undefined;
      const future = Array.isArray(d.future) && d.future.every(isValidSnapshot)
        ? d.future.map((arr: unknown) => normalizeLoadedObjects(arr as Record<string, unknown>[]))
        : undefined;

      const pan = d.pan as Record<string, unknown> | undefined;
      const validPan =
        typeof pan === "object" && pan !== null &&
        typeof pan.x === "number" && typeof pan.y === "number"
          ? { x: pan.x, y: pan.y }
          : undefined;
      const cables = StateManager.normalizeCableArray(d.cables);

      return {
        objects,
        past,
        future,
        zoom: typeof d.zoom === "number" ? d.zoom : undefined,
        pan: validPan,
        showGrid: typeof d.showGrid === "boolean" ? d.showGrid : undefined,
        unit: d.unit === "mm" || d.unit === "in" ? (d.unit as "mm" | "in") : undefined,
        cables: cables ?? undefined,
      };
    } catch {
      return null;
    }
  }

  save(state: SavedState): void {
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(this.storageKey, JSON.stringify(StateManager.serializeState(state)));
      }
    } catch {
      // quota or disabled
    }
  }

  /** Serialize state for storage/file: no image, name only for custom elements. Coordinates, pan, zoom rounded to 2 decimals. */
  static serializeState(state: SavedState): Record<string, unknown> {
    const pan =
      state.pan && typeof state.pan.x === "number" && typeof state.pan.y === "number"
        ? { x: round2(state.pan.x), y: round2(state.pan.y) }
        : state.pan;
    const zoom = typeof state.zoom === "number" ? round2(state.zoom) : state.zoom;
    return {
      ...state,
      objects: serializeObjects(state.objects),
      past: state.past?.map(serializeObjects),
      future: state.future?.map(serializeObjects),
      pan,
      zoom,
    };
  }

  /** Validate minimal record. Width/depth/height optional when templateId matches a known template. */
  private static isValidObjectRecord(o: unknown): o is Record<string, unknown> {
    if (typeof o !== "object" || o === null) return false;
    const t = o as Record<string, unknown>;
    const templateId = typeof t.templateId === "string" ? t.templateId : undefined;
    const hasKnownTemplate = templateId ? templateWdhMap.has(templateId) : false;
    const dimsRequired = !hasKnownTemplate;
    const hasPos = StateManager.isValidPointLike(t.pos);
    const hasLegacyPos = typeof t.x === "number" && typeof t.y === "number";
    return (
      typeof t.id === "string" &&
      typeof t.subtype === "string" &&
      (hasPos || hasLegacyPos) &&
      (!dimsRequired || (typeof t.width === "number" && typeof t.depth === "number" && typeof t.height === "number"))
    );
  }

  private static isValidPointLike(value: unknown): value is { x: number; y: number } {
    if (typeof value !== "object" || value === null) return false;
    const v = value as Record<string, unknown>;
    return typeof v.x === "number" && typeof v.y === "number";
  }

  private static normalizeCableSegment(seg: unknown): Cable["segments"][0] | null {
    if (typeof seg !== "object" || seg === null) return null;
    const s = seg as Record<string, unknown>;
    if (StateManager.isValidPointLike(s.start) && StateManager.isValidPointLike(s.end)) {
      return {
        start: { x: s.start.x, y: s.start.y },
        end: { x: s.end.x, y: s.end.y },
      };
    }
    if (
      typeof s.x1 === "number" &&
      typeof s.y1 === "number" &&
      typeof s.x2 === "number" &&
      typeof s.y2 === "number"
    ) {
      return {
        start: { x: s.x1, y: s.y1 },
        end: { x: s.x2, y: s.y2 },
      };
    }
    return null;
  }

  private static normalizeCable(o: unknown): Cable | null {
    if (typeof o !== "object" || o === null) return null;
    const c = o as Record<string, unknown>;
    if (
      typeof c.id !== "string" ||
      typeof c.color !== "string" ||
      typeof c.connectorA !== "string" ||
      typeof c.connectorB !== "string"
    )
      return null;
    if (c.connectorAName !== undefined && typeof c.connectorAName !== "string") return null;
    if (c.connectorBName !== undefined && typeof c.connectorBName !== "string") return null;
    if (!Array.isArray(c.segments)) return null;
    const segments: Cable["segments"] = [];
    for (const segment of c.segments) {
      const normalized = StateManager.normalizeCableSegment(segment);
      if (!normalized) return null;
      segments.push(normalized);
    }
    return {
      id: c.id,
      color: c.color,
      connectorA: c.connectorA as Cable["connectorA"],
      connectorB: c.connectorB as Cable["connectorB"],
      segments,
      ...(typeof c.connectorAName === "string" ? { connectorAName: c.connectorAName } : {}),
      ...(typeof c.connectorBName === "string" ? { connectorBName: c.connectorBName } : {}),
    };
  }

  private static normalizeCableArray(arr: unknown): Cable[] | null {
    if (!Array.isArray(arr)) return null;
    const cables: Cable[] = [];
    for (const cable of arr) {
      const normalized = StateManager.normalizeCable(cable);
      if (!normalized) return null;
      cables.push(normalized);
    }
    return cables;
  }
}
