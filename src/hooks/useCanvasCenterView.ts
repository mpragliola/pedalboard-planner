import { useCallback, type RefObject } from "react";
import { getObjectAabb } from "../lib/snapToBoundingBox";
import { templateService } from "../lib/templateService";
import type { Offset } from "../lib/vector";
import type { CanvasObjectType } from "../types";

interface UseCanvasCenterViewOptions {
  canvasRef: RefObject<HTMLDivElement | null>;
  objects: CanvasObjectType[];
  zoom: number;
  setPan: (value: Offset) => void;
  setCanvasAnimating: (value: boolean) => void;
}

/** Axis-aligned bbox centering with one animated pan update. */
export function useCanvasCenterView({
  canvasRef,
  objects,
  zoom,
  setPan,
  setCanvasAnimating,
}: UseCanvasCenterViewOptions) {
  return useCallback(() => {
    const el = canvasRef.current;
    if (!el || objects.length === 0) return;

    const getDimensions = templateService.getObjectDimensions;
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const obj of objects) {
      const aabb = getObjectAabb(obj, getDimensions);
      minX = Math.min(minX, aabb.left);
      minY = Math.min(minY, aabb.top);
      maxX = Math.max(maxX, aabb.left + aabb.width);
      maxY = Math.max(maxY, aabb.top + aabb.height);
    }

    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const rect = el.getBoundingClientRect();
    const targetPan = {
      x: rect.width / 2 - cx * zoom,
      y: rect.height / 2 - cy * zoom,
    };

    setCanvasAnimating(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setPan(targetPan));
    });
  }, [canvasRef, objects, zoom, setPan, setCanvasAnimating]);
}
