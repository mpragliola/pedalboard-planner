import { describe, expect, it } from "vitest";
import { nearestSegmentIndexForPoint } from "./cableGeometry";

describe("nearestSegmentIndexForPoint", () => {
  it("returns null for an empty array", () => {
    expect(nearestSegmentIndexForPoint([], { x: 0, y: 0 })).toBeNull();
  });

  it("returns null for a single point", () => {
    expect(nearestSegmentIndexForPoint([{ x: 0, y: 0 }], { x: 5, y: 5 })).toBeNull();
  });

  it("returns 0 for a two-point segment regardless of target position", () => {
    const pts = [{ x: 0, y: 0 }, { x: 100, y: 0 }];
    expect(nearestSegmentIndexForPoint(pts, { x: 50, y: 0 })).toBe(0);
    expect(nearestSegmentIndexForPoint(pts, { x: -100, y: 0 })).toBe(0);
    expect(nearestSegmentIndexForPoint(pts, { x: 200, y: 0 })).toBe(0);
  });

  it("returns the closest segment index among multiple segments", () => {
    const pts = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 200, y: 0 },
      { x: 300, y: 0 },
    ];
    expect(nearestSegmentIndexForPoint(pts, { x: 30, y: 5 })).toBe(0);
    expect(nearestSegmentIndexForPoint(pts, { x: 150, y: 5 })).toBe(1);
    expect(nearestSegmentIndexForPoint(pts, { x: 270, y: 5 })).toBe(2);
  });

  it("handles a point exactly at the start of the polyline", () => {
    const pts = [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 200, y: 0 }];
    expect(nearestSegmentIndexForPoint(pts, { x: 0, y: 0 })).toBe(0);
  });

  it("handles a point exactly at the end of the polyline", () => {
    const pts = [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 200, y: 0 }];
    expect(nearestSegmentIndexForPoint(pts, { x: 200, y: 0 })).toBe(1);
  });

  it("handles a degenerate zero-length segment (start == end)", () => {
    const pts = [{ x: 50, y: 50 }, { x: 50, y: 50 }];
    expect(nearestSegmentIndexForPoint(pts, { x: 50, y: 50 })).toBe(0);
  });

  it("handles vertical segments", () => {
    const pts = [{ x: 0, y: 0 }, { x: 0, y: 100 }];
    expect(nearestSegmentIndexForPoint(pts, { x: 5, y: 50 })).toBe(0);
  });

  it("handles diagonal segments", () => {
    const pts = [{ x: 0, y: 0 }, { x: 100, y: 100 }, { x: 200, y: 0 }];
    // Far from second segment midpoint (150, 50)
    expect(nearestSegmentIndexForPoint(pts, { x: 160, y: 40 })).toBe(1);
  });

  it("returns the segment whose projection is closest (uses perpendicular distance)", () => {
    // Two horizontal segments side by side. A point above the second gets index 1.
    const pts = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 100 },
    ];
    // Point at (100, 50) → equidistant from both segment endpoints;
    // should belong to segment 1 (vertical segment from 100,0 to 100,100)
    const result = nearestSegmentIndexForPoint(pts, { x: 100, y: 50 });
    expect(result).toBe(1);
  });
});
