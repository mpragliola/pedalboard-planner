import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCatalogDrag } from "./useCatalogDrag";

function createMockCanvas() {
  const rect = { left: 100, top: 50, right: 500, bottom: 400, width: 400, height: 350 };
  const canvas = {
    getBoundingClientRect: () => rect,
    querySelector: vi.fn((sel: string) => (sel === ".canvas-viewport" ? { getBoundingClientRect: () => rect } : null)),
  } as unknown as HTMLDivElement;
  return {
    ref: { current: canvas },
    zoomRef: { current: 1 },
    panRef: { current: { x: 0, y: 0 } },
  };
}

describe("useCatalogDrag", () => {
  let onDropOnCanvas: ReturnType<typeof vi.fn>;
  let mocks: ReturnType<typeof createMockCanvas>;

  beforeEach(() => {
    onDropOnCanvas = vi.fn();
    mocks = createMockCanvas();
  });

  it("exposes placeFromCatalog and shouldIgnoreCatalogClick", () => {
    const { result } = renderHook(() =>
      useCatalogDrag({
        canvasRef: mocks.ref,
        zoomRef: mocks.zoomRef,
        panRef: mocks.panRef,
        onDropOnCanvas,
      })
    );
    expect(typeof result.current.placeFromCatalog).toBe("function");
    expect(typeof result.current.shouldIgnoreCatalogClick).toBe("function");
  });

  it("calls onDropOnCanvas when placeFromCatalog is called with point inside canvas", () => {
    const { result } = renderHook(() =>
      useCatalogDrag({
        canvasRef: mocks.ref,
        zoomRef: mocks.zoomRef,
        panRef: mocks.panRef,
        onDropOnCanvas,
      })
    );

    act(() => {
      result.current.placeFromCatalog(150, 100, {
        mode: "devices",
        templateId: "device-boss-ds-1",
      });
    });

    expect(onDropOnCanvas).toHaveBeenCalledWith("devices", "device-boss-ds-1", 50, 50);
  });

  it("does not call onDropOnCanvas when placeFromCatalog point is outside canvas", () => {
    const { result } = renderHook(() =>
      useCatalogDrag({
        canvasRef: mocks.ref,
        zoomRef: mocks.zoomRef,
        panRef: mocks.panRef,
        onDropOnCanvas,
      })
    );

    act(() => {
      result.current.placeFromCatalog(50, 50, {
        mode: "devices",
        templateId: "device-boss-ds-1",
      });
    });

    expect(onDropOnCanvas).not.toHaveBeenCalled();
  });

  it("handles zoom when converting drop coordinates", () => {
    mocks.zoomRef.current = 2;
    mocks.panRef.current = { x: 100, y: 50 };

    const { result } = renderHook(() =>
      useCatalogDrag({
        canvasRef: mocks.ref,
        zoomRef: mocks.zoomRef,
        panRef: mocks.panRef,
        onDropOnCanvas,
      })
    );

    act(() => {
      result.current.placeFromCatalog(300, 150, {
        mode: "devices",
        templateId: "device-boss-ds-1",
      });
    });

    // Canvas rect + pan: (clientX - r.left - pan.x) / zoom → (300-100-100)/2=50, (150-50-50)/2=25
    expect(onDropOnCanvas).toHaveBeenCalledWith("devices", "device-boss-ds-1", 50, 25);
  });

  it("shouldIgnoreCatalogClick returns false initially, true after placeFromCatalog, then false after consumed", () => {
    const { result } = renderHook(() =>
      useCatalogDrag({
        canvasRef: mocks.ref,
        zoomRef: mocks.zoomRef,
        panRef: mocks.panRef,
        onDropOnCanvas,
      })
    );

    expect(result.current.shouldIgnoreCatalogClick()).toBe(false);
    expect(result.current.shouldIgnoreCatalogClick()).toBe(false);

    act(() => {
      result.current.placeFromCatalog(150, 100, {
        mode: "devices",
        templateId: "device-boss-ds-1",
      });
    });

    expect(result.current.shouldIgnoreCatalogClick()).toBe(true);
    expect(result.current.shouldIgnoreCatalogClick()).toBe(false);
  });
});
