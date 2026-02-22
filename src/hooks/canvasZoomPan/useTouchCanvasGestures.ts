import { useCallback, useEffect, useRef, type MutableRefObject, type RefObject } from "react";
import type { Offset } from "../../lib/vector";
import { PINCH_DETECTION_THRESHOLD, ZOOM_MAX, ZOOM_MIN } from "../../constants/interaction";
import { center, dist } from "./utils";
import type { CanvasGestureCoordinator } from "../useCanvasGestureCoordinator";

interface UseTouchCanvasGesturesOptions {
  canvasRef: RefObject<HTMLDivElement>;
  zoomRef: MutableRefObject<number>;
  panRef: MutableRefObject<Offset>;
  setPan: (pan: Offset) => void;
  zoomToward: (newZoom: number, pivotX: number, pivotY: number) => void;
  pauseRef: MutableRefObject<boolean>;
  stopPanning: () => void;
  gesture: CanvasGestureCoordinator;
}

type PinchState = {
  initialDistance: number;
  initialZoom: number;
  centerX: number;
  centerY: number;
  prevCenterX: number;
  prevCenterY: number;
};

export function useTouchCanvasGestures({
  canvasRef,
  zoomRef,
  panRef,
  setPan,
  zoomToward,
  pauseRef,
  stopPanning,
  gesture,
}: UseTouchCanvasGesturesOptions) {
  const pinchRef = useRef<PinchState | null>(null);

  const endPinch = useCallback(() => {
    const hadPinch = pinchRef.current !== null;
    pinchRef.current = null;
    gesture.releaseMode("pinch-pan");
    if (hadPinch) gesture.publish({ type: "pinch-end" });
  }, [gesture]);

  const resetTouchGestures = useCallback(() => {
    endPinch();
  }, [endPinch]);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (pauseRef.current || e.touches.length !== 2) return;
      e.preventDefault();
      stopPanning();
      gesture.forceMode("pinch-pan");
      // Pinch lifecycle is broadcast via observer bus so competing gestures can react
      // without direct callback plumbing between hooks.
      gesture.publish({ type: "pinch-start" });
      const pinchCenter = center(e.touches[0], e.touches[1]);
      pinchRef.current = {
        initialDistance: dist(e.touches[0], e.touches[1]),
        initialZoom: zoomRef.current,
        centerX: pinchCenter.x,
        centerY: pinchCenter.y,
        prevCenterX: pinchCenter.x,
        prevCenterY: pinchCenter.y,
      };
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (pauseRef.current || e.touches.length !== 2 || !pinchRef.current) return;
      e.preventDefault();

      const d = dist(e.touches[0], e.touches[1]);
      const scale = d / pinchRef.current.initialDistance;
      const pinchCenter = center(e.touches[0], e.touches[1]);

      if (scale < PINCH_DETECTION_THRESHOLD || scale > 1 / PINCH_DETECTION_THRESHOLD) {
        const newZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, pinchRef.current.initialZoom * scale));
        zoomToward(newZoom, pinchRef.current.centerX, pinchRef.current.centerY);
        return;
      }

      const dx = pinchCenter.x - pinchRef.current.prevCenterX;
      const dy = pinchCenter.y - pinchRef.current.prevCenterY;
      setPan({
        x: panRef.current.x + dx,
        y: panRef.current.y + dy,
      });
      pinchRef.current.prevCenterX = pinchCenter.x;
      pinchRef.current.prevCenterY = pinchCenter.y;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        endPinch();
      }
    };

    el.addEventListener("touchstart", handleTouchStart, { passive: false });
    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    el.addEventListener("touchend", handleTouchEnd, { passive: true });
    el.addEventListener("touchcancel", handleTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
      el.removeEventListener("touchcancel", handleTouchEnd);
      endPinch();
    };
  }, [canvasRef, panRef, pauseRef, setPan, stopPanning, zoomRef, zoomToward, gesture, endPinch]);

  return {
    resetTouchGestures,
  };
}
