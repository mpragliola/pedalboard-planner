import { useCallback, useEffect, useRef, useState, type MutableRefObject } from "react";
import { ZOOM_MAX, ZOOM_MIN } from "../../constants/interaction";
import type { Offset } from "../../lib/vector";

interface UseZoomPanCoreOptions {
  initialZoom?: number;
  initialPan?: Offset;
  pauseRef: MutableRefObject<boolean>;
}

export function useZoomPanCore({ initialZoom, initialPan, pauseRef }: UseZoomPanCoreOptions) {
  const [zoom, setZoom] = useState<number>(initialZoom ?? 1);
  const [pan, setPan] = useState<Offset>(initialPan ?? { x: 0, y: 0 });

  const zoomRef = useRef(zoom);
  const panRef = useRef(pan);

  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  useEffect(() => {
    panRef.current = pan;
  }, [pan]);

  const zoomToward = useCallback(
    (newZoom: number, pivotX: number, pivotY: number) => {
      if (pauseRef.current) return;
      const currentZoom = zoomRef.current;
      const currentPan = panRef.current;
      const clampedZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, newZoom));
      const newPanX = pivotX - ((pivotX - currentPan.x) * clampedZoom) / currentZoom;
      const newPanY = pivotY - ((pivotY - currentPan.y) * clampedZoom) / currentZoom;
      zoomRef.current = clampedZoom;
      panRef.current = { x: newPanX, y: newPanY };
      setZoom(clampedZoom);
      setPan({ x: newPanX, y: newPanY });
    },
    [pauseRef]
  );

  return {
    zoom,
    pan,
    setZoom,
    setPan,
    zoomRef,
    panRef,
    zoomToward,
  };
}
