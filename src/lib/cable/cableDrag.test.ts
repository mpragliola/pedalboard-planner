import { describe, expect, it } from "vitest";
import { deriveCableDragState, type CableDragState } from "./cableDrag";

const POINTS = [
  { x: 0, y: 0 },
  { x: 50, y: 0 },
  { x: 100, y: 0 },
  { x: 150, y: 0 },
];

describe("deriveCableDragState", () => {
  it("returns all-null derived state when called with null", () => {
    expect(deriveCableDragState(null)).toEqual({
      dragCableId: null,
      dragHandleIndex: null,
      dragPoints: null,
      dragSegA: null,
      dragSegB: null,
      dragSegBForPath: null,
    });
  });

  it("passes through cableId, handleIndex, and points reference", () => {
    const drag: CableDragState = { cableId: "cable-42", points: POINTS, handleIndex: 2 };
    const result = deriveCableDragState(drag);
    expect(result.dragCableId).toBe("cable-42");
    expect(result.dragHandleIndex).toBe(2);
    expect(result.dragPoints).toBe(POINTS);
  });

  it("dragSegA is null when handle is index 0 (no preceding segment)", () => {
    const drag: CableDragState = { cableId: "c", points: POINTS, handleIndex: 0 };
    expect(deriveCableDragState(drag).dragSegA).toBeNull();
  });

  it("dragSegB and dragSegBForPath are null when handle is the last point", () => {
    const drag: CableDragState = { cableId: "c", points: POINTS, handleIndex: POINTS.length - 1 };
    const result = deriveCableDragState(drag);
    expect(result.dragSegB).toBeNull();
    expect(result.dragSegBForPath).toBeNull();
  });

  it("computes both segments correctly for a middle handle (index 2)", () => {
    const drag: CableDragState = { cableId: "c", points: POINTS, handleIndex: 2 };
    const result = deriveCableDragState(drag);
    // segA: from point[1] to point[2]
    expect(result.dragSegA).toEqual({ start: POINTS[1], end: POINTS[2] });
    // segB: reversed — from point[3] to point[2]
    expect(result.dragSegB).toEqual({ start: POINTS[3], end: POINTS[2] });
    // segBForPath: forward — from point[2] to point[3]
    expect(result.dragSegBForPath).toEqual({ start: POINTS[2], end: POINTS[3] });
  });

  it("computes correct segments for handle index 1", () => {
    const drag: CableDragState = { cableId: "c", points: POINTS, handleIndex: 1 };
    const result = deriveCableDragState(drag);
    expect(result.dragSegA).toEqual({ start: POINTS[0], end: POINTS[1] });
    expect(result.dragSegB).toEqual({ start: POINTS[2], end: POINTS[1] });
    expect(result.dragSegBForPath).toEqual({ start: POINTS[1], end: POINTS[2] });
  });

  it("computes only segA when handle is the last point of a two-point cable", () => {
    const twoPoints = [{ x: 0, y: 0 }, { x: 100, y: 0 }];
    const drag: CableDragState = { cableId: "c", points: twoPoints, handleIndex: 1 };
    const result = deriveCableDragState(drag);
    expect(result.dragSegA).toEqual({ start: twoPoints[0], end: twoPoints[1] });
    expect(result.dragSegB).toBeNull();
    expect(result.dragSegBForPath).toBeNull();
  });

  it("computes only segB when handle is the first point of a two-point cable", () => {
    const twoPoints = [{ x: 0, y: 0 }, { x: 100, y: 0 }];
    const drag: CableDragState = { cableId: "c", points: twoPoints, handleIndex: 0 };
    const result = deriveCableDragState(drag);
    expect(result.dragSegA).toBeNull();
    expect(result.dragSegB).toEqual({ start: twoPoints[1], end: twoPoints[0] });
    expect(result.dragSegBForPath).toEqual({ start: twoPoints[0], end: twoPoints[1] });
  });
});
