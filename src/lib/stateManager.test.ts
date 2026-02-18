import { describe, it, expect } from "vitest";
import {
  parseStateWithRuntimeTemplates as parseState,
  serializeStateWithRuntimeTemplates as serializeState,
} from "./stateSerialization.runtime";
import type { SavedState } from "./stateSerialization";

// A valid object record with all required fields for validation
const validObject = {
  id: "1",
  templateId: "board-unknown-test",
  subtype: "board",
  type: "classic",
  brand: "TestBrand",
  model: "TestModel",
  pos: { x: 0, y: 0 },
  width: 100,
  depth: 200,
  height: 25,
  name: "TestBrand TestModel",
  image: null,
};

// Real template IDs that exist in the codebase
const aclamBoardObject = {
  id: "2",
  templateId: "board-aclam-xs2",
  subtype: "board",
  type: "classic",
  brand: "Aclam",
  model: "Smart Track XS2",
  pos: { x: 10, y: 20 },
  width: 420,
  depth: 250,
  height: 25,
};

const bossDeviceObject = {
  id: "3",
  templateId: "device-boss-ds-1",
  subtype: "device",
  type: "pedal",
  brand: "Boss",
  model: "DS-1",
  pos: { x: 50, y: 60 },
  width: 73,
  depth: 129,
  height: 58,
};

const customBoardObject = {
  id: "4",
  templateId: "board-custom",
  subtype: "board",
  type: "classic",
  brand: "Custom",
  model: "My Board",
  pos: { x: 0, y: 0 },
  width: 500,
  depth: 300,
  height: 30,
  name: "My Custom Board",
};

const customDeviceObject = {
  id: "5",
  templateId: "device-custom",
  subtype: "device",
  type: "pedal",
  brand: "Custom",
  model: "My Pedal",
  pos: { x: 100, y: 100 },
  width: 80,
  depth: 120,
  height: 50,
  name: "My Custom Pedal",
};

describe("parseState", () => {
  describe("validation", () => {
    it("returns null for invalid JSON", () => {
      expect(parseState("not json")).toBe(null);
      expect(parseState("{invalid}")).toBe(null);
      expect(parseState("")).toBe(null);
    });

    it("returns null when objects is missing", () => {
      expect(parseState("{}")).toBe(null);
      expect(parseState('{"zoom":1}')).toBe(null);
      expect(parseState('{"pan":{"x":0,"y":0}}')).toBe(null);
    });

    it("returns null when objects is not an array", () => {
      expect(parseState('{"objects":null}')).toBe(null);
      expect(parseState('{"objects":"string"}')).toBe(null);
      expect(parseState('{"objects":123}')).toBe(null);
      expect(parseState('{"objects":{}}')).toBe(null);
    });

    it("returns null when objects array contains invalid items", () => {
      expect(parseState('{"objects":[null]}')).toBe(null);
      expect(parseState('{"objects":["string"]}')).toBe(null);
      expect(parseState('{"objects":[{"id":"x"}]}')).toBe(null);
    });

    it("returns null when object is missing required fields", () => {
      const missingId = { ...validObject };
      delete (missingId as Record<string, unknown>).id;
      expect(parseState(JSON.stringify({ objects: [missingId] }))).toBe(null);

      const missingSubtype = { ...validObject };
      delete (missingSubtype as Record<string, unknown>).subtype;
      expect(parseState(JSON.stringify({ objects: [missingSubtype] }))).toBe(null);

      const missingPos = { ...validObject };
      delete (missingPos as Record<string, unknown>).pos;
      expect(parseState(JSON.stringify({ objects: [missingPos] }))).toBe(null);
    });

    it("returns null when object has wrong field types", () => {
      expect(parseState(JSON.stringify({ objects: [{ ...validObject, id: 123 }] }))).toBe(null);
      expect(
        parseState(JSON.stringify({ objects: [{ ...validObject, pos: { x: "string", y: 0 } }] }))
      ).toBe(null);
      expect(parseState(JSON.stringify({ objects: [{ ...validObject, width: null }] }))).toBe(null);
    });

    it("accepts known templates even when serialized dimensions are omitted", () => {
      const reference = parseState(JSON.stringify({ objects: [bossDeviceObject] })) as SavedState;
      const fromKnownTemplate = { ...bossDeviceObject };
      delete (fromKnownTemplate as Record<string, unknown>).width;
      delete (fromKnownTemplate as Record<string, unknown>).depth;
      delete (fromKnownTemplate as Record<string, unknown>).height;

      const out = parseState(JSON.stringify({ objects: [fromKnownTemplate] })) as SavedState;
      expect(out.objects[0].width).toBe(reference.objects[0].width);
      expect(out.objects[0].depth).toBe(reference.objects[0].depth);
      expect(out.objects[0].height).toBe(reference.objects[0].height);
    });

    it("rejects unknown templates when dimensions are missing", () => {
      const unknownTemplate = { ...validObject };
      delete (unknownTemplate as Record<string, unknown>).width;
      delete (unknownTemplate as Record<string, unknown>).depth;
      delete (unknownTemplate as Record<string, unknown>).height;

      expect(parseState(JSON.stringify({ objects: [unknownTemplate] }))).toBe(null);
    });

    it("accepts legacy object records with x/y coordinates", () => {
      const legacy = { ...validObject, x: 12, y: 34 };
      delete (legacy as Record<string, unknown>).pos;
      const out = parseState(JSON.stringify({ objects: [legacy] })) as SavedState;
      expect(out.objects[0].pos).toEqual({ x: 12, y: 34 });
    });

    it("accepts empty objects array", () => {
      const out = parseState('{"objects":[]}');
      expect(out).not.toBe(null);
      expect((out as SavedState).objects).toEqual([]);
    });
  });

  describe("image restoration from templates", () => {
    it("restores image for known board template", () => {
      const raw = JSON.stringify({ objects: [aclamBoardObject] });
      const out = parseState(raw) as SavedState;
      expect(out.objects[0].image).toBe("images/boards/aclam/aclam-smart-track-xs2.png");
    });

    it("restores image for known device template", () => {
      const raw = JSON.stringify({ objects: [bossDeviceObject] });
      const out = parseState(raw) as SavedState;
      expect(out.objects[0].image).toBe("images/devices/boss/boss-ds1.png");
    });

    it("returns null image for unknown template id", () => {
      const raw = JSON.stringify({ objects: [validObject] });
      const out = parseState(raw) as SavedState;
      expect(out.objects[0].image).toBe(null);
    });

    it("returns null image for custom board objects", () => {
      const raw = JSON.stringify({ objects: [customBoardObject] });
      const out = parseState(raw) as SavedState;
      expect(out.objects[0].image).toBe(null);
    });

    it("returns null image for custom device objects", () => {
      const raw = JSON.stringify({ objects: [customDeviceObject] });
      const out = parseState(raw) as SavedState;
      expect(out.objects[0].image).toBe(null);
    });

    it("restores images in past history", () => {
      const raw = JSON.stringify({
        objects: [validObject],
        past: [[bossDeviceObject]],
      });
      const out = parseState(raw) as SavedState;
      expect(out.past![0][0].image).toBe("images/devices/boss/boss-ds1.png");
    });

    it("restores images in future history", () => {
      const raw = JSON.stringify({
        objects: [validObject],
        future: [[aclamBoardObject]],
      });
      const out = parseState(raw) as SavedState;
      expect(out.future![0][0].image).toBe("images/boards/aclam/aclam-smart-track-xs2.png");
    });
  });

  describe("name derivation", () => {
    it("preserves existing name when provided", () => {
      const raw = JSON.stringify({ objects: [{ ...validObject, name: "Custom Name" }] });
      const out = parseState(raw) as SavedState;
      expect(out.objects[0].name).toBe("Custom Name");
    });

    it("derives name from brand and model when name is missing", () => {
      const obj = { ...validObject, brand: "TestBrand", model: "TestModel" };
      delete (obj as Record<string, unknown>).name;
      const raw = JSON.stringify({ objects: [obj] });
      const out = parseState(raw) as SavedState;
      expect(out.objects[0].name).toBe("TestBrand TestModel");
    });

    it("uses type as fallback when brand and model are empty", () => {
      const obj = { ...validObject, brand: "", model: "", type: "pedal" };
      delete (obj as Record<string, unknown>).name;
      const raw = JSON.stringify({ objects: [obj] });
      const out = parseState(raw) as SavedState;
      expect(out.objects[0].name).toBe("pedal");
    });

    it("falls back to 'Object' when brand, model, and type are all empty", () => {
      const obj = { ...validObject, brand: "", model: "", type: "" };
      delete (obj as Record<string, unknown>).name;
      const raw = JSON.stringify({ objects: [obj] });
      const out = parseState(raw) as SavedState;
      expect(out.objects[0].name).toBe("Object");
    });
  });

  describe("optional fields parsing", () => {
    it("parses zoom when valid number", () => {
      const raw = JSON.stringify({ objects: [validObject], zoom: 1.5 });
      const out = parseState(raw) as SavedState;
      expect(out.zoom).toBe(1.5);
    });

    it("ignores zoom when not a number", () => {
      const raw = JSON.stringify({ objects: [validObject], zoom: "1.5" });
      const out = parseState(raw) as SavedState;
      expect(out.zoom).toBeUndefined();
    });

    it("parses pan when valid object with x and y numbers", () => {
      const raw = JSON.stringify({ objects: [validObject], pan: { x: 10.5, y: 20.5 } });
      const out = parseState(raw) as SavedState;
      expect(out.pan).toEqual({ x: 10.5, y: 20.5 });
    });

    it("ignores pan when x is not a number", () => {
      const raw = JSON.stringify({ objects: [validObject], pan: { x: "10", y: 20 } });
      const out = parseState(raw) as SavedState;
      expect(out.pan).toBeUndefined();
    });

    it("ignores pan when y is missing", () => {
      const raw = JSON.stringify({ objects: [validObject], pan: { x: 10 } });
      const out = parseState(raw) as SavedState;
      expect(out.pan).toBeUndefined();
    });

    it("ignores pan when null", () => {
      const raw = JSON.stringify({ objects: [validObject], pan: null });
      const out = parseState(raw) as SavedState;
      expect(out.pan).toBeUndefined();
    });

    it("parses unit when 'mm' or 'in'", () => {
      expect((parseState(JSON.stringify({ objects: [validObject], unit: "mm" })) as SavedState).unit).toBe(
        "mm"
      );
      expect((parseState(JSON.stringify({ objects: [validObject], unit: "in" })) as SavedState).unit).toBe(
        "in"
      );
    });

    it("ignores unit when invalid", () => {
      expect(
        (parseState(JSON.stringify({ objects: [validObject], unit: "cm" })) as SavedState).unit
      ).toBeUndefined();
      expect(
        (parseState(JSON.stringify({ objects: [validObject], unit: 123 })) as SavedState).unit
      ).toBeUndefined();
    });

    it("parses background when valid", () => {
      expect(
        (parseState(JSON.stringify({ objects: [validObject], background: "floorboards" })) as SavedState).background
      ).toBe("floorboards");
      expect(
        (parseState(JSON.stringify({ objects: [validObject], background: "concrete" })) as SavedState).background
      ).toBe("concrete");
    });

    it("ignores background when invalid", () => {
      expect(
        (parseState(JSON.stringify({ objects: [validObject], background: "brick" })) as SavedState).background
      ).toBeUndefined();
      expect(
        (parseState(JSON.stringify({ objects: [validObject], background: 42 })) as SavedState).background
      ).toBeUndefined();
    });

    it("parses showGrid when boolean", () => {
      expect(
        (parseState(JSON.stringify({ objects: [validObject], showGrid: true })) as SavedState).showGrid
      ).toBe(true);
      expect(
        (parseState(JSON.stringify({ objects: [validObject], showGrid: false })) as SavedState).showGrid
      ).toBe(false);
    });

    it("ignores showGrid when not boolean", () => {
      expect(
        (parseState(JSON.stringify({ objects: [validObject], showGrid: "true" })) as SavedState).showGrid
      ).toBeUndefined();
      expect(
        (parseState(JSON.stringify({ objects: [validObject], showGrid: 1 })) as SavedState).showGrid
      ).toBeUndefined();
    });
  });

  describe("history (past/future) parsing", () => {
    it("parses past when valid array of object arrays", () => {
      const raw = JSON.stringify({
        objects: [validObject],
        past: [[validObject], [validObject, validObject]],
      });
      const out = parseState(raw) as SavedState;
      expect(out.past).toHaveLength(2);
      expect(out.past![0]).toHaveLength(1);
      expect(out.past![1]).toHaveLength(2);
    });

    it("ignores past when not an array", () => {
      const raw = JSON.stringify({ objects: [validObject], past: "invalid" });
      const out = parseState(raw) as SavedState;
      expect(out.past).toBeUndefined();
    });

    it("ignores past when contains non-arrays", () => {
      const raw = JSON.stringify({ objects: [validObject], past: [validObject] });
      const out = parseState(raw) as SavedState;
      expect(out.past).toBeUndefined();
    });

    it("ignores past when contains invalid objects", () => {
      const raw = JSON.stringify({ objects: [validObject], past: [[{ id: "invalid" }]] });
      const out = parseState(raw) as SavedState;
      expect(out.past).toBeUndefined();
    });

    it("parses future when valid", () => {
      const raw = JSON.stringify({ objects: [validObject], future: [[validObject]] });
      const out = parseState(raw) as SavedState;
      expect(out.future).toHaveLength(1);
    });

    it("handles empty past and future arrays", () => {
      const raw = JSON.stringify({ objects: [validObject], past: [], future: [] });
      const out = parseState(raw) as SavedState;
      expect(out.past).toEqual([]);
      expect(out.future).toEqual([]);
    });
  });

  describe("cable parsing", () => {
    it("parses cables with points", () => {
      const raw = JSON.stringify({
        objects: [validObject],
        cables: [
          {
            id: "c1",
            color: "#111111",
            connectorA: "mono jack (TS)",
            connectorB: "mono jack (TS)",
            points: [
              [0, 0],
              [100, 0],
            ],
          },
        ],
      });
      const out = parseState(raw) as SavedState;
      expect(out.cables).toEqual([
        {
          id: "c1",
          color: "#111111",
          connectorA: "mono jack (TS)",
          connectorB: "mono jack (TS)",
          segments: [{ x: 0, y: 0 }, { x: 100, y: 0 }],
        },
      ]);
    });

    it("parses optional connector names", () => {
      const raw = JSON.stringify({
        objects: [validObject],
        cables: [
          {
            id: "c2",
            color: "#222222",
            connectorA: "stereo jack (TRS)",
            connectorB: "MIDI (DIN)",
            connectorAName: "Output",
            connectorBName: "MIDI In",
            points: [
              [10, 20],
              [30, 40],
            ],
          },
        ],
      });
      const out = parseState(raw) as SavedState;

      expect(out.cables).toEqual([
        {
          id: "c2",
          color: "#222222",
          connectorA: "stereo jack (TRS)",
          connectorB: "MIDI (DIN)",
          connectorAName: "Output",
          connectorBName: "MIDI In",
          segments: [{ x: 10, y: 20 }, { x: 30, y: 40 }],
        },
      ]);
    });

    it("ignores cables when payload is not an array", () => {
      const out = parseState(JSON.stringify({ objects: [validObject], cables: "invalid" })) as SavedState;
      expect(out.cables).toBeUndefined();
    });

    it("ignores cables when any cable record is invalid", () => {
      const out = parseState(
        JSON.stringify({
          objects: [validObject],
          cables: [
            {
              id: "c1",
              color: "#111111",
              connectorA: "mono jack (TS)",
              connectorB: "mono jack (TS)",
              points: [
                [0, 0],
                [100, 0],
              ],
            },
            {
              id: "bad",
              color: "#f00",
              connectorA: "mono jack (TS)",
              connectorB: "mono jack (TS)",
              points: [[0, 0, 1]], // invalid tuple length
            },
          ],
        })
      ) as SavedState;

      expect(out.cables).toBeUndefined();
    });

    it("parses empty cable arrays", () => {
      const out = parseState(JSON.stringify({ objects: [validObject], cables: [] })) as SavedState;
      expect(out.cables).toEqual([]);
    });
  });

});

describe("serializeState", () => {
  describe("coordinate rounding", () => {
    it("rounds object coordinates to 2 decimal places", () => {
      const state: SavedState = {
        objects: [{ ...validObject, pos: { x: 1.234567, y: 5.6789 } } as SavedState["objects"][0]],
      };
      const ser = serializeState(state);
      const obj = (ser.objects as Record<string, unknown>[])[0];
      expect(obj.pos).toEqual({ x: 1.23, y: 5.68 });
    });

    it("rounds pan coordinates to 2 decimal places", () => {
      const state: SavedState = {
        objects: [],
        pan: { x: 100.999, y: 200.111 },
      };
      const ser = serializeState(state);
      expect(ser.pan).toEqual({ x: 101, y: 200.11 });
    });

    it("handles zero and negative coordinates", () => {
      const state: SavedState = {
        objects: [{ ...validObject, pos: { x: 0, y: -10.556 } } as SavedState["objects"][0]],
      };
      const ser = serializeState(state);
      const obj = (ser.objects as Record<string, unknown>[])[0];
      expect(obj.pos).toEqual({ x: 0, y: -10.56 });
    });
  });

  describe("image stripping", () => {
    it("strips image from all objects", () => {
      const state: SavedState = {
        objects: [{ ...validObject, image: "some/path.png" } as SavedState["objects"][0]],
      };
      const ser = serializeState(state);
      const obj = (ser.objects as Record<string, unknown>[])[0];
      expect(obj.image).toBeUndefined();
    });

    it("strips image from past and future history", () => {
      const state: SavedState = {
        objects: [],
        past: [[{ ...validObject, image: "past.png" } as SavedState["objects"][0]]],
        future: [[{ ...validObject, image: "future.png" } as SavedState["objects"][0]]],
      };
      const ser = serializeState(state);
      expect(((ser.past as unknown[][])[0][0] as Record<string, unknown>).image).toBeUndefined();
      expect(((ser.future as unknown[][])[0][0] as Record<string, unknown>).image).toBeUndefined();
    });
  });

  describe("name handling for custom vs non-custom objects", () => {
    it("preserves name for custom board objects", () => {
      const state: SavedState = {
        objects: [customBoardObject as SavedState["objects"][0]],
      };
      const ser = serializeState(state);
      const obj = (ser.objects as Record<string, unknown>[])[0];
      expect(obj.name).toBe("My Custom Board");
    });

    it("preserves name for custom device objects", () => {
      const state: SavedState = {
        objects: [customDeviceObject as SavedState["objects"][0]],
      };
      const ser = serializeState(state);
      const obj = (ser.objects as Record<string, unknown>[])[0];
      expect(obj.name).toBe("My Custom Pedal");
    });

    it("strips name for non-custom objects", () => {
      const state: SavedState = {
        objects: [{ ...validObject, name: "Should be stripped" } as SavedState["objects"][0]],
      };
      const ser = serializeState(state);
      const obj = (ser.objects as Record<string, unknown>[])[0];
      expect(obj.name).toBeUndefined();
    });

    it("strips name for template-based objects", () => {
      const state: SavedState = {
        objects: [{ ...bossDeviceObject, name: "Boss DS-1" } as SavedState["objects"][0]],
      };
      const ser = serializeState(state);
      const obj = (ser.objects as Record<string, unknown>[])[0];
      expect(obj.name).toBeUndefined();
    });
  });

  describe("history serialization", () => {
    it("serializes past when present", () => {
      const state: SavedState = {
        objects: [validObject as SavedState["objects"][0]],
        past: [[validObject as SavedState["objects"][0]]],
      };
      const ser = serializeState(state);
      expect(ser.past).toHaveLength(1);
    });

    it("serializes future when present", () => {
      const state: SavedState = {
        objects: [validObject as SavedState["objects"][0]],
        future: [[validObject as SavedState["objects"][0]]],
      };
      const ser = serializeState(state);
      expect(ser.future).toHaveLength(1);
    });

    it("handles undefined past and future", () => {
      const state: SavedState = { objects: [] };
      const ser = serializeState(state);
      expect(ser.past).toBeUndefined();
      expect(ser.future).toBeUndefined();
    });
  });

  describe("cable serialization", () => {
    it("serializes cable segments as rounded point tuples", () => {
      const state: SavedState = {
        objects: [],
        cables: [
          {
            id: "cable-1",
            color: "#abcdef",
            connectorA: "mono jack (TS)",
            connectorB: "XLR male",
            segments: [
              { x: 1.2345, y: 2.3456 },
              { x: -9.8765, y: 4.4444 },
            ],
          },
        ],
      };

      const ser = serializeState(state);
      expect(ser.cables).toEqual([
        {
          id: "cable-1",
          color: "#abcdef",
          connectorA: "mono jack (TS)",
          connectorB: "XLR male",
          points: [
            [1.23, 2.35],
            [-9.88, 4.44],
          ],
        },
      ]);
    });

    it("preserves optional connector labels during serialization", () => {
      const state: SavedState = {
        objects: [],
        cables: [
          {
            id: "cable-2",
            color: "#333333",
            connectorA: "MIDI (DIN)",
            connectorB: "MIDI (DIN female)",
            connectorAName: "Out",
            connectorBName: "In",
            segments: [{ x: 0, y: 0 }, { x: 50, y: 50 }],
          },
        ],
      };

      const ser = serializeState(state);
      expect((ser.cables as Record<string, unknown>[])[0]).toMatchObject({
        connectorAName: "Out",
        connectorBName: "In",
      });
    });

    it("keeps empty cable arrays as empty arrays", () => {
      const state: SavedState = { objects: [], cables: [] };
      const ser = serializeState(state);
      expect(ser.cables).toEqual([]);
    });
  });

  describe("other fields", () => {
    it("preserves zoom", () => {
      const state: SavedState = { objects: [], zoom: 2.5 };
      const ser = serializeState(state);
      expect(ser.zoom).toBe(2.5);
    });

    it("preserves showGrid", () => {
      const state: SavedState = { objects: [], showGrid: true };
      const ser = serializeState(state);
      expect(ser.showGrid).toBe(true);
    });

    it("preserves unit", () => {
      const state: SavedState = { objects: [], unit: "in" };
      const ser = serializeState(state);
      expect(ser.unit).toBe("in");
    });

    it("preserves background", () => {
      const state: SavedState = { objects: [], background: "studio-grid" };
      const ser = serializeState(state);
      expect(ser.background).toBe("studio-grid");
    });
  });
});

describe("round-trip serialization", () => {
  it("preserves object data through serialize -> parse cycle", () => {
    const original: SavedState = {
      objects: [
        { ...bossDeviceObject, pos: { x: 123.456, y: 789.123 } } as SavedState["objects"][0],
        { ...aclamBoardObject, pos: { x: 0, y: 0 } } as SavedState["objects"][0],
      ],
      zoom: 1.5,
      pan: { x: 100.999, y: 200.111 },
      unit: "mm",
      showGrid: true,
    };

    const serialized = serializeState(original);
    const json = JSON.stringify(serialized);
    const parsed = parseState(json) as SavedState;

    expect(parsed.objects).toHaveLength(2);
    expect(parsed.objects[0].pos).toEqual({ x: 123.46, y: 789.12 }); // rounded
    expect(parsed.objects[0].image).toBe("images/devices/boss/boss-ds1.png"); // restored from template
    expect(parsed.objects[1].image).toBe("images/boards/aclam/aclam-smart-track-xs2.png"); // restored from template
    expect(parsed.zoom).toBe(1.5);
    expect(parsed.pan).toEqual({ x: 101, y: 200.11 }); // rounded
    expect(parsed.unit).toBe("mm");
    expect(parsed.showGrid).toBe(true);
  });

  it("preserves custom object names through round-trip", () => {
    const original: SavedState = {
      objects: [customBoardObject as SavedState["objects"][0]],
    };

    const serialized = serializeState(original);
    const json = JSON.stringify(serialized);
    const parsed = parseState(json) as SavedState;

    expect(parsed.objects[0].name).toBe("My Custom Board");
    expect(parsed.objects[0].image).toBe(null); // custom objects have no template image
  });

  it("derives name for non-custom objects after round-trip", () => {
    const original: SavedState = {
      objects: [{ ...bossDeviceObject, name: "Boss DS-1" } as SavedState["objects"][0]],
    };

    const serialized = serializeState(original);
    const json = JSON.stringify(serialized);
    const parsed = parseState(json) as SavedState;

    // Name was stripped during serialization, then derived from brand+model
    expect(parsed.objects[0].name).toBe("Boss DS-1");
  });

  it("round-trips cable data", () => {
    const original: SavedState = {
      objects: [validObject as SavedState["objects"][0]],
      cables: [
        {
          id: "c-round",
          color: "#123456",
          connectorA: "mono jack (TS)",
          connectorB: "stereo jack (TRS)",
          connectorAName: "Send",
          connectorBName: "Return",
          segments: [
            { x: 0.111, y: 1.999 },
            { x: 44.444, y: 55.555 },
          ],
        },
      ],
    };

    const parsed = parseState(JSON.stringify(serializeState(original))) as SavedState;

    expect(parsed.cables).toEqual([
      {
        id: "c-round",
        color: "#123456",
        connectorA: "mono jack (TS)",
        connectorB: "stereo jack (TRS)",
        connectorAName: "Send",
        connectorBName: "Return",
        segments: [
          { x: 0.11, y: 2 },
          { x: 44.44, y: 55.56 },
        ],
      },
    ]);
  });
});
