import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useCableLayerKeyboard } from "./useCableLayerKeyboard";

function dispatchKey(key: string): KeyboardEvent {
  const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true });
  act(() => {
    window.dispatchEvent(event);
  });
  return event;
}

describe("useCableLayerKeyboard", () => {
  it("ignores keyboard shortcuts while modal is open", () => {
    const clearDrawing = vi.fn();
    const exitMode = vi.fn();
    const openAddCableModal = vi.fn();

    renderHook(() =>
      useCableLayerKeyboard({
        isModalOpen: true,
        hasDrawing: true,
        clearDrawing,
        exitMode,
        openAddCableModal,
      })
    );

    dispatchKey("Escape");
    dispatchKey("Enter");

    expect(clearDrawing).not.toHaveBeenCalled();
    expect(exitMode).not.toHaveBeenCalled();
    expect(openAddCableModal).not.toHaveBeenCalled();
  });

  it("clears drawing on Escape when a path exists", () => {
    const clearDrawing = vi.fn();
    const exitMode = vi.fn();
    const openAddCableModal = vi.fn();

    renderHook(() =>
      useCableLayerKeyboard({
        isModalOpen: false,
        hasDrawing: true,
        clearDrawing,
        exitMode,
        openAddCableModal,
      })
    );

    const event = dispatchKey("Escape");
    expect(event.defaultPrevented).toBe(true);
    expect(clearDrawing).toHaveBeenCalledOnce();
    expect(exitMode).not.toHaveBeenCalled();
  });

  it("exits mode on Escape when no path exists", () => {
    const clearDrawing = vi.fn();
    const exitMode = vi.fn();
    const openAddCableModal = vi.fn();

    renderHook(() =>
      useCableLayerKeyboard({
        isModalOpen: false,
        hasDrawing: false,
        clearDrawing,
        exitMode,
        openAddCableModal,
      })
    );

    const event = dispatchKey("Escape");
    expect(event.defaultPrevented).toBe(false);
    expect(exitMode).toHaveBeenCalledOnce();
    expect(clearDrawing).not.toHaveBeenCalled();
  });

  it("opens add-cable modal on Enter when a path exists", () => {
    const clearDrawing = vi.fn();
    const exitMode = vi.fn();
    const openAddCableModal = vi.fn();

    renderHook(() =>
      useCableLayerKeyboard({
        isModalOpen: false,
        hasDrawing: true,
        clearDrawing,
        exitMode,
        openAddCableModal,
      })
    );

    const event = dispatchKey("Enter");
    expect(event.defaultPrevented).toBe(true);
    expect(openAddCableModal).toHaveBeenCalledOnce();
  });

  it("uses latest hasDrawing value across rerenders", () => {
    const clearDrawing = vi.fn();
    const exitMode = vi.fn();
    const openAddCableModal = vi.fn();

    const { rerender } = renderHook(
      ({ hasDrawing }: { hasDrawing: boolean }) =>
        useCableLayerKeyboard({
          isModalOpen: false,
          hasDrawing,
          clearDrawing,
          exitMode,
          openAddCableModal,
        }),
      { initialProps: { hasDrawing: false } }
    );

    dispatchKey("Enter");
    expect(openAddCableModal).not.toHaveBeenCalled();

    rerender({ hasDrawing: true });
    dispatchKey("Enter");
    expect(openAddCableModal).toHaveBeenCalledOnce();
  });
});

