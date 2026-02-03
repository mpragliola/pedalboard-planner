import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCatalogDrag } from "./useCatalogDrag";

function createMockCanvas() {
  const rect = { left: 100, top: 50, right: 500, bottom: 400, width: 400, height: 350 };
  return {
    ref: { current: { getBoundingClientRect: () => rect } as HTMLDivElement },
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

  it("returns null catalogDrag initially", () => {
    const { result } = renderHook(() =>
      useCatalogDrag({
        canvasRef: mocks.ref,
        zoomRef: mocks.zoomRef,
        panRef: mocks.panRef,
        onDropOnCanvas,
      })
    );
    expect(result.current.catalogDrag).toBeNull();
  });

  it("sets catalogDrag state when startCatalogDrag is called", () => {
    const { result } = renderHook(() =>
      useCatalogDrag({
        canvasRef: mocks.ref,
        zoomRef: mocks.zoomRef,
        panRef: mocks.panRef,
        onDropOnCanvas,
      })
    );

    act(() => {
      result.current.startCatalogDrag(
        "device-boss-ds-1",
        "devices",
        "images/devices/boss/ds1.png",
        1,
        200,
        200,
        73,
        129
      );
    });

    expect(result.current.catalogDrag).toEqual({
      templateId: "device-boss-ds-1",
      mode: "devices",
      imageUrl: "images/devices/boss/ds1.png",
      widthMm: 73,
      depthMm: 129,
    });
    expect(result.current.catalogDragPosition).toEqual({ x: 200, y: 200 });
  });

  it("adds catalog-dragging class to body when drag starts", () => {
    const { result } = renderHook(() =>
      useCatalogDrag({
        canvasRef: mocks.ref,
        zoomRef: mocks.zoomRef,
        panRef: mocks.panRef,
        onDropOnCanvas,
      })
    );

    act(() => {
      result.current.startCatalogDrag("device-boss-ds-1", "devices", null, 1, 0, 0, 73, 129);
    });

    expect(document.body.classList.contains("catalog-dragging")).toBe(true);
  });

  it("calls onDropOnCanvas when endCatalogDrag is called with point inside canvas", () => {
    const { result } = renderHook(() =>
      useCatalogDrag({
        canvasRef: mocks.ref,
        zoomRef: mocks.zoomRef,
        panRef: mocks.panRef,
        onDropOnCanvas,
      })
    );

    act(() => {
      result.current.startCatalogDrag("device-boss-ds-1", "devices", null, 1, 0, 0, 73, 129);
    });

    act(() => {
      result.current.endCatalogDrag(150, 100); // inside canvas (100-500, 50-400)
    });

    expect(onDropOnCanvas).toHaveBeenCalledWith("devices", "device-boss-ds-1", 50, 50);
    expect(result.current.catalogDrag).toBeNull();
  });

  it("does not call onDropOnCanvas when end point is outside canvas", () => {
    const { result } = renderHook(() =>
      useCatalogDrag({
        canvasRef: mocks.ref,
        zoomRef: mocks.zoomRef,
        panRef: mocks.panRef,
        onDropOnCanvas,
      })
    );

    act(() => {
      result.current.startCatalogDrag("device-boss-ds-1", "devices", null, 1, 0, 0, 73, 129);
    });

    act(() => {
      result.current.endCatalogDrag(50, 50); // outside canvas (left of 100)
    });

    expect(onDropOnCanvas).not.toHaveBeenCalled();
  });

  it("removes catalog-dragging class when endCatalogDrag is called", () => {
    const { result } = renderHook(() =>
      useCatalogDrag({
        canvasRef: mocks.ref,
        zoomRef: mocks.zoomRef,
        panRef: mocks.panRef,
        onDropOnCanvas,
      })
    );

    act(() => {
      result.current.startCatalogDrag("device-boss-ds-1", "devices", null, 1, 0, 0, 73, 129);
    });
    expect(document.body.classList.contains("catalog-dragging")).toBe(true);

    act(() => {
      result.current.endCatalogDrag(150, 100);
    });
    expect(document.body.classList.contains("catalog-dragging")).toBe(false);
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
      result.current.startCatalogDrag("device-boss-ds-1", "devices", null, 1, 0, 0, 73, 129);
    });

    act(() => {
      result.current.endCatalogDrag(300, 150);
    });

    // (300 - 100 - 100) / 2 = 50, (150 - 50 - 50) / 2 = 25
    expect(onDropOnCanvas).toHaveBeenCalledWith("devices", "device-boss-ds-1", 50, 25);
  });

  it("updates position when setCatalogDragPosition is called", () => {
    const { result } = renderHook(() =>
      useCatalogDrag({
        canvasRef: mocks.ref,
        zoomRef: mocks.zoomRef,
        panRef: mocks.panRef,
        onDropOnCanvas,
      })
    );

    act(() => {
      result.current.startCatalogDrag("device-boss-ds-1", "devices", null, 1, 0, 0, 73, 129);
    });

    act(() => {
      result.current.setCatalogDragPosition({ x: 300, y: 250 });
    });

    expect(result.current.catalogDragPosition).toEqual({ x: 300, y: 250 });
  });
});
