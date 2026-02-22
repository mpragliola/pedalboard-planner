import { useCallback, useEffect, useRef, type MutableRefObject, type RefObject } from "react";
import type { Offset } from "../../lib/vector";
import { PINCH_DETECTION_THRESHOLD, ZOOM_MAX, ZOOM_MIN } from "../../constants/interaction";
import type { CanvasGestureCoordinator } from "../useCanvasGestureCoordinator";
import {
  IDLE_TOUCH_GESTURE_STATE,
  resolvePinchMove,
  startPinchGesture,
  type TouchGestureState,
} from "./touchGestureStateMachine";

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
  /**
   * Explicit gesture state machine stored in a ref so event listeners always
   * see the latest state without re-registering DOM handlers.
   */
  const touchGestureRef = useRef<TouchGestureState>(IDLE_TOUCH_GESTURE_STATE);

  const endPinch = useCallback(() => {
    const hadPinch = touchGestureRef.current.tag === "pinching";
    touchGestureRef.current = IDLE_TOUCH_GESTURE_STATE;
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
      touchGestureRef.current = startPinchGesture(e.touches[0], e.touches[1], zoomRef.current);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (pauseRef.current || e.touches.length !== 2) return;
      if (touchGestureRef.current.tag !== "pinching") return;
      e.preventDefault();

      const decision = resolvePinchMove(touchGestureRef.current, e.touches[0], e.touches[1], PINCH_DETECTION_THRESHOLD);
      touchGestureRef.current = decision.nextState;

      if (decision.tag === "zoom") {
        const newZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, decision.nextState.initialZoom * decision.scale));
        zoomToward(newZoom, decision.pivotX, decision.pivotY);
        return;
      }

      if (decision.tag !== "pan") return;

      setPan({
        x: panRef.current.x + decision.deltaX,
        y: panRef.current.y + decision.deltaY,
      });
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
