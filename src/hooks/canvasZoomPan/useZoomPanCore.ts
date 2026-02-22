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

  // Ref mirrors of render state:
  // - state drives React rendering and external consumers
  // - refs are read inside long-lived callbacks to avoid stale closure values
  //   without forcing callback recreation every frame/event.
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
      // Read from refs (not state closures) so this callback always uses the
      // latest committed zoom/pan, even when invoked by deferred listeners.
      const currentZoom = zoomRef.current;
      const currentPan = panRef.current;
      const clampedZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, newZoom));
      const newPanX = pivotX - ((pivotX - currentPan.x) * clampedZoom) / currentZoom;
      const newPanY = pivotY - ((pivotY - currentPan.y) * clampedZoom) / currentZoom;
      // Write through both channels in one place to keep refs/state in sync.
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
