import { describe, it, expect } from "vitest";
import { visibleViewportPlacement } from "./placementStrategy";

describe("visibleViewportPlacement", () => {
  it("returns center of canvas when pan is zero and zoom is 1", () => {
    const ctx = {
      canvasRect: new DOMRect(0, 0, 800, 600),
      pan: { x: 0, y: 0 },
      zoom: 1,
    };
    const result = visibleViewportPlacement(ctx);
    expect(result).toEqual({ x: 400, y: 300 });
  });

  it("accounts for pan offset", () => {
    const ctx = {
      canvasRect: new DOMRect(0, 0, 800, 600),
      pan: { x: 100, y: 50 },
      zoom: 1,
    };
    const result = visibleViewportPlacement(ctx);
    expect(result).toEqual({ x: 300, y: 250 });
  });

  it("accounts for zoom", () => {
    const ctx = {
      canvasRect: new DOMRect(0, 0, 800, 600),
      pan: { x: 0, y: 0 },
      zoom: 2,
    };
    const result = visibleViewportPlacement(ctx);
    expect(result).toEqual({ x: 200, y: 150 });
  });

  it("rounds coordinates to integers", () => {
    const ctx = {
      canvasRect: new DOMRect(10, 20, 100, 100),
      pan: { x: 5, y: 7 },
      zoom: 1.5,
    };
    const result = visibleViewportPlacement(ctx);
    expect(Number.isInteger(result.x)).toBe(true);
    expect(Number.isInteger(result.y)).toBe(true);
  });
});
