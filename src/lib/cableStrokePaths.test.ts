import { describe, expect, it } from "vitest";
import { buildCablePathData, type BuildCablePathDataParams } from "./cableStrokePaths";

const NO_DRAG_PARAMS: BuildCablePathDataParams = {
  activePoints: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 200, y: 0 }],
  joinRadius: 10,
  isDraggedCable: false,
  dragHandleIndex: null,
  dragSegA: null,
  dragSegBForPath: null,
  physicsPointsA: [],
  physicsPointsB: [],
};

describe("buildCablePathData", () => {
  it("returns non-empty hitD and single strokeD when not dragging", () => {
    const result = buildCablePathData(NO_DRAG_PARAMS);
    expect(result.hitD.length).toBeGreaterThan(0);
    expect(result.strokeDs).toHaveLength(1);
    expect(result.strokeDs[0]).toBe(result.hitD);
  });

  it("returns empty strokeDs and empty hitD when activePoints is fewer than 2", () => {
    const result = buildCablePathData({
      ...NO_DRAG_PARAMS,
      activePoints: [{ x: 0, y: 0 }],
    });
    expect(result.hitD).toBe("");
    expect(result.strokeDs).toHaveLength(0);
  });

  it("returns empty results for empty activePoints", () => {
    const result = buildCablePathData({ ...NO_DRAG_PARAMS, activePoints: [] });
    expect(result.hitD).toBe("");
    expect(result.strokeDs).toHaveLength(0);
  });

  it("returns hitD but splits strokeDs when dragging a middle handle", () => {
    const pts = [
      { x: 0, y: 0 },
      { x: 50, y: 0 },
      { x: 100, y: 0 },
      { x: 150, y: 0 },
    ];
    const result = buildCablePathData({
      activePoints: pts,
      joinRadius: 5,
      isDraggedCable: true,
      dragHandleIndex: 2,
      dragSegA: { start: pts[1], end: pts[2] },
      dragSegBForPath: { start: pts[2], end: pts[3] },
      physicsPointsA: [],
      physicsPointsB: [],
    });

    // hitD covers all points
    expect(result.hitD.length).toBeGreaterThan(0);
    // strokeDs is split into multiple segments
    expect(result.strokeDs.length).toBeGreaterThanOrEqual(2);
  });

  it("uses physics points for segments A and B when available and dragging", () => {
    const pts = [
      { x: 0, y: 0 },
      { x: 50, y: 50 },
      { x: 100, y: 0 },
    ];
    const physicsA = [
      { x: 50, y: 50 },
      { x: 60, y: 40 },
      { x: 100, y: 0 },
    ];
    const physicsB = [
      { x: 100, y: 0 },
      { x: 130, y: 20 },
    ];

    const result = buildCablePathData({
      activePoints: pts,
      joinRadius: 5,
      isDraggedCable: true,
      dragHandleIndex: 1,
      dragSegA: { start: pts[0], end: pts[1] },
      dragSegBForPath: { start: pts[1], end: pts[2] },
      physicsPointsA: physicsA,
      physicsPointsB: physicsB,
    });

    // Both physics segments should produce "M" path data (smooth path)
    const smoothPaths = result.strokeDs.filter((d) => d.startsWith("M") && d.includes("C"));
    expect(smoothPaths.length).toBeGreaterThan(0);
  });

  it("isDraggedCable with dragHandleIndex null behaves like non-dragging", () => {
    const result = buildCablePathData({
      ...NO_DRAG_PARAMS,
      isDraggedCable: true,
      dragHandleIndex: null,
    });
    expect(result.strokeDs).toHaveLength(1);
    expect(result.strokeDs[0]).toBe(result.hitD);
  });

  it("uses straight line path when drag segment has no physics points", () => {
    const pts = [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 200, y: 0 }];
    const result = buildCablePathData({
      activePoints: pts,
      joinRadius: 5,
      isDraggedCable: true,
      dragHandleIndex: 1,
      dragSegA: { start: pts[0], end: pts[1] },
      dragSegBForPath: { start: pts[1], end: pts[2] },
      physicsPointsA: [],
      physicsPointsB: [],
    });
    // Straight line segments use "M ... L ..." format
    const linePaths = result.strokeDs.filter((d) => d.includes(" L "));
    expect(linePaths.length).toBeGreaterThan(0);
  });
});
