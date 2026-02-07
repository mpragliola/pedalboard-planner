import { useCallback, useRef } from "react";
import { clientToCanvasPoint, type Pan2D } from "../lib/canvasCoords";

export interface UseCatalogDragOptions {
  canvasRef: React.RefObject<HTMLDivElement | null>;
  zoomRef: React.RefObject<number>;
  panRef: React.RefObject<Pan2D>;
  onDropOnCanvas: (mode: "boards" | "devices", templateId: string, x: number, y: number) => void;
}

/**
 * Hook for catalog-to-canvas drop: converts client coordinates to canvas space and calls onDropOnCanvas.
 * Also provides shouldIgnoreCatalogClick so the next canvas click can be ignored after a drop (e.g. to avoid closing the panel).
 * Used with @dnd-kit: DndContext onDragEnd calls placeFromCatalog with the drop position.
 */
export function useCatalogDrag({ canvasRef, zoomRef, panRef, onDropOnCanvas }: UseCatalogDragOptions) {
  const ignoreNextClickRef = useRef(false);

  const placeFromCatalog = useCallback(
    (clientX: number, clientY: number, data: { mode: "boards" | "devices"; templateId: string }) => {
      const canvas = canvasRef.current;
      const zoom = zoomRef.current;
      const pan = panRef.current;
      if (!canvas || zoom == null || !pan) return;

      const r = canvas.getBoundingClientRect();
      const isWithinCanvas = clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom;

      if (isWithinCanvas) {
        const point = clientToCanvasPoint(clientX, clientY, r, zoom, pan);
        onDropOnCanvas(data.mode, data.templateId, point.x, point.y);
      }

      ignoreNextClickRef.current = true;
    },
    [canvasRef, zoomRef, panRef, onDropOnCanvas]
  );

  const shouldIgnoreCatalogClick = useCallback(() => {
    const v = ignoreNextClickRef.current;
    ignoreNextClickRef.current = false;
    return v;
  }, []);

  return {
    placeFromCatalog,
    shouldIgnoreCatalogClick,
  };
}
