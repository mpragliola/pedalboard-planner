import { describe, expect, it } from "vitest";
import { canvasToScreenPoint, clientToCanvasPoint } from "./canvasCoords";

describe("canvasCoords", () => {
  const rect = { left: 100, top: 50 };
  const zoom = 2;
  const pan = { x: 20, y: -10 };

  it("converts point client coordinates to canvas coordinates", () => {
    expect(clientToCanvasPoint({ x: 140, y: 90 }, rect, zoom, pan)).toEqual({ x: 10, y: 25 });
  });

  it("converts canvas coordinates to screen coordinates", () => {
    expect(canvasToScreenPoint({ x: 10, y: 25 }, zoom, pan)).toEqual({ x: 40, y: 40 });
  });
});
