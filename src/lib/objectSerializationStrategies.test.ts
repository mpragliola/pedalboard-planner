import { describe, expect, it } from "vitest";
import type { CanvasObjectType } from "../types";
import { serializeObjectWithStrategies } from "./objectSerializationStrategies";

function makeObject(overrides: Partial<CanvasObjectType> = {}): CanvasObjectType {
  return {
    id: "o1",
    subtype: "device",
    type: "pedal",
    brand: "Boss",
    model: "DS-1",
    templateId: "device-boss-ds-1",
    name: "Boss DS-1",
    pos: { x: 10.123, y: 20.987 },
    width: 73,
    depth: 129,
    height: 58,
    image: "x.png",
    ...overrides,
  };
}

describe("objectSerializationStrategies", () => {
  it("keeps name and dimensions for custom objects", () => {
    const serialized = serializeObjectWithStrategies(
      makeObject({ templateId: "device-custom", name: "My Pedal" }),
      { round: (value) => Math.round(value * 100) / 100 }
    );
    expect(serialized.name).toBe("My Pedal");
    expect(serialized.width).toBe(73);
    expect(serialized.depth).toBe(129);
    expect(serialized.height).toBe(58);
  });

  it("strips name for template objects and keeps dimensions without resolver", () => {
    const serialized = serializeObjectWithStrategies(makeObject(), {
      round: (value) => Math.round(value * 100) / 100,
    });
    expect(serialized).not.toHaveProperty("name");
    expect(serialized.width).toBe(73);
    expect(serialized.depth).toBe(129);
    expect(serialized.height).toBe(58);
  });

  it("omits dimensions for known-template objects when resolver says known", () => {
    const serialized = serializeObjectWithStrategies(makeObject(), {
      round: (value) => Math.round(value * 100) / 100,
      templateResolver: {
        hasKnownTemplateDimensions: () => true,
      },
    });
    expect(serialized).not.toHaveProperty("width");
    expect(serialized).not.toHaveProperty("depth");
    expect(serialized).not.toHaveProperty("height");
  });
});

