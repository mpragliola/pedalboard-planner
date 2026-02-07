import { describe, expect, it } from "vitest";
import {
  closestPointOnRectPerimeter,
  getObjectAabb,
  SNAP_TOLERANCE_MM,
  snapToObjects,
} from "./snapToBoundingBox";
import type { CanvasObjectType } from "../types";

function createObject(overrides: Partial<CanvasObjectType> = {}): CanvasObjectType {
  return {
    id: "1",
    subtype: "device",
    type: "effect",
    brand: "Brand",
    model: "Model",
    x: 0,
    y: 0,
    width: 40,
    depth: 20,
    height: 10,
    rotation: 0,
    image: null,
    name: "Obj",
    ...overrides,
  };
}

function getObjectDimensions(obj: CanvasObjectType): [number, number, number] {
  return [obj.width, obj.depth, obj.height];
}

describe("snapToBoundingBox helpers", () => {
  it("computes object AABB for unrotated and rotated objects", () => {
    const base = createObject({ x: 100, y: 200, width: 60, depth: 20, rotation: 0 });
    expect(getObjectAabb(base, getObjectDimensions)).toEqual({
      left: 100,
      top: 200,
      width: 60,
      height: 20,
    });

    const rotated = createObject({ x: 100, y: 200, width: 60, depth: 20, rotation: -90 });
    expect(getObjectAabb(rotated, getObjectDimensions)).toEqual({
      left: 120,
      top: 180,
      width: 20,
      height: 60,
    });
  });

  it("finds closest perimeter point for outside points", () => {
    expect(closestPointOnRectPerimeter(5, 5, 10, 10, 20, 30)).toEqual({ x: 10, y: 10 });
    expect(closestPointOnRectPerimeter(35, 25, 10, 10, 20, 30)).toEqual({ x: 30, y: 25 });
  });

  it("finds nearest interior perimeter edge with tie-break behavior", () => {
    expect(closestPointOnRectPerimeter(11, 20, 10, 10, 20, 30)).toEqual({ x: 10, y: 20 });
    expect(closestPointOnRectPerimeter(20, 25, 10, 10, 20, 30)).toEqual({ x: 30, y: 25 });
    expect(closestPointOnRectPerimeter(20, 38, 10, 10, 20, 30)).toEqual({ x: 20, y: 40 });
  });

  it("returns original point when there are no objects or no nearby edge", () => {
    expect(snapToObjects(10, 20, [], getObjectDimensions)).toEqual({ x: 10, y: 20 });
    const objects = [createObject()];
    expect(snapToObjects(100, 100, objects, getObjectDimensions, 5)).toEqual({ x: 100, y: 100 });
  });

  it("snaps to nearest perimeter point within tolerance", () => {
    const objects = [createObject({ x: 0, y: 0, width: 40, depth: 20 })];
    expect(snapToObjects(45, 10, objects, getObjectDimensions, 10)).toEqual({ x: 40, y: 10 });
    expect(snapToObjects(50, 10, objects, getObjectDimensions, SNAP_TOLERANCE_MM)).toEqual({ x: 40, y: 10 });
  });

  it("selects the closest candidate across multiple objects", () => {
    const objects = [
      createObject({ id: "1", x: 0, y: 0, width: 40, depth: 20 }),
      createObject({ id: "2", x: 80, y: 0, width: 20, depth: 20 }),
    ];
    expect(snapToObjects(70, 10, objects, getObjectDimensions, 20)).toEqual({ x: 80, y: 10 });
  });

  it("accounts for rotation when snapping to object AABB", () => {
    const rotated = createObject({ x: 100, y: 200, width: 60, depth: 20, rotation: 90 });
    expect(snapToObjects(125, 175, [rotated], getObjectDimensions, 6)).toEqual({ x: 125, y: 180 });
  });
});
