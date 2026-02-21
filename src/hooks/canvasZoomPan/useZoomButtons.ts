import { useCallback, type MutableRefObject, type RefObject } from "react";
import { ZOOM_STEP } from "../../constants/interaction";

interface UseZoomButtonsOptions {
  canvasRef: RefObject<HTMLDivElement>;
  zoomRef: MutableRefObject<number>;
  zoomToward: (newZoom: number, pivotX: number, pivotY: number) => void;
  setAnimating: (value: boolean) => void;
}

function viewportCenter(canvasRef: RefObject<HTMLDivElement>): { x: number; y: number } {
  const el = canvasRef.current;
  if (!el) return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  const rect = el.getBoundingClientRect();
  return { x: rect.left + el.offsetWidth / 2, y: rect.top + el.offsetHeight / 2 };
}

export function useZoomButtons({ canvasRef, zoomRef, zoomToward, setAnimating }: UseZoomButtonsOptions) {
  const zoomIn = useCallback(() => {
    setAnimating(true);
    const pivot = viewportCenter(canvasRef);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => zoomToward(zoomRef.current + ZOOM_STEP, pivot.x, pivot.y));
    });
  }, [canvasRef, zoomRef, zoomToward, setAnimating]);

  const zoomOut = useCallback(() => {
    setAnimating(true);
    const pivot = viewportCenter(canvasRef);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => zoomToward(zoomRef.current - ZOOM_STEP, pivot.x, pivot.y));
    });
  }, [canvasRef, zoomRef, zoomToward, setAnimating]);

  return { zoomIn, zoomOut };
}
