/**
 * Comprehensive tests for parseState / serializeState beyond the pure codec tests.
 * Covers: cables, history, legacy coords, template resolver, custom objects, round-trip.
 */
import { describe, expect, it } from "vitest";
import { parseState, serializeState, type SavedState, type StateTemplateResolver } from "./stateSerialization";
import type { CanvasObjectType } from "../types";

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeObject(overrides: Partial<Record<string, unknown>> = {}): Record<string, unknown> {
  return {
    id: "obj-1",
    subtype: "device",
    type: "pedal",
    brand: "Boss",
    model: "DS-1",
    templateId: "device-boss-ds-1",
    pos: { x: 10, y: 20 },
    width: 73,
    depth: 129,
    height: 58,
    ...overrides,
  };
}

function makeCustomObject(overrides: Partial<Record<string, unknown>> = {}): Record<string, unknown> {
  return {
    id: "cust-1",
    subtype: "device",
    type: "pedal",
    brand: "",
    model: "My Pedal",
    templateId: "device-custom",
    name: "My Custom Pedal",
    pos: { x: 5, y: 10 },
    width: 80,
    depth: 100,
    height: 50,
    ...overrides,
  };
}

function makeResolver(overrides: Partial<StateTemplateResolver> = {}): StateTemplateResolver {
  return {
    hasKnownTemplateDimensions: () => true,
    getTemplateImage: () => "images/devices/boss/boss-ds1.png",
    getTemplateShape: () => undefined,
    getTemplateWdh: () => [73, 129, 58],
    ...overrides,
  };
}

function jsonOf(obj: unknown): string {
  return JSON.stringify(obj);
}

// ── parseState — invalid inputs ───────────────────────────────────────────────

describe("parseState — invalid inputs", () => {
  it("returns null for empty string", () => {
    expect(parseState("")).toBeNull();
  });

  it("returns null for non-JSON input", () => {
    expect(parseState("not json at all")).toBeNull();
  });

  it("returns null when objects key is missing", () => {
    expect(parseState(jsonOf({ zoom: 1 }))).toBeNull();
  });

  it("returns null when objects is not an array", () => {
    expect(parseState(jsonOf({ objects: "nope" }))).toBeNull();
  });

  it("returns null when an object is missing required id field", () => {
    const obj = { ...makeObject(), id: undefined };
    expect(parseState(jsonOf({ objects: [obj] }))).toBeNull();
  });

  it("returns null when an object is missing required subtype field", () => {
    const obj = { ...makeObject(), subtype: undefined };
    expect(parseState(jsonOf({ objects: [obj] }))).toBeNull();
  });

  it("returns null when an object is missing pos and legacy x/y", () => {
    const { pos: _pos, ...noPos } = makeObject() as Record<string, unknown>;
    expect(parseState(jsonOf({ objects: [noPos] }))).toBeNull();
  });

  it("returns null when dimensions are missing and no resolver", () => {
    const { width: _w, depth: _d, height: _h, ...noDims } = makeObject() as Record<string, unknown>;
    expect(parseState(jsonOf({ objects: [noDims] }))).toBeNull();
  });

  it("returns null for a completely empty objects array (valid)", () => {
    // Empty array IS valid
    const result = parseState(jsonOf({ objects: [] }));
    expect(result).not.toBeNull();
    expect(result!.objects).toHaveLength(0);
  });
});

// ── parseState — basic success ────────────────────────────────────────────────

describe("parseState — basic success", () => {
  it("parses a minimal object with explicit dimensions", () => {
    const result = parseState(jsonOf({ objects: [makeObject()] }));
    expect(result).not.toBeNull();
    expect(result!.objects).toHaveLength(1);
    expect(result!.objects[0].id).toBe("obj-1");
    expect(result!.objects[0].width).toBe(73);
  });

  it("restores zoom, pan, showGrid, unit, background from JSON", () => {
    const result = parseState(
      jsonOf({
        objects: [],
        zoom: 1.5,
        pan: { x: 50, y: -30 },
        showGrid: false,
        unit: "in",
        background: "tiles",
      })
    );
    expect(result!.zoom).toBe(1.5);
    expect(result!.pan).toEqual({ x: 50, y: -30 });
    expect(result!.showGrid).toBe(false);
    expect(result!.unit).toBe("in");
    expect(result!.background).toBe("tiles");
  });

  it("ignores unknown background ID", () => {
    const result = parseState(jsonOf({ objects: [], background: "nonexistent-bg" }));
    expect(result!.background).toBeUndefined();
  });

  it("ignores unknown unit value", () => {
    const result = parseState(jsonOf({ objects: [], unit: "cm" }));
    expect(result!.unit).toBeUndefined();
  });

  it("ignores invalid pan (missing y)", () => {
    const result = parseState(jsonOf({ objects: [], pan: { x: 10 } }));
    expect(result!.pan).toBeUndefined();
  });
});

// ── parseState — legacy coordinate format ─────────────────────────────────────

describe("parseState — legacy x/y coordinates", () => {
  it("supports legacy flat x/y instead of pos object", () => {
    const obj = {
      id: "leg-1",
      subtype: "device",
      type: "pedal",
      brand: "Test",
      model: "T-1",
      templateId: "device-test-1",
      x: 15,
      y: 25,
      width: 50,
      depth: 60,
      height: 30,
    };
    const result = parseState(jsonOf({ objects: [obj] }));
    expect(result).not.toBeNull();
    expect(result!.objects[0].pos).toEqual({ x: 15, y: 25 });
  });
});

// ── parseState — with template resolver ──────────────────────────────────────

describe("parseState — with template resolver", () => {
  it("allows objects without explicit dimensions when resolver reports known template", () => {
    const { width: _w, depth: _d, height: _h, ...noDims } = makeObject() as Record<string, unknown>;
    const result = parseState(jsonOf({ objects: [noDims] }), { templateResolver: makeResolver() });
    expect(result).not.toBeNull();
  });

  it("restores image from resolver", () => {
    const result = parseState(jsonOf({ objects: [makeObject()] }), {
      templateResolver: makeResolver({ getTemplateImage: () => "img/boss-ds1.png" }),
    });
    expect(result!.objects[0].image).toBe("img/boss-ds1.png");
  });

  it("restores dimensions from resolver (template takes precedence)", () => {
    const result = parseState(
      jsonOf({ objects: [{ ...makeObject(), width: 999, depth: 999, height: 999 }] }),
      { templateResolver: makeResolver({ getTemplateWdh: () => [73, 129, 58] }) }
    );
    expect(result!.objects[0].width).toBe(73);
    expect(result!.objects[0].depth).toBe(129);
    expect(result!.objects[0].height).toBe(58);
  });

  it("uses object dims when resolver returns undefined for template wdh", () => {
    const result = parseState(jsonOf({ objects: [makeObject()] }), {
      templateResolver: makeResolver({ getTemplateWdh: () => undefined }),
    });
    expect(result!.objects[0].width).toBe(73);
  });

  it("derives name from brand+model when name field is missing", () => {
    const { name: _name, ...noName } = makeObject() as Record<string, unknown>;
    const result = parseState(jsonOf({ objects: [noName] }));
    expect(result!.objects[0].name).toBe("Boss DS-1");
  });
});

// ── parseState — cables ────────────────────────────────────────────────────────

describe("parseState — cables", () => {
  const validCable = {
    id: "cable-1",
    color: "#ff0000",
    connectorA: "ts-6.35",
    connectorB: "ts-6.35",
    points: [[0, 0], [100, 50], [200, 0]],
  };

  it("parses a valid cable array", () => {
    const result = parseState(jsonOf({ objects: [], cables: [validCable] }));
    expect(result!.cables).toHaveLength(1);
    const cable = result!.cables![0];
    expect(cable.id).toBe("cable-1");
    expect(cable.color).toBe("#ff0000");
    expect(cable.segments).toHaveLength(3);
    expect(cable.segments[0]).toEqual({ x: 0, y: 0 });
    expect(cable.segments[2]).toEqual({ x: 200, y: 0 });
  });

  it("preserves optional connectorAName and connectorBName", () => {
    const cable = { ...validCable, connectorAName: "Output", connectorBName: "Input" };
    const result = parseState(jsonOf({ objects: [], cables: [cable] }));
    expect(result!.cables![0].connectorAName).toBe("Output");
    expect(result!.cables![0].connectorBName).toBe("Input");
  });

  it("returns null when a cable is missing required color field", () => {
    const bad = { ...validCable, color: undefined };
    expect(parseState(jsonOf({ objects: [], cables: [bad] }))).toBeNull();
  });

  it("returns null when cable points is not an array", () => {
    const bad = { ...validCable, points: "not-an-array" };
    expect(parseState(jsonOf({ objects: [], cables: [bad] }))).toBeNull();
  });

  it("returns null when cable points is an empty array", () => {
    const bad = { ...validCable, points: [] };
    expect(parseState(jsonOf({ objects: [], cables: [bad] }))).toBeNull();
  });

  it("returns null when a point tuple has wrong length", () => {
    const bad = { ...validCable, points: [[0, 0, 0]] }; // tuple has 3 items
    expect(parseState(jsonOf({ objects: [], cables: [bad] }))).toBeNull();
  });

  it("returns null when connectorAName is wrong type", () => {
    const bad = { ...validCable, connectorAName: 123 };
    expect(parseState(jsonOf({ objects: [], cables: [bad] }))).toBeNull();
  });
});

// ── parseState — history (past/future) ────────────────────────────────────────

describe("parseState — history", () => {
  const obj = makeObject();

  it("parses past history snapshots", () => {
    const result = parseState(jsonOf({ objects: [obj], past: [[obj], [obj]] }));
    expect(result!.past).toHaveLength(2);
    expect(result!.past![0]).toHaveLength(1);
  });

  it("parses future history snapshots", () => {
    const result = parseState(jsonOf({ objects: [obj], future: [[obj]] }));
    expect(result!.future).toHaveLength(1);
  });

  it("ignores malformed past (not array of arrays)", () => {
    const result = parseState(jsonOf({ objects: [obj], past: [obj] }));
    expect(result!.past).toBeUndefined();
  });
});

// ── serializeState ─────────────────────────────────────────────────────────────

describe("serializeState", () => {
  function makeFullObject(): CanvasObjectType {
    return {
      id: "obj-1",
      subtype: "device",
      type: "pedal",
      brand: "Boss",
      model: "DS-1",
      templateId: "device-boss-ds-1",
      name: "Boss DS-1",
      pos: { x: 10.333, y: 20.666 },
      width: 73,
      depth: 129,
      height: 58,
      image: "images/boss-ds1.png",
      rotation: 0,
    } as CanvasObjectType;
  }

  it("strips image from non-custom objects", () => {
    const state: SavedState = { objects: [makeFullObject()] };
    const serialized = serializeState(state);
    const obj = (serialized.objects as Record<string, unknown>[])[0];
    expect(obj).not.toHaveProperty("image");
  });

  it("strips name from non-custom objects", () => {
    const state: SavedState = { objects: [makeFullObject()] };
    const serialized = serializeState(state);
    const obj = (serialized.objects as Record<string, unknown>[])[0];
    expect(obj).not.toHaveProperty("name");
  });

  it("keeps name for custom objects (templateId = device-custom)", () => {
    const customObj = {
      ...makeFullObject(),
      templateId: "device-custom",
      name: "My Pedal",
    } as CanvasObjectType;
    const state: SavedState = { objects: [customObj] };
    const serialized = serializeState(state);
    const obj = (serialized.objects as Record<string, unknown>[])[0];
    expect(obj.name).toBe("My Pedal");
  });

  it("keeps name for board-custom objects", () => {
    const boardObj = {
      ...makeFullObject(),
      subtype: "board",
      templateId: "board-custom",
      name: "My Board",
    } as CanvasObjectType;
    const state: SavedState = { objects: [boardObj] };
    const serialized = serializeState(state);
    const obj = (serialized.objects as Record<string, unknown>[])[0];
    expect(obj.name).toBe("My Board");
  });

  it("rounds coordinates to 2 decimal places", () => {
    const state: SavedState = { objects: [makeFullObject()] };
    const serialized = serializeState(state);
    const obj = (serialized.objects as Record<string, unknown>[])[0];
    const pos = obj.pos as { x: number; y: number };
    expect(pos.x).toBe(10.33);
    expect(pos.y).toBe(20.67);
  });

  it("rounds pan and zoom", () => {
    const state: SavedState = {
      objects: [],
      pan: { x: 12.3456, y: -5.6789 },
      zoom: 1.2349,
    };
    const serialized = serializeState(state);
    expect(serialized.pan).toEqual({ x: 12.35, y: -5.68 });
    expect(serialized.zoom).toBe(1.23);
  });

  it("omits dimensions for known-template objects when resolver is provided", () => {
    const state: SavedState = { objects: [makeFullObject()] };
    const serialized = serializeState(state, { templateResolver: makeResolver() });
    const obj = (serialized.objects as Record<string, unknown>[])[0];
    expect(obj).not.toHaveProperty("width");
    expect(obj).not.toHaveProperty("depth");
    expect(obj).not.toHaveProperty("height");
  });

  it("keeps dimensions when resolver reports template is NOT known", () => {
    const state: SavedState = { objects: [makeFullObject()] };
    const serialized = serializeState(state, {
      templateResolver: makeResolver({ hasKnownTemplateDimensions: () => false }),
    });
    const obj = (serialized.objects as Record<string, unknown>[])[0];
    expect(obj.width).toBe(73);
  });

  it("serializes cables as point tuples", () => {
    const state: SavedState = {
      objects: [],
      cables: [
        {
          id: "c-1",
          color: "#00ff00",
          connectorA: "ts-6.35",
          connectorB: "ts-6.35",
          segments: [{ x: 0, y: 0 }, { x: 50.123, y: 25.678 }],
        },
      ],
    };
    const serialized = serializeState(state);
    const cables = serialized.cables as Array<Record<string, unknown>>;
    expect(cables).toHaveLength(1);
    const points = cables[0].points as [number, number][];
    expect(points[0]).toEqual([0, 0]);
    expect(points[1]).toEqual([50.12, 25.68]);
  });

  it("serializes and strips segments key from cables", () => {
    const state: SavedState = {
      objects: [],
      cables: [
        {
          id: "c-1",
          color: "#00ff00",
          connectorA: "ts-6.35",
          connectorB: "ts-6.35",
          segments: [{ x: 0, y: 0 }, { x: 100, y: 0 }],
        },
      ],
    };
    const serialized = serializeState(state);
    const cable = (serialized.cables as Record<string, unknown>[])[0];
    expect(cable).not.toHaveProperty("segments");
    expect(cable).toHaveProperty("points");
  });
});

// ── Round-trip ─────────────────────────────────────────────────────────────────

describe("parseState / serializeState round-trip", () => {
  it("round-trips a state with objects and cables", () => {
    const original: SavedState = {
      objects: [
        {
          id: "o1",
          subtype: "device",
          type: "pedal",
          brand: "Boss",
          model: "DS-1",
          templateId: "device-boss-ds-1",
          name: "Boss DS-1",
          pos: { x: 10, y: 20 },
          width: 73,
          depth: 129,
          height: 58,
          image: null,
          rotation: 0,
        } as CanvasObjectType,
      ],
      cables: [
        {
          id: "c1",
          color: "#ff0000",
          connectorA: "ts-6.35",
          connectorB: "ts-6.35",
          connectorAName: "Out",
          connectorBName: "In",
          segments: [{ x: 0, y: 0 }, { x: 100, y: 0 }],
        },
      ],
      zoom: 1.5,
      pan: { x: 10, y: -5 },
      showGrid: true,
      unit: "mm",
      background: "tiles",
    };

    const serialized = serializeState(original);
    const reparsed = parseState(JSON.stringify(serialized));

    expect(reparsed).not.toBeNull();
    expect(reparsed!.objects[0].id).toBe("o1");
    expect(reparsed!.cables).toHaveLength(1);
    expect(reparsed!.cables![0].connectorAName).toBe("Out");
    expect(reparsed!.zoom).toBe(1.5);
    expect(reparsed!.background).toBe("tiles");
  });

  it("round-trips a state with custom objects (keeps name and dims)", () => {
    const original: SavedState = {
      objects: [
        {
          id: "cust-1",
          subtype: "device",
          type: "pedal",
          brand: "",
          model: "My Pedal",
          templateId: "device-custom",
          name: "My Custom Pedal",
          pos: { x: 50, y: 50 },
          width: 80,
          depth: 100,
          height: 40,
          image: null,
          rotation: 90,
        } as CanvasObjectType,
      ],
    };

    const serialized = serializeState(original);
    const reparsed = parseState(JSON.stringify(serialized));

    expect(reparsed!.objects[0].name).toBe("My Custom Pedal");
    expect(reparsed!.objects[0].width).toBe(80);
    expect(reparsed!.objects[0].depth).toBe(100);
  });
});
