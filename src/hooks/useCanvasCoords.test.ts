import { describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import { useRef } from "react";
import { useCanvasCoords } from "./useCanvasCoords";

function makeDivRef(rect: DOMRect): React.RefObject<HTMLDivElement | null> {
  const div = document.createElement("div");
  div.getBoundingClientRect = () => rect;
  const ref = { current: div };
  return ref as React.RefObject<HTMLDivElement | null>;
}

function makeRect(left: number, top: number): DOMRect {
  return {
    left,
    top,
    right: left + 500,
    bottom: top + 400,
    width: 500,
    height: 400,
    x: left,
    y: top,
    toJSON: () => "",
  };
}

describe("useCanvasCoords", () => {
  it("converts client coordinates to canvas coordinates at zoom=1, pan=(0,0)", () => {
    const ref = makeDivRef(makeRect(100, 50));
    const { result } = renderHook(() => useCanvasCoords(ref, 1, { x: 0, y: 0 }));

    const canvas = result.current.clientToCanvas(200, 150);
    // (200 - 100 - 0) / 1 = 100, (150 - 50 - 0) / 1 = 100
    expect(canvas).toEqual({ x: 100, y: 100 });
  });

  it("accounts for zoom when converting client → canvas", () => {
    const ref = makeDivRef(makeRect(0, 0));
    const { result } = renderHook(() => useCanvasCoords(ref, 2, { x: 0, y: 0 }));

    const canvas = result.current.clientToCanvas(100, 80);
    // (100 / 2) = 50, (80 / 2) = 40
    expect(canvas).toEqual({ x: 50, y: 40 });
  });

  it("accounts for pan when converting client → canvas", () => {
    const ref = makeDivRef(makeRect(0, 0));
    const { result } = renderHook(() => useCanvasCoords(ref, 1, { x: 50, y: -20 }));

    const canvas = result.current.clientToCanvas(150, 60);
    // (150 - 50) / 1 = 100, (60 - (-20)) / 1 = 80
    expect(canvas).toEqual({ x: 100, y: 80 });
  });

  it("accounts for both rect offset, zoom, and pan", () => {
    const ref = makeDivRef(makeRect(100, 50));
    const { result } = renderHook(() => useCanvasCoords(ref, 2, { x: 20, y: 10 }));

    // client (220, 130): (220 - 100 - 20) / 2 = 50, (130 - 50 - 10) / 2 = 35
    const canvas = result.current.clientToCanvas(220, 130);
    expect(canvas).toEqual({ x: 50, y: 35 });
  });

  it("returns (0, 0) when the canvas element ref is null", () => {
    const ref: React.RefObject<HTMLDivElement | null> = { current: null };
    const { result } = renderHook(() => useCanvasCoords(ref, 1, { x: 0, y: 0 }));
    expect(result.current.clientToCanvas(100, 100)).toEqual({ x: 0, y: 0 });
  });

  it("converts canvas coordinates to screen coordinates (toScreen)", () => {
    const ref = makeDivRef(makeRect(0, 0));
    const { result } = renderHook(() => useCanvasCoords(ref, 2, { x: 30, y: 15 }));

    // canvas (50, 40): pan.x + x * zoom = 30 + 50*2 = 130, pan.y + y * zoom = 15 + 40*2 = 95
    const screen = result.current.toScreen(50, 40);
    expect(screen).toEqual({ x: 130, y: 95 });
  });

  it("toScreen at zoom=1, pan=(0,0) returns the same coordinates", () => {
    const ref = makeDivRef(makeRect(0, 0));
    const { result } = renderHook(() => useCanvasCoords(ref, 1, { x: 0, y: 0 }));
    expect(result.current.toScreen(75, 200)).toEqual({ x: 75, y: 200 });
  });

  it("clientToCanvas and toScreen are inverse operations", () => {
    const ref = makeDivRef(makeRect(50, 25));
    const zoom = 1.5;
    const pan = { x: 30, y: -10 };
    const { result } = renderHook(() => useCanvasCoords(ref, zoom, pan));

    const clientX = 200;
    const clientY = 150;
    const canvasPoint = result.current.clientToCanvas(clientX, clientY);
    const screenPoint = result.current.toScreen(canvasPoint.x, canvasPoint.y);

    // toScreen gives canvas-viewport position (not client-viewport); they differ by rect offset
    // canvas-viewport = pan.x + x * zoom = client - rect.left
    expect(screenPoint.x).toBeCloseTo(clientX - 50);
    expect(screenPoint.y).toBeCloseTo(clientY - 25);
  });
});
