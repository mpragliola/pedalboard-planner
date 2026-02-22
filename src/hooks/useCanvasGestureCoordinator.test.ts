import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useCanvasGestureCoordinator } from "./useCanvasGestureCoordinator";

describe("useCanvasGestureCoordinator", () => {
  it("emits mode lifecycle events for all gesture mode transitions", () => {
    const { result } = renderHook(() => useCanvasGestureCoordinator());

    const modeChanges: Array<[string, string]> = [];
    const starts: string[] = [];
    const ends: string[] = [];

    act(() => {
      result.current.subscribeType("mode-change", (event) => modeChanges.push([event.from, event.to]));
      result.current.subscribeType("gesture-start", (event) => starts.push(event.mode));
      result.current.subscribeType("gesture-end", (event) => ends.push(event.mode));
    });

    act(() => {
      expect(result.current.requestMode("pointer-pan")).toBe(true);
      result.current.forceMode("cable-draw");
      result.current.releaseMode("cable-draw");
    });

    expect(modeChanges).toEqual([
      ["idle", "pointer-pan"],
      ["pointer-pan", "cable-draw"],
      ["cable-draw", "idle"],
    ]);
    expect(starts).toEqual(["pointer-pan", "cable-draw"]);
    expect(ends).toEqual(["pointer-pan", "cable-draw"]);
    expect(result.current.getMode()).toBe("idle");
  });

  it("supports pinch-specific event subscriptions", () => {
    const { result } = renderHook(() => useCanvasGestureCoordinator());
    const onPinchStart = vi.fn();
    const onPinchEnd = vi.fn();

    act(() => {
      result.current.subscribeType("pinch-start", onPinchStart);
      result.current.subscribeType("pinch-end", onPinchEnd);
      result.current.publish({ type: "pinch-start" });
      result.current.publish({ type: "pinch-end" });
    });

    expect(onPinchStart).toHaveBeenCalledTimes(1);
    expect(onPinchEnd).toHaveBeenCalledTimes(1);
  });
});

