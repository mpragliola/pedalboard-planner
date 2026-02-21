import { describe, expect, it } from "vitest";
import type { CanvasObjectType } from "../types";
import { templateService } from "./templateService";

function makeObject(overrides: Partial<CanvasObjectType> = {}): CanvasObjectType {
  return {
    id: "obj-1",
    subtype: "device",
    type: "pedal",
    brand: "Boss",
    model: "DS-1",
    pos: { x: 0, y: 0 },
    width: 10,
    depth: 20,
    height: 30,
    image: null,
    name: "Boss DS-1",
    ...overrides,
  };
}

describe("templateService.getObjectDimensions", () => {
  it("uses template dimensions as source of truth for known templates", () => {
    const obj = makeObject({
      templateId: "device-boss-ds-1",
      width: 999,
      depth: 888,
      height: 777,
    });

    expect(templateService.getObjectDimensions(obj)).toEqual([73, 129, 59]);
  });

  it("falls back to object dimensions for unknown/custom templates", () => {
    expect(
      templateService.getObjectDimensions(
        makeObject({ templateId: "device-unknown-test", width: 101, depth: 202, height: 303 })
      )
    ).toEqual([101, 202, 303]);
    expect(
      templateService.getObjectDimensions(
        makeObject({ templateId: "device-custom", width: 11, depth: 22, height: 33 })
      )
    ).toEqual([11, 22, 33]);
  });
});
