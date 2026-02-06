import { describe, expect, it } from "vitest";
import { getBoundingBoxOfPoints, getBoundingBoxOfSegments, normalizeRotation } from "./geometry";

describe("geometry helpers", () => {
  it("normalizes rotations to 0-359", () => {
    expect(normalizeRotation(0)).toBe(0);
    expect(normalizeRotation(360)).toBe(0);
    expect(normalizeRotation(450)).toBe(90);
    expect(normalizeRotation(-90)).toBe(270);
  });

  it("builds bounding box from points", () => {
    expect(
      getBoundingBoxOfPoints([
        { x: 4, y: -1 },
        { x: -2, y: 3 },
      ])
    ).toEqual({ minX: -2, minY: -1, maxX: 4, maxY: 3 });
  });

  it("builds bounding box from segment endpoints", () => {
    expect(
      getBoundingBoxOfSegments([
        { x1: 0, y1: 1, x2: 5, y2: -2 },
        { x1: -3, y1: 4, x2: 1, y2: 2 },
      ])
    ).toEqual({ minX: -3, minY: -2, maxX: 5, maxY: 4 });
  });

  it("returns null for empty and invalid coordinates", () => {
    expect(getBoundingBoxOfPoints([])).toBeNull();
    expect(getBoundingBoxOfSegments([])).toBeNull();
    expect(getBoundingBoxOfPoints([{ x: Number.NaN, y: 1 }])).toBeNull();
    expect(getBoundingBoxOfSegments([{ x1: 0, y1: 0, x2: Number.POSITIVE_INFINITY, y2: 1 }])).toBeNull();
  });
});
