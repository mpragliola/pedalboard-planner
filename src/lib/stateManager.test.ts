import { describe, it, expect } from "vitest";
import { StateManager } from "./stateManager";
import type { SavedState } from "./stateManager";

const validObject = {
  id: "board-aclam-1",
  subtype: "board",
  type: "classic",
  brand: "Aclam",
  model: "S1",
  x: 0,
  y: 0,
  width: 100,
  depth: 200,
  height: 25,
  name: "Aclam S1",
  image: null,
};

describe("StateManager.parseState", () => {
  it("returns null for invalid JSON", () => {
    expect(StateManager.parseState("not json")).toBe(null);
  });

  it("returns null when objects is missing", () => {
    expect(StateManager.parseState("{}")).toBe(null);
    expect(StateManager.parseState('{"zoom":1}')).toBe(null);
  });

  it("returns null when objects is not an array or has invalid items", () => {
    expect(StateManager.parseState('{"objects":null}')).toBe(null);
    expect(StateManager.parseState('{"objects":[{"id":"x"}]}')).toBe(null);
  });

  it("parses valid state and normalizes objects", () => {
    const raw = JSON.stringify({
      objects: [
        {
          ...validObject,
          image: "ignored",
        },
      ],
    });
    const out = StateManager.parseState(raw);
    expect(out).not.toBe(null);
    expect((out as SavedState).objects).toHaveLength(1);
    expect((out as SavedState).objects[0].image).toBe(null);
    expect((out as SavedState).objects[0].name).toBe("Aclam S1");
  });

  it("parses zoom, pan, unit when valid", () => {
    const raw = JSON.stringify({
      objects: [validObject],
      zoom: 1.5,
      pan: { x: 10, y: 20 },
      unit: "in",
    });
    const out = StateManager.parseState(raw) as SavedState;
    expect(out.zoom).toBe(1.5);
    expect(out.pan).toEqual({ x: 10, y: 20 });
    expect(out.unit).toBe("in");
  });
});

describe("StateManager.serializeState", () => {
  it("rounds coordinates and strips image", () => {
    const state: SavedState = {
      objects: [
        {
          ...validObject,
          x: 1.234,
          y: 5.678,
          image: "some/url.png",
        } as SavedState["objects"][0],
      ],
    };
    const ser = StateManager.serializeState(state);
    expect(Array.isArray(ser.objects)).toBe(true);
    const obj = (ser.objects as Record<string, unknown>[])[0];
    expect(obj.x).toBe(1.23);
    expect(obj.y).toBe(5.68);
    expect(obj.image).toBeUndefined();
  });
});
