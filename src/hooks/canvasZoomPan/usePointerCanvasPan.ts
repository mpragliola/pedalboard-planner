import { useCallback, useEffect, useRef, useState, type MutableRefObject } from "react";
import { addGlobalPointerListeners } from "../../lib/gesture/pointerEvents";
import type { Offset } from "../../lib/vector";
import type { CanvasGestureCoordinator } from "../useCanvasGestureCoordinator";
import {
  IDLE_POINTER_PAN_STATE,
  resolvePointerPanMove,
  shouldEndPointerPan,
  startPointerPan,
  type PointerPanState,
} from "./pointerPanStateMachine";

interface UsePointerCanvasPanOptions {
  panRef: MutableRefObject<Offset>;
  setPan: (pan: Offset) => void;
  setAnimating: (value: boolean) => void;
  pauseRef: MutableRefObject<boolean>;
  spaceDown: boolean;
  gesture: CanvasGestureCoordinator;
}

export function usePointerCanvasPan({
  panRef,
  setPan,
  setAnimating,
  pauseRef,
  spaceDown,
  gesture,
}: UsePointerCanvasPanOptions) {
  // Single explicit pan phase:
  // - `idle`: no active pointer-owned canvas pan
  // - `panning`: one pointer owns pan deltas until matching pointer-up
  const panStateRef = useRef<PointerPanState>(IDLE_POINTER_PAN_STATE);
  // Render-level mirror for effects/consumers; imperative reads use panStateRef.
  const [panStateTag, setPanStateTag] = useState<PointerPanState["tag"]>("idle");
  const isPanning = panStateTag === "panning";

  const stopPanning = useCallback(() => {
    panStateRef.current = IDLE_POINTER_PAN_STATE;
    setPanStateTag("idle");
    gesture.releaseMode("pointer-pan");
  }, [gesture]);

  useEffect(() => {
    if (!isPanning) return;

    const handlePointerMove = (e: PointerEvent) => {
      const nextPan = resolvePointerPanMove(panStateRef.current, e.pointerId, e.clientX, e.clientY);
      if (!nextPan) return;
      setPan(nextPan);
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (!shouldEndPointerPan(panStateRef.current, e.pointerId)) return;
      stopPanning();
    };

    return addGlobalPointerListeners(handlePointerMove, handlePointerUp);
  }, [isPanning, setPan, stopPanning]);

  const handleCanvasPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (pauseRef.current) return;
      const onObject = (e.target as Element).closest(".canvas-object-wrapper");
      const startPan =
        e.button === 1 ||
        (e.button === 0 && spaceDown) ||
        (!onObject && e.button === 0);

      if (!startPan) return;
      if (!gesture.requestMode("pointer-pan")) return;
      e.preventDefault();
      setAnimating(false);
      panStateRef.current = startPointerPan({
        pointerId: e.pointerId,
        mouseX: e.clientX,
        mouseY: e.clientY,
        panX: panRef.current.x,
        panY: panRef.current.y,
      });
      setPanStateTag("panning");
    },
    [pauseRef, spaceDown, setAnimating, panRef, gesture]
  );

  return {
    isPanning,
    handleCanvasPointerDown,
    stopPanning,
  };
}
