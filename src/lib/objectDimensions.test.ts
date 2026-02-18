import { describe, expect, it } from "vitest";
import type { CanvasObjectType } from "../types";
import {
  getObjectDimensions,
  getTemplateImage,
  getTemplateShape,
  getTemplateWdh,
  hasKnownTemplateDimensions,
} from "./objectDimensions";

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

describe("objectDimensions", () => {
  it("returns mapped image paths for known templates", () => {
    expect(getTemplateImage("device-boss-ds-1")).toBe("images/devices/boss/boss-ds1.png");
    expect(getTemplateImage("board-aclam-xs2")).toBe("images/boards/aclam/aclam-smart-track-xs2.png");
  });

  it("returns null for unknown or missing template images", () => {
    expect(getTemplateImage("device-unknown-test")).toBe(null);
    expect(getTemplateImage(undefined)).toBe(null);
  });

  it("returns dimensions and known-template checks for mapped templates", () => {
    const wdh = getTemplateWdh("device-boss-ds-1");
    expect(wdh).toEqual([73, 129, 59]);
    expect(hasKnownTemplateDimensions("device-boss-ds-1")).toBe(true);
    expect(hasKnownTemplateDimensions("device-unknown-test")).toBe(false);
    expect(hasKnownTemplateDimensions(undefined)).toBe(false);
  });

  it("returns shapes only for templates that define them", () => {
    expect(getTemplateShape("device-boss-ds-1")).toEqual({ type: "pedal-boss-type", ratio: 0.45 });
    expect(getTemplateShape("board-aclam-xs2")).toBeUndefined();
    expect(getTemplateShape(undefined)).toBeUndefined();
  });

  it("uses template dimensions as source of truth for known templates", () => {
    const obj = makeObject({
      templateId: "device-boss-ds-1",
      width: 999,
      depth: 888,
      height: 777,
    });

    expect(getObjectDimensions(obj)).toEqual([73, 129, 59]);
  });

  it("falls back to object dimensions for unknown/custom templates", () => {
    expect(
      getObjectDimensions(makeObject({ templateId: "device-unknown-test", width: 101, depth: 202, height: 303 }))
    ).toEqual([101, 202, 303]);
    expect(
      getObjectDimensions(makeObject({ templateId: "device-custom", width: 11, depth: 22, height: 33 }))
    ).toEqual([11, 22, 33]);
  });
});
