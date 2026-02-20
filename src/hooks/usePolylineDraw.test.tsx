import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePolylineDraw, type UsePolylineDrawOptions } from "./usePolylineDraw";
import type { Point } from "../lib/vector";

// Minimal clientToCanvas that returns client coords unchanged (identity transform)
const identity = (x: number, y: number): Point => ({ x, y });

function defaultOpts(overrides: Partial<UsePolylineDrawOptions> = {}): UsePolylineDrawOptions {
  return { clientToCanvas: identity, ...overrides };
}

function makePointerEvent(overrides: Partial<PointerEvent & { clientX: number; clientY: number; button: number; detail: number; shiftKey: boolean; ctrlKey: boolean }> = {}) {
  return {
    button: 0,
    clientX: 0,
    clientY: 0,
    detail: 1,
    shiftKey: false,
    ctrlKey: false,
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    nativeEvent: { detail: overrides.detail ?? 1 },
    ...overrides,
  } as unknown as React.PointerEvent;
}

describe("usePolylineDraw", () => {
  describe("initial state", () => {
    it("starts with empty points, no segmentStart, no currentEnd", () => {
      const { result } = renderHook(() => usePolylineDraw(defaultOpts()));
      expect(result.current.points).toHaveLength(0);
      expect(result.current.segmentStart).toBeNull();
      expect(result.current.currentEnd).toBeNull();
    });

    it("starts with hasSegments=false and hasPreview=false", () => {
      const { result } = renderHook(() => usePolylineDraw(defaultOpts()));
      expect(result.current.hasSegments).toBe(false);
      expect(result.current.hasPreview).toBe(false);
    });

    it("starts with all lengths at 0", () => {
      const { result } = renderHook(() => usePolylineDraw(defaultOpts()));
      expect(result.current.committedLength).toBe(0);
      expect(result.current.currentLength).toBe(0);
      expect(result.current.totalLength).toBe(0);
    });
  });

  describe("onPointerDown — first click", () => {
    it("ignores right-click (button !== 0)", () => {
      const { result } = renderHook(() => usePolylineDraw(defaultOpts()));
      act(() => { result.current.onPointerDown(makePointerEvent({ button: 2 })); });
      expect(result.current.segmentStart).toBeNull();
    });

    it("sets segmentStart and currentEnd on first left-click", () => {
      const { result } = renderHook(() => usePolylineDraw(defaultOpts()));
      act(() => {
        result.current.onPointerDown(makePointerEvent({ clientX: 10, clientY: 20 }));
      });
      expect(result.current.segmentStart).toEqual({ x: 10, y: 20 });
      expect(result.current.currentEnd).toEqual({ x: 10, y: 20 });
      expect(result.current.hasPreview).toBe(true);
    });

    it("does not change segmentStart on subsequent clicks while drawing", () => {
      const { result } = renderHook(() => usePolylineDraw(defaultOpts()));
      act(() => { result.current.onPointerDown(makePointerEvent({ clientX: 10, clientY: 20 })); });
      act(() => { result.current.onPointerDown(makePointerEvent({ clientX: 50, clientY: 50 })); });
      // segmentStart stays at first click
      expect(result.current.segmentStart).toEqual({ x: 10, y: 20 });
    });
  });

  describe("onPointerMove — preview segment", () => {
    it("updates currentEnd as mouse moves", () => {
      const { result } = renderHook(() => usePolylineDraw(defaultOpts()));
      act(() => { result.current.onPointerDown(makePointerEvent({ clientX: 0, clientY: 0 })); });
      act(() => { result.current.onPointerMove(makePointerEvent({ clientX: 80, clientY: 60 })); });
      expect(result.current.currentEnd).toEqual({ x: 80, y: 60 });
    });

    it("does nothing when no segmentStart exists", () => {
      const { result } = renderHook(() => usePolylineDraw(defaultOpts()));
      act(() => { result.current.onPointerMove(makePointerEvent({ clientX: 80, clientY: 60 })); });
      expect(result.current.currentEnd).toBeNull();
    });

    it("applies resolvePoint transformation", () => {
      const resolvePoint = vi.fn((raw: Point) => ({ x: raw.x + 5, y: raw.y + 5 }));
      const { result } = renderHook(() => usePolylineDraw(defaultOpts({ resolvePoint })));
      act(() => { result.current.onPointerDown(makePointerEvent({ clientX: 0, clientY: 0 })); });
      act(() => { result.current.onPointerMove(makePointerEvent({ clientX: 10, clientY: 10 })); });
      expect(result.current.currentEnd).toEqual({ x: 15, y: 15 });
    });
  });

  describe("onPointerUp — committing segments", () => {
    it("commits a segment when release point is far enough from segmentStart", () => {
      const { result } = renderHook(() => usePolylineDraw(defaultOpts()));
      act(() => { result.current.onPointerDown(makePointerEvent({ clientX: 0, clientY: 0 })); });
      act(() => { result.current.onPointerUp(makePointerEvent({ clientX: 100, clientY: 0 })); });
      expect(result.current.points).toHaveLength(2);
      expect(result.current.points[0]).toEqual({ x: 0, y: 0 });
      expect(result.current.points[1]).toEqual({ x: 100, y: 0 });
    });

    it("does NOT commit a segment when release distance is below MIN_SEGMENT_LENGTH (0.5)", () => {
      const { result } = renderHook(() => usePolylineDraw(defaultOpts()));
      act(() => { result.current.onPointerDown(makePointerEvent({ clientX: 0, clientY: 0 })); });
      act(() => { result.current.onPointerUp(makePointerEvent({ clientX: 0.1, clientY: 0 })); });
      expect(result.current.points).toHaveLength(0);
    });

    it("advances segmentStart to the release point after a committed segment", () => {
      const { result } = renderHook(() => usePolylineDraw(defaultOpts()));
      act(() => { result.current.onPointerDown(makePointerEvent({ clientX: 0, clientY: 0 })); });
      act(() => { result.current.onPointerUp(makePointerEvent({ clientX: 100, clientY: 0 })); });
      expect(result.current.segmentStart).toEqual({ x: 100, y: 0 });
    });

    it("builds up multiple segments across several pointer-up events", () => {
      const { result } = renderHook(() => usePolylineDraw(defaultOpts()));
      act(() => { result.current.onPointerDown(makePointerEvent({ clientX: 0, clientY: 0 })); });
      act(() => { result.current.onPointerUp(makePointerEvent({ clientX: 100, clientY: 0 })); });
      act(() => { result.current.onPointerUp(makePointerEvent({ clientX: 200, clientY: 0 })); });
      expect(result.current.points).toHaveLength(3);
      expect(result.current.points[2]).toEqual({ x: 200, y: 0 });
    });

    it("hasSegments is true after the first committed segment", () => {
      const { result } = renderHook(() => usePolylineDraw(defaultOpts()));
      act(() => { result.current.onPointerDown(makePointerEvent({ clientX: 0, clientY: 0 })); });
      act(() => { result.current.onPointerUp(makePointerEvent({ clientX: 100, clientY: 0 })); });
      expect(result.current.hasSegments).toBe(true);
    });
  });

  describe("committedLength and totalLength", () => {
    it("committedLength sums all committed segment lengths", () => {
      const { result } = renderHook(() => usePolylineDraw(defaultOpts()));
      act(() => { result.current.onPointerDown(makePointerEvent({ clientX: 0, clientY: 0 })); });
      act(() => { result.current.onPointerUp(makePointerEvent({ clientX: 100, clientY: 0 })); });
      act(() => { result.current.onPointerUp(makePointerEvent({ clientX: 100, clientY: 50 })); });
      expect(result.current.committedLength).toBeCloseTo(150);
    });

    it("currentLength reflects the live preview segment length", () => {
      const { result } = renderHook(() => usePolylineDraw(defaultOpts()));
      act(() => { result.current.onPointerDown(makePointerEvent({ clientX: 0, clientY: 0 })); });
      act(() => { result.current.onPointerMove(makePointerEvent({ clientX: 60, clientY: 80 })); });
      expect(result.current.currentLength).toBeCloseTo(100);
    });

    it("totalLength = committedLength + currentLength", () => {
      const { result } = renderHook(() => usePolylineDraw(defaultOpts()));
      act(() => { result.current.onPointerDown(makePointerEvent({ clientX: 0, clientY: 0 })); });
      act(() => { result.current.onPointerUp(makePointerEvent({ clientX: 100, clientY: 0 })); });
      act(() => { result.current.onPointerMove(makePointerEvent({ clientX: 100, clientY: 50 })); });
      expect(result.current.totalLength).toBeCloseTo(result.current.committedLength + result.current.currentLength);
    });
  });

  describe("getFinalPoints", () => {
    it("returns empty array when nothing drawn", () => {
      const { result } = renderHook(() => usePolylineDraw(defaultOpts()));
      expect(result.current.getFinalPoints()).toHaveLength(0);
    });

    it("includes the current preview endpoint when segment is long enough", () => {
      const { result } = renderHook(() => usePolylineDraw(defaultOpts()));
      act(() => { result.current.onPointerDown(makePointerEvent({ clientX: 0, clientY: 0 })); });
      act(() => { result.current.onPointerUp(makePointerEvent({ clientX: 100, clientY: 0 })); });
      act(() => { result.current.onPointerMove(makePointerEvent({ clientX: 100, clientY: 50 })); });
      const pts = result.current.getFinalPoints();
      expect(pts).toHaveLength(3);
      expect(pts[2]).toEqual({ x: 100, y: 50 });
    });

    it("returns only committed points when preview segment is too short", () => {
      const { result } = renderHook(() => usePolylineDraw(defaultOpts()));
      act(() => { result.current.onPointerDown(makePointerEvent({ clientX: 0, clientY: 0 })); });
      act(() => { result.current.onPointerUp(makePointerEvent({ clientX: 100, clientY: 0 })); });
      act(() => { result.current.onPointerMove(makePointerEvent({ clientX: 100, clientY: 0.1 })); });
      const pts = result.current.getFinalPoints();
      expect(pts).toHaveLength(2);
    });
  });

  describe("clearDrawing", () => {
    it("resets all drawing state", () => {
      const { result } = renderHook(() => usePolylineDraw(defaultOpts()));
      act(() => { result.current.onPointerDown(makePointerEvent({ clientX: 0, clientY: 0 })); });
      act(() => { result.current.onPointerUp(makePointerEvent({ clientX: 100, clientY: 0 })); });
      act(() => { result.current.clearDrawing(); });
      expect(result.current.points).toHaveLength(0);
      expect(result.current.segmentStart).toBeNull();
      expect(result.current.currentEnd).toBeNull();
    });
  });

  describe("onDoubleClick — exit drawing", () => {
    it("calls onDoubleClickExit when no segments committed", () => {
      const onDoubleClickExit = vi.fn();
      const { result } = renderHook(() => usePolylineDraw(defaultOpts({ onDoubleClickExit })));
      act(() => {
        result.current.onDoubleClick({ preventDefault: vi.fn(), stopPropagation: vi.fn() } as unknown as React.MouseEvent);
      });
      expect(onDoubleClickExit).toHaveBeenCalledOnce();
    });

    it("calls onFinishClickRef.current when segments exist", () => {
      const onFinish = vi.fn();
      const onFinishClickRef = { current: onFinish };
      const { result } = renderHook(() =>
        usePolylineDraw(defaultOpts({ onFinishClickRef }))
      );
      // Draw a segment
      act(() => { result.current.onPointerDown(makePointerEvent({ clientX: 0, clientY: 0 })); });
      act(() => { result.current.onPointerUp(makePointerEvent({ clientX: 100, clientY: 0 })); });
      act(() => {
        result.current.onDoubleClick({ preventDefault: vi.fn(), stopPropagation: vi.fn() } as unknown as React.MouseEvent);
      });
      expect(onFinish).toHaveBeenCalledOnce();
    });
  });

  describe("finishClickTolerance", () => {
    it("triggers onFinishClickRef when release is within tolerance of last point", () => {
      const onFinish = vi.fn();
      const onFinishClickRef = { current: onFinish };
      const { result } = renderHook(() =>
        usePolylineDraw(defaultOpts({ onFinishClickRef, finishClickTolerance: 15 }))
      );
      // Draw a segment to (100, 0)
      act(() => { result.current.onPointerDown(makePointerEvent({ clientX: 0, clientY: 0 })); });
      act(() => { result.current.onPointerUp(makePointerEvent({ clientX: 100, clientY: 0 })); });
      // Release within 15mm of the last committed point (100, 0)
      act(() => { result.current.onPointerUp(makePointerEvent({ clientX: 102, clientY: 0 })); });
      expect(onFinish).toHaveBeenCalledOnce();
    });
  });
});
