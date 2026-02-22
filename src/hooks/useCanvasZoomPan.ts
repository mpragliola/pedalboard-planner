import { useRef, useState, useCallback } from "react";
import type { Offset } from "../lib/vector";
import { TILE_SIZE_BASE } from "../constants/layout";
import { usePointerCanvasPan } from "./canvasZoomPan/usePointerCanvasPan";
import { useSpacePanMode } from "./canvasZoomPan/useSpacePanMode";
import { useTouchCanvasGestures } from "./canvasZoomPan/useTouchCanvasGestures";
import { useWheelCanvasZoom } from "./canvasZoomPan/useWheelCanvasZoom";
import { useZoomButtons } from "./canvasZoomPan/useZoomButtons";
import { useZoomPanCore } from "./canvasZoomPan/useZoomPanCore";
import type { CanvasGestureCoordinator } from "./useCanvasGestureCoordinator";

export interface UseCanvasZoomPanOptions {
  initialZoom?: number;
  initialPan?: Offset;
  gesture: CanvasGestureCoordinator;
}

export function useCanvasZoomPan(options: UseCanvasZoomPanOptions) {
  const pauseRef = useRef(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [animating, setAnimating] = useState(false);
  const [spaceDown, setSpaceDown] = useState(false);

  const { zoom, pan, setZoom, setPan, zoomRef, panRef, zoomToward } = useZoomPanCore({
    initialZoom: options.initialZoom,
    initialPan: options.initialPan,
    pauseRef,
  });

  const { isPanning, handleCanvasPointerDown, stopPanning } = usePointerCanvasPan({
    panRef,
    setPan,
    setAnimating,
    pauseRef,
    spaceDown,
    gesture: options.gesture,
  });

  useSpacePanMode({
    isPanning,
    setSpaceDown,
    stopPanning,
  });

  useWheelCanvasZoom({
    canvasRef,
    zoomRef,
    zoomToward,
    animating,
    setAnimating,
  });

  const { resetTouchGestures } = useTouchCanvasGestures({
    canvasRef,
    zoomRef,
    panRef,
    setPan,
    zoomToward,
    pauseRef,
    stopPanning,
    gesture: options.gesture,
  });

  const { zoomIn, zoomOut } = useZoomButtons({
    canvasRef,
    zoomRef,
    zoomToward,
    setAnimating,
  });

  const pausePanZoom = useCallback(
    (value: boolean) => {
      pauseRef.current = value;
      if (!value) return;
      setAnimating(false);
      stopPanning();
      resetTouchGestures();
    },
    [setAnimating, stopPanning, resetTouchGestures]
  );

  const tileSize = TILE_SIZE_BASE * zoom;

  return {
    zoom,
    pan,
    setZoom,
    setPan,
    animating,
    setAnimating,
    zoomRef,
    panRef,
    canvasRef,
    isPanning,
    spaceDown,
    zoomIn,
    zoomOut,
    zoomToward,
    handleCanvasPointerDown,
    tileSize,
    pausePanZoom,
  };
}
