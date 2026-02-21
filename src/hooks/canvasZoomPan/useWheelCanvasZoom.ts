import { useCallback, useEffect, useRef, type MutableRefObject, type RefObject } from "react";
import {
  WHEEL_PIVOT_MS,
  WHEEL_THROTTLE_MS,
  WHEEL_TRANSITION_MS,
  WHEEL_ZOOM_FACTOR,
  ZOOM_MAX,
  ZOOM_MIN,
} from "../../constants/interaction";
import type { Point } from "../../lib/vector";

interface UseWheelCanvasZoomOptions {
  canvasRef: RefObject<HTMLDivElement>;
  zoomRef: MutableRefObject<number>;
  zoomToward: (newZoom: number, pivotX: number, pivotY: number) => void;
  animating: boolean;
  setAnimating: (value: boolean) => void;
}

export function useWheelCanvasZoom({
  canvasRef,
  zoomRef,
  zoomToward,
  animating,
  setAnimating,
}: UseWheelCanvasZoomOptions) {
  const wheelPivotRef = useRef<{ x: number; y: number; at: number } | null>(null);
  const lastWheelApplyRef = useRef(0);
  const wheelApplyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wheelEndTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingZoomRef = useRef(zoomRef.current);
  const pendingPivotRef = useRef<Point>({ x: 0, y: 0 });

  useEffect(() => {
    if (!animating) {
      pendingZoomRef.current = zoomRef.current;
    }
  }, [animating, zoomRef]);

  const handleWheelZoom = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      setAnimating(true);
      const now = performance.now();
      let pivot = wheelPivotRef.current;
      if (!pivot || now - pivot.at > WHEEL_PIVOT_MS) {
        pivot = { x: e.clientX, y: e.clientY, at: now };
        wheelPivotRef.current = pivot;
      }

      const normalizedDelta = e.deltaMode === 1 ? -e.deltaY * 32 : -e.deltaY;
      const factor = 1 + normalizedDelta * WHEEL_ZOOM_FACTOR;
      pendingZoomRef.current = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, pendingZoomRef.current * factor));
      pendingPivotRef.current = { x: pivot.x, y: pivot.y };

      const lastApply = lastWheelApplyRef.current;
      const elapsed = lastApply === 0 ? WHEEL_THROTTLE_MS : now - lastApply;

      const applyPending = () => {
        zoomToward(pendingZoomRef.current, pendingPivotRef.current.x, pendingPivotRef.current.y);
        lastWheelApplyRef.current = performance.now();
        wheelApplyTimeoutRef.current = null;
        if (wheelEndTimeoutRef.current !== null) clearTimeout(wheelEndTimeoutRef.current);
        wheelEndTimeoutRef.current = setTimeout(() => {
          setAnimating(false);
          lastWheelApplyRef.current = 0;
        }, WHEEL_TRANSITION_MS);
      };

      if (lastApply === 0 || elapsed >= WHEEL_THROTTLE_MS) {
        if (wheelApplyTimeoutRef.current !== null) {
          clearTimeout(wheelApplyTimeoutRef.current);
          wheelApplyTimeoutRef.current = null;
        }
        applyPending();
      } else if (wheelApplyTimeoutRef.current === null) {
        wheelApplyTimeoutRef.current = setTimeout(applyPending, WHEEL_THROTTLE_MS - elapsed);
      }
    },
    [setAnimating, zoomToward]
  );

  useEffect(() => {
    return () => {
      if (wheelApplyTimeoutRef.current !== null) clearTimeout(wheelApplyTimeoutRef.current);
      if (wheelEndTimeoutRef.current !== null) clearTimeout(wheelEndTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      const target = e.target as Element | null;
      if (!target) return;
      if (target.closest("[data-no-canvas-zoom]")) return;
      if (document.querySelector('dialog[open], [role="dialog"][aria-modal="true"]')) return;

      const el = canvasRef.current;
      if (!el) return;
      if (!el.contains(target)) return;

      const rect = el.getBoundingClientRect();
      if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) return;
      handleWheelZoom(e);
    };

    const wheelOptions = { passive: false, capture: true } as const;
    document.addEventListener("wheel", onWheel, wheelOptions);
    return () => document.removeEventListener("wheel", onWheel, wheelOptions);
  }, [canvasRef, handleWheelZoom]);
}
