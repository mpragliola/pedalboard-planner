import { useCallback, useMemo, useRef } from "react";

export type CanvasGestureMode = "idle" | "pointer-pan" | "pinch-pan" | "cable-draw" | "modal-open";
type ActiveCanvasGestureMode = Exclude<CanvasGestureMode, "idle">;

export interface CanvasGestureCoordinator {
  getMode: () => CanvasGestureMode;
  requestMode: (mode: ActiveCanvasGestureMode) => boolean;
  forceMode: (mode: ActiveCanvasGestureMode) => void;
  releaseMode: (mode: ActiveCanvasGestureMode) => void;
  isModeActive: (mode: ActiveCanvasGestureMode) => boolean;
}

export function useCanvasGestureCoordinator(): CanvasGestureCoordinator {
  const modeRef = useRef<CanvasGestureMode>("idle");

  const getMode = useCallback(() => modeRef.current, []);

  const requestMode = useCallback((mode: ActiveCanvasGestureMode) => {
    if (modeRef.current === "idle" || modeRef.current === mode) {
      modeRef.current = mode;
      return true;
    }
    return false;
  }, []);

  const forceMode = useCallback((mode: ActiveCanvasGestureMode) => {
    modeRef.current = mode;
  }, []);

  const releaseMode = useCallback((mode: ActiveCanvasGestureMode) => {
    if (modeRef.current === mode) modeRef.current = "idle";
  }, []);

  const isModeActive = useCallback((mode: ActiveCanvasGestureMode) => modeRef.current === mode, []);

  return useMemo(
    () => ({
      getMode,
      requestMode,
      forceMode,
      releaseMode,
      isModeActive,
    }),
    [getMode, requestMode, forceMode, releaseMode, isModeActive]
  );
}
