import type { CanvasObjectType, Connector } from "../types";
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
  connectors?: Connector[];
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

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Custom elements have templateId of board-custom or device-custom. */
function isCustomObject(o: CanvasObjectType): boolean {
  return o.templateId === "board-custom" || o.templateId === "device-custom";
}

/** Strip image from all objects; keep name only for custom elements. Omit width/depth/height when template has known dimensions (restored from template on load). Round coordinates to 2 decimals. */
function serializeObjects(objects: CanvasObjectType[]): Record<string, unknown>[] {
  return objects.map((o) => {
    const { image, name, width, depth, height, ...rest } = o as CanvasObjectType & {
      image?: string | null;
      name?: string;
      width?: number;
      depth?: number;
      height?: number;
    };
    const out: Record<string, unknown> = {
      ...rest,
      x: round2(o.x),
      y: round2(o.y),
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
    const templateId =
      typeof (o as { templateId?: string }).templateId === "string"
        ? (o as { templateId: string }).templateId
        : undefined;
    const name =
      typeof (o as { name?: unknown }).name === "string"
        ? (o as { name: string }).name
        : `${(o as { brand?: string }).brand ?? ""} ${(o as { model?: string }).model ?? ""}`.trim() ||
          (typeof (o as { type?: string }).type === "string" ? (o as { type: string }).type : "Object");
    const image = templateId ? templateImageMap.get(templateId) ?? null : null;
    const wdh = templateId ? templateWdhMap.get(templateId) : undefined;
    const width =
      typeof (o as { width?: number }).width === "number" ? (o as { width: number }).width : wdh ? wdh[0] : 0;
    const depth =
      typeof (o as { depth?: number }).depth === "number" ? (o as { depth: number }).depth : wdh ? wdh[1] : 0;
    const height =
      typeof (o as { height?: number }).height === "number" ? (o as { height: number }).height : wdh ? wdh[2] : 0;
    return {
      ...o,
      templateId,
      type: typeof (o as { type?: string }).type === "string" ? (o as { type: string }).type : "",
      brand: typeof (o as { brand?: string }).brand === "string" ? (o as { brand: string }).brand : "",
      model: typeof (o as { model?: string }).model === "string" ? (o as { model: string }).model : "",
      image,
      name,
      width,
      depth,
      height,
    } as CanvasObjectType;
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
      const rawObjects = (data as SavedState).objects as unknown[];
      if (!Array.isArray(rawObjects) || rawObjects.some((o) => typeof o !== "object" || o === null)) return null;
      const rawObjRecords = rawObjects as Record<string, unknown>[];
      if (!rawObjRecords.every(StateManager.isValidObjectRecord)) return null;
      const objects = normalizeLoadedObjects(rawObjRecords);
      const past = (data as SavedState).past as unknown[] | undefined;
      const future = (data as SavedState).future as unknown[] | undefined;
      const pastValid =
        Array.isArray(past) &&
        past.every(
          (arr: unknown) =>
            Array.isArray(arr) && (arr as Record<string, unknown>[]).every(StateManager.isValidObjectRecord)
        );
      const futureValid =
        Array.isArray(future) &&
        future.every(
          (arr: unknown) =>
            Array.isArray(arr) && (arr as Record<string, unknown>[]).every(StateManager.isValidObjectRecord)
        );
      const pan = (data as SavedState).pan;
      return {
        objects,
        past:
          pastValid && Array.isArray(past)
            ? past.map((arr: unknown) => normalizeLoadedObjects(arr as Record<string, unknown>[]))
            : undefined,
        future:
          futureValid && Array.isArray(future)
            ? future.map((arr: unknown) => normalizeLoadedObjects(arr as Record<string, unknown>[]))
            : undefined,
        zoom: typeof (data as SavedState).zoom === "number" ? (data as SavedState).zoom : undefined,
        pan:
          typeof pan === "object" &&
          pan !== null &&
          "x" in pan &&
          "y" in pan &&
          typeof (pan as { x: unknown; y: unknown }).x === "number" &&
          typeof (pan as { x: unknown; y: unknown }).y === "number"
            ? (pan as { x: number; y: number })
            : undefined,
        showGrid: typeof (data as SavedState).showGrid === "boolean" ? (data as SavedState).showGrid : undefined,
        unit:
          (data as SavedState).unit === "mm" || (data as SavedState).unit === "in"
            ? (data as SavedState).unit
            : undefined,
        connectors: StateManager.isValidConnectorArray((data as SavedState).connectors)
          ? (data as SavedState).connectors
          : undefined,
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
    return (
      typeof t.id === "string" &&
      typeof t.subtype === "string" &&
      typeof t.x === "number" &&
      typeof t.y === "number" &&
      (!dimsRequired || (typeof t.width === "number" && typeof t.depth === "number" && typeof t.height === "number"))
    );
  }

  private static isValidConnector(o: unknown): o is Connector {
    if (typeof o !== "object" || o === null) return false;
    const c = o as Record<string, unknown>;
    return (
      typeof c.id === "string" &&
      typeof c.deviceA === "string" &&
      typeof c.deviceB === "string" &&
      typeof c.type === "string" &&
      typeof c.connectorA === "string" &&
      typeof c.connectorB === "string"
    );
  }

  private static isValidConnectorArray(arr: unknown): arr is Connector[] {
    return Array.isArray(arr) && arr.every(StateManager.isValidConnector);
  }
}
