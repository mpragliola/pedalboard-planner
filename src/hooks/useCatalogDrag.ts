import { useState, useCallback, useRef } from "react";
import { capturePointer } from "../lib/pointerCapture";

export interface CatalogDragState {
  templateId: string;
  mode: "boards" | "devices";
  imageUrl: string | null;
  widthMm: number;
  depthMm: number;
}

export interface UseCatalogDragOptions {
  canvasRef: React.RefObject<HTMLDivElement | null>;
  zoomRef: React.RefObject<number>;
  panRef: React.RefObject<{ x: number; y: number }>;
  onDropOnCanvas: (mode: "boards" | "devices", templateId: string, x: number, y: number) => void;
}

/**
 * Hook to manage catalog-to-canvas drag state.
 * Extracted from AppContext to improve separation of concerns.
 */
export function useCatalogDrag({ canvasRef, zoomRef, panRef, onDropOnCanvas }: UseCatalogDragOptions) {
  const [dragState, setDragState] = useState<CatalogDragState | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const ignoreNextClickRef = useRef(false);
  const dragStateRef = useRef(dragState);
  const releaseRef = useRef<() => void>(() => {});

  dragStateRef.current = dragState;

  const endDrag = useCallback(
    (clientX: number, clientY: number) => {
      releaseRef.current();
      releaseRef.current = () => {};
      document.body.classList.remove("catalog-dragging");

      const data = dragStateRef.current;
      if (!data) {
        setDragState(null);
        return;
      }

      const canvas = canvasRef.current;
      const zoom = zoomRef.current;
      const pan = panRef.current;
      if (canvas && zoom && pan) {
        const r = canvas.getBoundingClientRect();
        const isWithinCanvas = clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom;

        if (isWithinCanvas) {
          const x = (clientX - r.left - pan.x) / zoom;
          const y = (clientY - r.top - pan.y) / zoom;
          onDropOnCanvas(data.mode, data.templateId, x, y);
        }
      }

      ignoreNextClickRef.current = true;
      setDragState(null);
    },
    [canvasRef, zoomRef, panRef, onDropOnCanvas]
  );

  const startDrag = useCallback(
    (
      templateId: string,
      mode: "boards" | "devices",
      imageUrl: string | null,
      pointerId: number,
      clientX: number,
      clientY: number,
      widthMm: number,
      depthMm: number
    ) => {
      // Cleanup any existing drag
      releaseRef.current();
      document.body.classList.add("catalog-dragging");

      setDragState({ templateId, mode, imageUrl, widthMm, depthMm });
      setPosition({ x: clientX, y: clientY });

      const { release } = capturePointer(pointerId, {
        onMove: (e) => {
          setPosition({ x: e.clientX, y: e.clientY });
        },
        onEnd: (e) => {
          endDrag(e.clientX, e.clientY);
        },
      });

      releaseRef.current = release;
    },
    [endDrag]
  );

  const shouldIgnoreClick = useCallback(() => {
    const v = ignoreNextClickRef.current;
    ignoreNextClickRef.current = false;
    return v;
  }, []);

  return {
    catalogDrag: dragState,
    catalogDragPosition: position,
    setCatalogDragPosition: setPosition,
    startCatalogDrag: startDrag,
    endCatalogDrag: endDrag,
    shouldIgnoreCatalogClick: shouldIgnoreClick,
  };
}
