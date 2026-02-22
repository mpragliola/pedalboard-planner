import { useCallback, useMemo, useRef } from "react";

export type CanvasGestureMode = "idle" | "pointer-pan" | "pinch-pan" | "cable-draw" | "modal-open";
type ActiveCanvasGestureMode = Exclude<CanvasGestureMode, "idle">;

export type CanvasGestureEvent =
  | { type: "pinch-start" }
  | { type: "pinch-end" }
  // Any mode transition (idle <-> active or active <-> active) is broadcast.
  | { type: "mode-change"; from: CanvasGestureMode; to: CanvasGestureMode }
  // Convenience lifecycle events derived from mode-change, so consumers can
  // subscribe to high-level start/end without comparing from/to themselves.
  | { type: "gesture-start"; mode: ActiveCanvasGestureMode }
  | { type: "gesture-end"; mode: ActiveCanvasGestureMode };

type CanvasGestureEventType = CanvasGestureEvent["type"];
type CanvasGestureEventOfType<TType extends CanvasGestureEventType> = Extract<CanvasGestureEvent, { type: TType }>;

export interface CanvasGestureCoordinator {
  getMode: () => CanvasGestureMode;
  requestMode: (mode: ActiveCanvasGestureMode) => boolean;
  forceMode: (mode: ActiveCanvasGestureMode) => void;
  releaseMode: (mode: ActiveCanvasGestureMode) => void;
  isModeActive: (mode: ActiveCanvasGestureMode) => boolean;
  subscribe: (listener: (event: CanvasGestureEvent) => void) => () => void;
  /** Typed observer helper for subscribing to one specific event type. */
  subscribeType: <TType extends CanvasGestureEventType>(
    type: TType,
    listener: (event: CanvasGestureEventOfType<TType>) => void
  ) => () => void;
  /** Explicit publisher for gesture hooks that emit domain events (e.g. pinch start/end). */
  publish: (event: CanvasGestureEvent) => void;
}

export function useCanvasGestureCoordinator(): CanvasGestureCoordinator {
  const modeRef = useRef<CanvasGestureMode>("idle");
  const listenersRef = useRef<Set<(event: CanvasGestureEvent) => void>>(new Set());

  const getMode = useCallback(() => modeRef.current, []);

  const publish = useCallback((event: CanvasGestureEvent) => {
    // Snapshot listeners so a listener can unsubscribe itself safely during iteration.
    const listeners = Array.from(listenersRef.current);
    for (const listener of listeners) listener(event);
  }, []);

  const publishModeTransition = useCallback(
    (from: CanvasGestureMode, to: CanvasGestureMode) => {
      if (from === to) return;
      // Publish both the raw transition and derived lifecycle signals.
      publish({ type: "mode-change", from, to });
      if (from !== "idle") publish({ type: "gesture-end", mode: from });
      if (to !== "idle") publish({ type: "gesture-start", mode: to });
    },
    [publish]
  );

  const requestMode = useCallback((mode: ActiveCanvasGestureMode) => {
    const current = modeRef.current;
    if (modeRef.current === "idle" || modeRef.current === mode) {
      modeRef.current = mode;
      publishModeTransition(current, mode);
      return true;
    }
    return false;
  }, [publishModeTransition]);

  const forceMode = useCallback((mode: ActiveCanvasGestureMode) => {
    const current = modeRef.current;
    modeRef.current = mode;
    publishModeTransition(current, mode);
  }, [publishModeTransition]);

  const releaseMode = useCallback((mode: ActiveCanvasGestureMode) => {
    if (modeRef.current === mode) {
      modeRef.current = "idle";
      publishModeTransition(mode, "idle");
    }
  }, [publishModeTransition]);

  const isModeActive = useCallback((mode: ActiveCanvasGestureMode) => modeRef.current === mode, []);

  const subscribe = useCallback((listener: (event: CanvasGestureEvent) => void) => {
    listenersRef.current.add(listener);
    return () => {
      listenersRef.current.delete(listener);
    };
  }, []);

  const subscribeType = useCallback(
    <TType extends CanvasGestureEventType>(
      type: TType,
      listener: (event: CanvasGestureEventOfType<TType>) => void
    ) =>
      subscribe((event) => {
        if (event.type !== type) return;
        listener(event as CanvasGestureEventOfType<TType>);
      }),
    [subscribe]
  );

  return useMemo(
    () => ({
      getMode,
      requestMode,
      forceMode,
      releaseMode,
      isModeActive,
      subscribe,
      subscribeType,
      publish,
    }),
    [getMode, requestMode, forceMode, releaseMode, isModeActive, subscribe, subscribeType, publish]
  );
}
