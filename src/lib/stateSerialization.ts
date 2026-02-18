/** State serialization + parsing helpers (no storage). */
import type { CanvasObjectType, Cable } from "../types";
import type { Shape3D } from "../shape3d";
import type { Wdh } from "../wdh";
import type { Offset, Point } from "./vector";
import { isCanvasBackgroundId, type CanvasBackgroundId } from "../constants/backgrounds";

/** Shape of state persisted to storage (e.g. localStorage). */
export interface SavedState {
  objects: CanvasObjectType[];
  past?: CanvasObjectType[][];
  future?: CanvasObjectType[][];
  zoom?: number;
  pan?: Offset;
  showGrid?: boolean;
  unit?: "mm" | "in";
  background?: CanvasBackgroundId;
  cables?: Cable[];
}

/** Runtime adapter for template-based enrichment and known-template checks. */
export interface StateTemplateResolver {
  hasKnownTemplateDimensions: (templateId?: string) => boolean;
  getTemplateImage: (templateId?: string) => string | null;
  getTemplateShape: (templateId?: string) => Shape3D | undefined;
  getTemplateWdh: (templateId?: string) => Wdh | undefined;
}

/** Optional serialization/parse adapters that keep this module pure by default. */
export interface StateSerializationOptions {
  templateResolver?: StateTemplateResolver;
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

/** Strip image from all objects; keep name only for custom elements. Omit width/depth/height when template has known dimensions (restored from template on load). Round coordinates to 2 decimals. */
function serializeObjects(
  objects: CanvasObjectType[],
  options?: StateSerializationOptions
): Record<string, unknown>[] {
  const resolver = options?.templateResolver;
  return objects.map((o) => {
    const { image, name, width, depth, height, pos, shape: _shape, ...rest } = o as CanvasObjectType & {
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
    const hasKnownTemplateDims = resolver ? resolver.hasKnownTemplateDimensions(o.templateId) : false;
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

function serializeCables(cables: Cable[] | undefined): Record<string, unknown>[] | undefined {
  if (!cables) return cables;
  return cables.map((cable) => {
    const { segments: _segments, ...rest } = cable;
    const roundedPoints = cable.segments.map((p) => [round2(p.x), round2(p.y)]);
    return {
      ...rest,
      points: roundedPoints,
    };
  });
}

/** Restore image and dimensions from template when loading. Name derived from brand+model if missing. */
function normalizeLoadedObjects(
  objects: Record<string, unknown>[],
  options?: StateSerializationOptions
): CanvasObjectType[] {
  const resolver = options?.templateResolver;
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
    const image = resolver ? resolver.getTemplateImage(templateId) : null;
    const shape = resolver?.getTemplateShape(templateId);
    /* For known templates, always use template dims as source of truth. */
    const wdh = resolver?.getTemplateWdh(templateId);
    const width = wdh ? wdh[0] : num(o, "width");
    const depth = wdh ? wdh[1] : num(o, "depth");
    const height = wdh ? wdh[2] : num(o, "height");
    return { ...rest, templateId, type, brand, model, image, name, width, depth, height, pos, ...(shape ? { shape } : {}) } as CanvasObjectType;
  });
}

/** Parse and validate JSON string into SavedState. Returns null on invalid or missing data. */
export function parseState(json: string, options?: StateSerializationOptions): SavedState | null {
  try {
    const data = JSON.parse(json) as unknown;
    if (typeof data !== "object" || data === null || !("objects" in data)) return null;
    const d = data as Record<string, unknown>;
    const rawObjects = d.objects;
    if (!Array.isArray(rawObjects) || rawObjects.some((o) => typeof o !== "object" || o === null)) return null;
    const rawObjRecords = rawObjects as Record<string, unknown>[];
    if (!rawObjRecords.every((o) => isValidObjectRecord(o, options))) return null;
    const objects = normalizeLoadedObjects(rawObjRecords, options);

    const isValidSnapshot = (arr: unknown) =>
      Array.isArray(arr) && (arr as Record<string, unknown>[]).every((o) => isValidObjectRecord(o, options));
    const past = Array.isArray(d.past) && d.past.every(isValidSnapshot)
      ? d.past.map((arr: unknown) => normalizeLoadedObjects(arr as Record<string, unknown>[], options))
      : undefined;
    const future = Array.isArray(d.future) && d.future.every(isValidSnapshot)
      ? d.future.map((arr: unknown) => normalizeLoadedObjects(arr as Record<string, unknown>[], options))
      : undefined;

    const pan = d.pan as Record<string, unknown> | undefined;
    const validPan =
      typeof pan === "object" && pan !== null &&
      typeof pan.x === "number" && typeof pan.y === "number"
        ? { x: pan.x, y: pan.y }
        : undefined;
    const cables = normalizeCableArray(d.cables);

    return {
      objects,
      past,
      future,
      zoom: typeof d.zoom === "number" ? d.zoom : undefined,
      pan: validPan,
      showGrid: typeof d.showGrid === "boolean" ? d.showGrid : undefined,
      unit: d.unit === "mm" || d.unit === "in" ? (d.unit as "mm" | "in") : undefined,
      background: isCanvasBackgroundId(d.background) ? d.background : undefined,
      cables: cables ?? undefined,
    };
  } catch {
    return null;
  }
}

/** Serialize state for storage/file: no image, name only for custom elements. Coordinates, pan, zoom rounded to 2 decimals. */
export function serializeState(state: SavedState, options?: StateSerializationOptions): Record<string, unknown> {
  const pan =
    state.pan && typeof state.pan.x === "number" && typeof state.pan.y === "number"
      ? { x: round2(state.pan.x), y: round2(state.pan.y) }
      : state.pan;
  const zoom = typeof state.zoom === "number" ? round2(state.zoom) : state.zoom;
  return {
    ...state,
    objects: serializeObjects(state.objects, options),
    past: state.past?.map((snapshot) => serializeObjects(snapshot, options)),
    future: state.future?.map((snapshot) => serializeObjects(snapshot, options)),
    pan,
    zoom,
    cables: serializeCables(state.cables),
  };
}

/** Validate minimal record. Width/depth/height optional when templateId matches a known template. */
function isValidObjectRecord(o: unknown, options?: StateSerializationOptions): o is Record<string, unknown> {
  if (typeof o !== "object" || o === null) return false;
  const t = o as Record<string, unknown>;
  const templateId = typeof t.templateId === "string" ? t.templateId : undefined;
  const hasKnownTemplate = options?.templateResolver
    ? options.templateResolver.hasKnownTemplateDimensions(templateId)
    : false;
  const dimsRequired = !hasKnownTemplate;
  const hasPos = isValidPointLike(t.pos);
  const hasLegacyPos = typeof t.x === "number" && typeof t.y === "number";
  return (
    typeof t.id === "string" &&
    typeof t.subtype === "string" &&
    (hasPos || hasLegacyPos) &&
    (!dimsRequired || (typeof t.width === "number" && typeof t.depth === "number" && typeof t.height === "number"))
  );
}

function isValidPointLike(value: unknown): value is Point {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return typeof v.x === "number" && typeof v.y === "number";
}

function isPointTuple(value: unknown): value is [number, number] {
  return Array.isArray(value) && value.length === 2 && typeof value[0] === "number" && typeof value[1] === "number";
}

function normalizeCable(o: unknown): Cable | null {
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

  const segments: Cable["segments"] = [];
  if (!Array.isArray(c.points) || c.points.length === 0 || !c.points.every(isPointTuple)) return null;
  const points = c.points.map((tuple) => ({ x: tuple[0], y: tuple[1] }));
  segments.push(...points);

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

function normalizeCableArray(arr: unknown): Cable[] | null {
  if (!Array.isArray(arr)) return null;
  const cables: Cable[] = [];
  for (const cable of arr) {
    const normalized = normalizeCable(cable);
    if (!normalized) return null;
    cables.push(normalized);
  }
  return cables;
}
