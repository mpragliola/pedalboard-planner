import { describe, it, expect } from "vitest";
import { StateManager } from "./stateManager";
import type { SavedState } from "./stateManager";
import type { Connector } from "../types";

// A valid object record with all required fields for validation
const validObject = {
  id: "1",
  templateId: "board-unknown-test",
  subtype: "board",
  type: "classic",
  brand: "TestBrand",
  model: "TestModel",
  x: 0,
  y: 0,
  width: 100,
  depth: 200,
  height: 25,
  name: "TestBrand TestModel",
  image: null,
};

// Real template IDs that exist in the codebase
const aclamBoardObject = {
  id: "2",
  templateId: "board-aclam-xs1",
  subtype: "board",
  type: "classic",
  brand: "Aclam",
  model: "Smart Track XS1",
  x: 10,
  y: 20,
  width: 420,
  depth: 125,
  height: 25,
};

const bossDeviceObject = {
  id: "3",
  templateId: "device-boss-ds-1",
  subtype: "device",
  type: "pedal",
  brand: "Boss",
  model: "DS-1",
  x: 50,
  y: 60,
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
  x: 0,
  y: 0,
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
  x: 100,
  y: 100,
  width: 80,
  depth: 120,
  height: 50,
  name: "My Custom Pedal",
};

describe("StateManager.parseState", () => {
  describe("validation", () => {
    it("returns null for invalid JSON", () => {
      expect(StateManager.parseState("not json")).toBe(null);
      expect(StateManager.parseState("{invalid}")).toBe(null);
      expect(StateManager.parseState("")).toBe(null);
    });

    it("returns null when objects is missing", () => {
      expect(StateManager.parseState("{}")).toBe(null);
      expect(StateManager.parseState('{"zoom":1}')).toBe(null);
      expect(StateManager.parseState('{"pan":{"x":0,"y":0}}')).toBe(null);
    });

    it("returns null when objects is not an array", () => {
      expect(StateManager.parseState('{"objects":null}')).toBe(null);
      expect(StateManager.parseState('{"objects":"string"}')).toBe(null);
      expect(StateManager.parseState('{"objects":123}')).toBe(null);
      expect(StateManager.parseState('{"objects":{}}')).toBe(null);
    });

    it("returns null when objects array contains invalid items", () => {
      expect(StateManager.parseState('{"objects":[null]}')).toBe(null);
      expect(StateManager.parseState('{"objects":["string"]}')).toBe(null);
      expect(StateManager.parseState('{"objects":[{"id":"x"}]}')).toBe(null);
    });

    it("returns null when object is missing required fields", () => {
      const missingId = { ...validObject };
      delete (missingId as Record<string, unknown>).id;
      expect(StateManager.parseState(JSON.stringify({ objects: [missingId] }))).toBe(null);

      const missingSubtype = { ...validObject };
      delete (missingSubtype as Record<string, unknown>).subtype;
      expect(StateManager.parseState(JSON.stringify({ objects: [missingSubtype] }))).toBe(null);

      const missingX = { ...validObject };
      delete (missingX as Record<string, unknown>).x;
      expect(StateManager.parseState(JSON.stringify({ objects: [missingX] }))).toBe(null);
    });

    it("returns null when object has wrong field types", () => {
      expect(StateManager.parseState(JSON.stringify({ objects: [{ ...validObject, id: 123 }] }))).toBe(null);
      expect(StateManager.parseState(JSON.stringify({ objects: [{ ...validObject, x: "string" }] }))).toBe(null);
      expect(StateManager.parseState(JSON.stringify({ objects: [{ ...validObject, width: null }] }))).toBe(null);
    });

    it("accepts empty objects array", () => {
      const out = StateManager.parseState('{"objects":[]}');
      expect(out).not.toBe(null);
      expect((out as SavedState).objects).toEqual([]);
    });
  });

  describe("image restoration from templates", () => {
    it("restores image for known board template", () => {
      const raw = JSON.stringify({ objects: [aclamBoardObject] });
      const out = StateManager.parseState(raw) as SavedState;
      expect(out.objects[0].image).toBe("images/boards/aclam/aclam-smart-track-xs1.png");
    });

    it("restores image for known device template", () => {
      const raw = JSON.stringify({ objects: [bossDeviceObject] });
      const out = StateManager.parseState(raw) as SavedState;
      expect(out.objects[0].image).toBe("images/devices/boss/boss-ds1.png");
    });

    it("returns null image for unknown template id", () => {
      const raw = JSON.stringify({ objects: [validObject] });
      const out = StateManager.parseState(raw) as SavedState;
      expect(out.objects[0].image).toBe(null);
    });

    it("returns null image for custom board objects", () => {
      const raw = JSON.stringify({ objects: [customBoardObject] });
      const out = StateManager.parseState(raw) as SavedState;
      expect(out.objects[0].image).toBe(null);
    });

    it("returns null image for custom device objects", () => {
      const raw = JSON.stringify({ objects: [customDeviceObject] });
      const out = StateManager.parseState(raw) as SavedState;
      expect(out.objects[0].image).toBe(null);
    });

    it("restores images in past history", () => {
      const raw = JSON.stringify({
        objects: [validObject],
        past: [[bossDeviceObject]],
      });
      const out = StateManager.parseState(raw) as SavedState;
      expect(out.past![0][0].image).toBe("images/devices/boss/boss-ds1.png");
    });

    it("restores images in future history", () => {
      const raw = JSON.stringify({
        objects: [validObject],
        future: [[aclamBoardObject]],
      });
      const out = StateManager.parseState(raw) as SavedState;
      expect(out.future![0][0].image).toBe("images/boards/aclam/aclam-smart-track-xs1.png");
    });
  });

  describe("name derivation", () => {
    it("preserves existing name when provided", () => {
      const raw = JSON.stringify({ objects: [{ ...validObject, name: "Custom Name" }] });
      const out = StateManager.parseState(raw) as SavedState;
      expect(out.objects[0].name).toBe("Custom Name");
    });

    it("derives name from brand and model when name is missing", () => {
      const obj = { ...validObject, brand: "TestBrand", model: "TestModel" };
      delete (obj as Record<string, unknown>).name;
      const raw = JSON.stringify({ objects: [obj] });
      const out = StateManager.parseState(raw) as SavedState;
      expect(out.objects[0].name).toBe("TestBrand TestModel");
    });

    it("uses type as fallback when brand and model are empty", () => {
      const obj = { ...validObject, brand: "", model: "", type: "pedal" };
      delete (obj as Record<string, unknown>).name;
      const raw = JSON.stringify({ objects: [obj] });
      const out = StateManager.parseState(raw) as SavedState;
      expect(out.objects[0].name).toBe("pedal");
    });

    it("uses empty type string when brand and model are empty", () => {
      // When type is empty string, name becomes empty string (type is used as fallback)
      const obj = { ...validObject, brand: "", model: "", type: "" };
      delete (obj as Record<string, unknown>).name;
      const raw = JSON.stringify({ objects: [obj] });
      const out = StateManager.parseState(raw) as SavedState;
      // The logic uses type as fallback, so empty type -> empty name
      expect(out.objects[0].name).toBe("");
    });
  });

  describe("optional fields parsing", () => {
    it("parses zoom when valid number", () => {
      const raw = JSON.stringify({ objects: [validObject], zoom: 1.5 });
      const out = StateManager.parseState(raw) as SavedState;
      expect(out.zoom).toBe(1.5);
    });

    it("ignores zoom when not a number", () => {
      const raw = JSON.stringify({ objects: [validObject], zoom: "1.5" });
      const out = StateManager.parseState(raw) as SavedState;
      expect(out.zoom).toBeUndefined();
    });

    it("parses pan when valid object with x and y numbers", () => {
      const raw = JSON.stringify({ objects: [validObject], pan: { x: 10.5, y: 20.5 } });
      const out = StateManager.parseState(raw) as SavedState;
      expect(out.pan).toEqual({ x: 10.5, y: 20.5 });
    });

    it("ignores pan when x is not a number", () => {
      const raw = JSON.stringify({ objects: [validObject], pan: { x: "10", y: 20 } });
      const out = StateManager.parseState(raw) as SavedState;
      expect(out.pan).toBeUndefined();
    });

    it("ignores pan when y is missing", () => {
      const raw = JSON.stringify({ objects: [validObject], pan: { x: 10 } });
      const out = StateManager.parseState(raw) as SavedState;
      expect(out.pan).toBeUndefined();
    });

    it("ignores pan when null", () => {
      const raw = JSON.stringify({ objects: [validObject], pan: null });
      const out = StateManager.parseState(raw) as SavedState;
      expect(out.pan).toBeUndefined();
    });

    it("parses unit when 'mm' or 'in'", () => {
      expect((StateManager.parseState(JSON.stringify({ objects: [validObject], unit: "mm" })) as SavedState).unit).toBe(
        "mm"
      );
      expect((StateManager.parseState(JSON.stringify({ objects: [validObject], unit: "in" })) as SavedState).unit).toBe(
        "in"
      );
    });

    it("ignores unit when invalid", () => {
      expect(
        (StateManager.parseState(JSON.stringify({ objects: [validObject], unit: "cm" })) as SavedState).unit
      ).toBeUndefined();
      expect(
        (StateManager.parseState(JSON.stringify({ objects: [validObject], unit: 123 })) as SavedState).unit
      ).toBeUndefined();
    });

    it("parses showGrid when boolean", () => {
      expect(
        (StateManager.parseState(JSON.stringify({ objects: [validObject], showGrid: true })) as SavedState).showGrid
      ).toBe(true);
      expect(
        (StateManager.parseState(JSON.stringify({ objects: [validObject], showGrid: false })) as SavedState).showGrid
      ).toBe(false);
    });

    it("ignores showGrid when not boolean", () => {
      expect(
        (StateManager.parseState(JSON.stringify({ objects: [validObject], showGrid: "true" })) as SavedState).showGrid
      ).toBeUndefined();
      expect(
        (StateManager.parseState(JSON.stringify({ objects: [validObject], showGrid: 1 })) as SavedState).showGrid
      ).toBeUndefined();
    });
  });

  describe("history (past/future) parsing", () => {
    it("parses past when valid array of object arrays", () => {
      const raw = JSON.stringify({
        objects: [validObject],
        past: [[validObject], [validObject, validObject]],
      });
      const out = StateManager.parseState(raw) as SavedState;
      expect(out.past).toHaveLength(2);
      expect(out.past![0]).toHaveLength(1);
      expect(out.past![1]).toHaveLength(2);
    });

    it("ignores past when not an array", () => {
      const raw = JSON.stringify({ objects: [validObject], past: "invalid" });
      const out = StateManager.parseState(raw) as SavedState;
      expect(out.past).toBeUndefined();
    });

    it("ignores past when contains non-arrays", () => {
      const raw = JSON.stringify({ objects: [validObject], past: [validObject] });
      const out = StateManager.parseState(raw) as SavedState;
      expect(out.past).toBeUndefined();
    });

    it("ignores past when contains invalid objects", () => {
      const raw = JSON.stringify({ objects: [validObject], past: [[{ id: "invalid" }]] });
      const out = StateManager.parseState(raw) as SavedState;
      expect(out.past).toBeUndefined();
    });

    it("parses future when valid", () => {
      const raw = JSON.stringify({ objects: [validObject], future: [[validObject]] });
      const out = StateManager.parseState(raw) as SavedState;
      expect(out.future).toHaveLength(1);
    });

    it("handles empty past and future arrays", () => {
      const raw = JSON.stringify({ objects: [validObject], past: [], future: [] });
      const out = StateManager.parseState(raw) as SavedState;
      expect(out.past).toEqual([]);
      expect(out.future).toEqual([]);
    });
  });

  describe("connectors parsing", () => {
    const validConnector = {
      id: "conn-1",
      deviceA: "device-1",
      deviceB: "device-2",
      type: "audio",
      connectorA: "mono jack (TS)",
      connectorB: "mono jack (TS)",
    };

    it("parses connectors when valid array", () => {
      const raw = JSON.stringify({ objects: [validObject], connectors: [validConnector] });
      const out = StateManager.parseState(raw) as SavedState;
      expect(out.connectors).toHaveLength(1);
      expect(out.connectors![0]).toEqual(validConnector);
    });

    it("parses multiple connectors", () => {
      const raw = JSON.stringify({
        objects: [validObject],
        connectors: [validConnector, { ...validConnector, id: "conn-2" }],
      });
      const out = StateManager.parseState(raw) as SavedState;
      expect(out.connectors).toHaveLength(2);
    });

    it("ignores connectors when not an array", () => {
      const raw = JSON.stringify({ objects: [validObject], connectors: validConnector });
      const out = StateManager.parseState(raw) as SavedState;
      expect(out.connectors).toBeUndefined();
    });

    it("ignores connectors when array contains invalid items", () => {
      const invalidConnector = { ...validConnector };
      delete (invalidConnector as Record<string, unknown>).deviceA;
      const raw = JSON.stringify({ objects: [validObject], connectors: [invalidConnector] });
      const out = StateManager.parseState(raw) as SavedState;
      expect(out.connectors).toBeUndefined();
    });

    it("ignores connectors when fields have wrong types", () => {
      const raw = JSON.stringify({ objects: [validObject], connectors: [{ ...validConnector, id: 123 }] });
      const out = StateManager.parseState(raw) as SavedState;
      expect(out.connectors).toBeUndefined();
    });

    it("handles empty connectors array", () => {
      const raw = JSON.stringify({ objects: [validObject], connectors: [] });
      const out = StateManager.parseState(raw) as SavedState;
      expect(out.connectors).toEqual([]);
    });
  });
});

describe("StateManager.serializeState", () => {
  describe("coordinate rounding", () => {
    it("rounds object coordinates to 2 decimal places", () => {
      const state: SavedState = {
        objects: [{ ...validObject, x: 1.234567, y: 5.6789 } as SavedState["objects"][0]],
      };
      const ser = StateManager.serializeState(state);
      const obj = (ser.objects as Record<string, unknown>[])[0];
      expect(obj.x).toBe(1.23);
      expect(obj.y).toBe(5.68);
    });

    it("rounds pan coordinates to 2 decimal places", () => {
      const state: SavedState = {
        objects: [],
        pan: { x: 100.999, y: 200.111 },
      };
      const ser = StateManager.serializeState(state);
      expect(ser.pan).toEqual({ x: 101, y: 200.11 });
    });

    it("handles zero and negative coordinates", () => {
      const state: SavedState = {
        objects: [{ ...validObject, x: 0, y: -10.556 } as SavedState["objects"][0]],
      };
      const ser = StateManager.serializeState(state);
      const obj = (ser.objects as Record<string, unknown>[])[0];
      expect(obj.x).toBe(0);
      expect(obj.y).toBe(-10.56);
    });
  });

  describe("image stripping", () => {
    it("strips image from all objects", () => {
      const state: SavedState = {
        objects: [{ ...validObject, image: "some/path.png" } as SavedState["objects"][0]],
      };
      const ser = StateManager.serializeState(state);
      const obj = (ser.objects as Record<string, unknown>[])[0];
      expect(obj.image).toBeUndefined();
    });

    it("strips image from past and future history", () => {
      const state: SavedState = {
        objects: [],
        past: [[{ ...validObject, image: "past.png" } as SavedState["objects"][0]]],
        future: [[{ ...validObject, image: "future.png" } as SavedState["objects"][0]]],
      };
      const ser = StateManager.serializeState(state);
      expect(((ser.past as unknown[][])[0][0] as Record<string, unknown>).image).toBeUndefined();
      expect(((ser.future as unknown[][])[0][0] as Record<string, unknown>).image).toBeUndefined();
    });
  });

  describe("name handling for custom vs non-custom objects", () => {
    it("preserves name for custom board objects", () => {
      const state: SavedState = {
        objects: [customBoardObject as SavedState["objects"][0]],
      };
      const ser = StateManager.serializeState(state);
      const obj = (ser.objects as Record<string, unknown>[])[0];
      expect(obj.name).toBe("My Custom Board");
    });

    it("preserves name for custom device objects", () => {
      const state: SavedState = {
        objects: [customDeviceObject as SavedState["objects"][0]],
      };
      const ser = StateManager.serializeState(state);
      const obj = (ser.objects as Record<string, unknown>[])[0];
      expect(obj.name).toBe("My Custom Pedal");
    });

    it("strips name for non-custom objects", () => {
      const state: SavedState = {
        objects: [{ ...validObject, name: "Should be stripped" } as SavedState["objects"][0]],
      };
      const ser = StateManager.serializeState(state);
      const obj = (ser.objects as Record<string, unknown>[])[0];
      expect(obj.name).toBeUndefined();
    });

    it("strips name for template-based objects", () => {
      const state: SavedState = {
        objects: [{ ...bossDeviceObject, name: "Boss DS-1" } as SavedState["objects"][0]],
      };
      const ser = StateManager.serializeState(state);
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
      const ser = StateManager.serializeState(state);
      expect(ser.past).toHaveLength(1);
    });

    it("serializes future when present", () => {
      const state: SavedState = {
        objects: [validObject as SavedState["objects"][0]],
        future: [[validObject as SavedState["objects"][0]]],
      };
      const ser = StateManager.serializeState(state);
      expect(ser.future).toHaveLength(1);
    });

    it("handles undefined past and future", () => {
      const state: SavedState = { objects: [] };
      const ser = StateManager.serializeState(state);
      expect(ser.past).toBeUndefined();
      expect(ser.future).toBeUndefined();
    });
  });

  describe("other fields", () => {
    it("preserves zoom", () => {
      const state: SavedState = { objects: [], zoom: 2.5 };
      const ser = StateManager.serializeState(state);
      expect(ser.zoom).toBe(2.5);
    });

    it("preserves showGrid", () => {
      const state: SavedState = { objects: [], showGrid: true };
      const ser = StateManager.serializeState(state);
      expect(ser.showGrid).toBe(true);
    });

    it("preserves unit", () => {
      const state: SavedState = { objects: [], unit: "in" };
      const ser = StateManager.serializeState(state);
      expect(ser.unit).toBe("in");
    });

    it("preserves connectors", () => {
      const connector: Connector = {
        id: "c1",
        deviceA: "d1",
        deviceB: "d2",
        type: "audio",
        connectorA: "mono jack (TS)",
        connectorB: "mono jack (TS)",
      };
      const state: SavedState = { objects: [], connectors: [connector] };
      const ser = StateManager.serializeState(state);
      expect(ser.connectors).toEqual([connector]);
    });
  });
});

describe("round-trip serialization", () => {
  it("preserves object data through serialize -> parse cycle", () => {
    const original: SavedState = {
      objects: [
        { ...bossDeviceObject, x: 123.456, y: 789.123 } as SavedState["objects"][0],
        { ...aclamBoardObject, x: 0, y: 0 } as SavedState["objects"][0],
      ],
      zoom: 1.5,
      pan: { x: 100.999, y: 200.111 },
      unit: "mm",
      showGrid: true,
    };

    const serialized = StateManager.serializeState(original);
    const json = JSON.stringify(serialized);
    const parsed = StateManager.parseState(json) as SavedState;

    expect(parsed.objects).toHaveLength(2);
    expect(parsed.objects[0].x).toBe(123.46); // rounded
    expect(parsed.objects[0].y).toBe(789.12); // rounded
    expect(parsed.objects[0].image).toBe("images/devices/boss/boss-ds1.png"); // restored from template
    expect(parsed.objects[1].image).toBe("images/boards/aclam/aclam-smart-track-xs1.png"); // restored from template
    expect(parsed.zoom).toBe(1.5);
    expect(parsed.pan).toEqual({ x: 101, y: 200.11 }); // rounded
    expect(parsed.unit).toBe("mm");
    expect(parsed.showGrid).toBe(true);
  });

  it("preserves custom object names through round-trip", () => {
    const original: SavedState = {
      objects: [customBoardObject as SavedState["objects"][0]],
    };

    const serialized = StateManager.serializeState(original);
    const json = JSON.stringify(serialized);
    const parsed = StateManager.parseState(json) as SavedState;

    expect(parsed.objects[0].name).toBe("My Custom Board");
    expect(parsed.objects[0].image).toBe(null); // custom objects have no template image
  });

  it("derives name for non-custom objects after round-trip", () => {
    const original: SavedState = {
      objects: [{ ...bossDeviceObject, name: "Boss DS-1" } as SavedState["objects"][0]],
    };

    const serialized = StateManager.serializeState(original);
    const json = JSON.stringify(serialized);
    const parsed = StateManager.parseState(json) as SavedState;

    // Name was stripped during serialization, then derived from brand+model
    expect(parsed.objects[0].name).toBe("Boss DS-1");
  });
});
