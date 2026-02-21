import { useCallback, useEffect, useRef, useState, type MutableRefObject } from "react";
import { addGlobalPointerListeners } from "../../lib/pointerEvents";
import type { Offset } from "../../lib/vector";

interface UsePointerCanvasPanOptions {
  panRef: MutableRefObject<Offset>;
  setPan: (pan: Offset) => void;
  setAnimating: (value: boolean) => void;
  pauseRef: MutableRefObject<boolean>;
  spaceDown: boolean;
}

export function usePointerCanvasPan({
  panRef,
  setPan,
  setAnimating,
  pauseRef,
  spaceDown,
}: UsePointerCanvasPanOptions) {
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<{ mouseX: number; mouseY: number; panX: number; panY: number; pointerId: number } | null>(
    null
  );

  const stopPanning = useCallback(() => {
    setIsPanning(false);
    panStartRef.current = null;
  }, []);

  useEffect(() => {
    if (!isPanning) return;

    const handlePointerMove = (e: PointerEvent) => {
      if (!panStartRef.current || e.pointerId !== panStartRef.current.pointerId) return;
      const dx = e.clientX - panStartRef.current.mouseX;
      const dy = e.clientY - panStartRef.current.mouseY;
      setPan({
        x: panStartRef.current.panX + dx,
        y: panStartRef.current.panY + dy,
      });
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (!panStartRef.current || e.pointerId !== panStartRef.current.pointerId) return;
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
      e.preventDefault();
      setAnimating(false);
      setIsPanning(true);
      panStartRef.current = {
        mouseX: e.clientX,
        mouseY: e.clientY,
        panX: panRef.current.x,
        panY: panRef.current.y,
        pointerId: e.pointerId,
      };
    },
    [pauseRef, spaceDown, setAnimating, panRef]
  );

  return {
    isPanning,
    handleCanvasPointerDown,
    stopPanning,
  };
}
