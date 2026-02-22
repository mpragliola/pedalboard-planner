import { act, renderHook } from "@testing-library/react";
import type { PointerEvent as ReactPointerEvent, ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { SelectionProvider, useSelection } from "../context/SelectionContext";
import { useCanvasInteractions } from "./useCanvasInteractions";

function wrapper({ children }: { children: ReactNode }) {
  // useCanvasInteractions depends on SelectionContext for selection side effects.
  return <SelectionProvider>{children}</SelectionProvider>;
}

function pointerEvent(overrides: Partial<ReactPointerEvent> = {}) {
  // Minimal pointer-like shape needed by the hook handlers.
  return {
    button: 0,
    target: document.createElement("div"),
    stopPropagation: vi.fn(),
    ...overrides,
  } as unknown as ReactPointerEvent;
}

describe("useCanvasInteractions", () => {
  it("starts object drag immediately and updates selection", () => {
    const objectDragStart = vi.fn();
    const cableDragStart = vi.fn();
    const canvasPanPointerDown = vi.fn();
    const { result } = renderHook(
      () => ({
        interactions: useCanvasInteractions({ objectDragStart, cableDragStart, canvasPanPointerDown }),
        selection: useSelection().selection,
      }),
      { wrapper }
    );

    const event = pointerEvent();
    act(() => result.current.interactions.handleObjectPointerDown("obj-1", event));

    // No late binding: injected handler is called synchronously on first event.
    expect(objectDragStart).toHaveBeenCalledWith("obj-1", event);
    expect(result.current.selection).toEqual({ kind: "object", id: "obj-1" });
  });

  it("starts cable drag immediately, stops propagation, and updates selection", () => {
    const objectDragStart = vi.fn();
    const cableDragStart = vi.fn();
    const canvasPanPointerDown = vi.fn();
    const { result } = renderHook(
      () => ({
        interactions: useCanvasInteractions({ objectDragStart, cableDragStart, canvasPanPointerDown }),
        selection: useSelection().selection,
      }),
      { wrapper }
    );

    const stopPropagation = vi.fn();
    const event = pointerEvent({ stopPropagation });
    act(() => result.current.interactions.handleCablePointerDown("c-1", event));

    // Cable selection/drag flow must stop propagation to avoid canvas deselection side-effects.
    expect(stopPropagation).toHaveBeenCalledTimes(1);
    expect(cableDragStart).toHaveBeenCalledWith("c-1", event);
    expect(result.current.selection).toEqual({ kind: "cable", id: "c-1" });
  });

  it("clears selection on empty-canvas click and always forwards to pan handler", () => {
    const objectDragStart = vi.fn();
    const cableDragStart = vi.fn();
    const canvasPanPointerDown = vi.fn();
    const { result } = renderHook(
      () => ({
        interactions: useCanvasInteractions({ objectDragStart, cableDragStart, canvasPanPointerDown }),
        selection: useSelection().selection,
      }),
      { wrapper }
    );

    act(() => result.current.interactions.handleObjectPointerDown("obj-1", pointerEvent()));
    expect(result.current.selection).toEqual({ kind: "object", id: "obj-1" });

    const closest = vi.fn().mockReturnValue(null);
    const target = { closest } as unknown as Element;
    const event = pointerEvent({ target });
    act(() => result.current.interactions.handleCanvasPointerDown(event, false));

    // Empty target path clears selection and still delegates to pan handler.
    expect(closest).toHaveBeenCalledWith(expect.stringContaining(".canvas-object-wrapper"));
    expect(canvasPanPointerDown).toHaveBeenCalledWith(event);
    expect(result.current.selection).toBeNull();
  });

  it("keeps selection when clicking selectable targets or while space-pan is active", () => {
    const objectDragStart = vi.fn();
    const cableDragStart = vi.fn();
    const canvasPanPointerDown = vi.fn();
    const { result } = renderHook(
      () => ({
        interactions: useCanvasInteractions({ objectDragStart, cableDragStart, canvasPanPointerDown }),
        selection: useSelection().selection,
      }),
      { wrapper }
    );

    act(() => result.current.interactions.handleObjectPointerDown("obj-1", pointerEvent()));
    expect(result.current.selection).toEqual({ kind: "object", id: "obj-1" });

    const selectableTarget = { closest: vi.fn().mockReturnValue(document.createElement("div")) } as unknown as Element;
    act(() => result.current.interactions.handleCanvasPointerDown(pointerEvent({ target: selectableTarget }), false));
    // Clicking selectable regions should keep current selection.
    expect(result.current.selection).toEqual({ kind: "object", id: "obj-1" });

    const emptyTarget = { closest: vi.fn().mockReturnValue(null) } as unknown as Element;
    act(() => result.current.interactions.handleCanvasPointerDown(pointerEvent({ target: emptyTarget }), true));
    // Space-pan mode suppresses empty-canvas selection clearing.
    expect(result.current.selection).toEqual({ kind: "object", id: "obj-1" });
  });
});
