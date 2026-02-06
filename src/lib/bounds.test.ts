import { describe, expect, it } from "vitest";
import {
  getBounds2DCenter,
  getBounds2DOfPoints,
  getBounds2DOfPointSets,
  getBounds2DOfRects,
  getBounds2DSize,
} from "./bounds";

describe("bounds helpers", () => {
  it("returns null for empty point lists", () => {
    expect(getBounds2DOfPoints([])).toBeNull();
    expect(getBounds2DOfPointSets([])).toBeNull();
    expect(getBounds2DOfRects([])).toBeNull();
  });

  it("builds bounds from points", () => {
    const bounds = getBounds2DOfPoints([
      { x: 10, y: 3 },
      { x: -4, y: 9 },
      { x: 6, y: -2 },
    ]);
    expect(bounds).toEqual({ minX: -4, minY: -2, maxX: 10, maxY: 9 });
  });

  it("builds bounds from nested point sets", () => {
    const bounds = getBounds2DOfPointSets([
      [
        { x: 2, y: 2 },
        { x: 8, y: 1 },
      ],
      [{ x: -1, y: 6 }],
    ]);
    expect(bounds).toEqual({ minX: -1, minY: 1, maxX: 8, maxY: 6 });
  });

  it("builds bounds from rects and returns center/size", () => {
    const bounds = getBounds2DOfRects([
      { minX: 0, minY: 0, maxX: 5, maxY: 2 },
      { minX: -3, minY: -1, maxX: 4, maxY: 10 },
    ]);
    expect(bounds).toEqual({ minX: -3, minY: -1, maxX: 5, maxY: 10 });
    expect(getBounds2DCenter(bounds!)).toEqual({ x: 1, y: 4.5 });
    expect(getBounds2DSize(bounds!)).toEqual({ width: 8, height: 11 });
  });

  it("returns null when a coordinate is not finite", () => {
    expect(getBounds2DOfPoints([{ x: Number.NaN, y: 1 }])).toBeNull();
    expect(getBounds2DOfRects([{ minX: 0, minY: 0, maxX: Number.POSITIVE_INFINITY, maxY: 2 }])).toBeNull();
  });
});
