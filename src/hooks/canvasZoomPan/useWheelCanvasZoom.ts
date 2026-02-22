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
import { getWheelApplyDelay, normalizeWheelDelta } from "./wheelTiming";

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
  // We keep one pivot for a short burst of wheel events so zoom feels anchored
  // (trackpad streams can emit many events within milliseconds).
  const wheelPivotRef = useRef<{ x: number; y: number; at: number } | null>(null);
  // Timestamp of last committed zoom apply. Used only for throttle math.
  const lastWheelApplyRef = useRef(0);
  // Explicitly tracks whether we have ever applied during the current burst.
  // This avoids sentinel checks like `lastApply === 0` for "never applied".
  const hasAppliedRef = useRef(false);
  // Throttle timer: schedules the next apply at the end of throttle window.
  const wheelApplyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Debounce timer: ends animation once wheel activity settles.
  const wheelEndTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Latest desired zoom/pivot, continuously updated by wheel deltas.
  const pendingZoomRef = useRef(zoomRef.current);
  const pendingPivotRef = useRef<Point>({ x: 0, y: 0 });

  useEffect(() => {
    if (!animating) {
      // When animation ends, baseline pending zoom to committed zoom so the next
      // wheel burst starts from actual state rather than stale buffered value.
      pendingZoomRef.current = zoomRef.current;
    }
  }, [animating, zoomRef]);

  const clearWheelApplyTimeout = useCallback(() => {
    if (wheelApplyTimeoutRef.current === null) return;
    clearTimeout(wheelApplyTimeoutRef.current);
    wheelApplyTimeoutRef.current = null;
  }, []);

  const clearWheelEndTimeout = useCallback(() => {
    if (wheelEndTimeoutRef.current === null) return;
    clearTimeout(wheelEndTimeoutRef.current);
    wheelEndTimeoutRef.current = null;
  }, []);

  const scheduleWheelEnd = useCallback(() => {
    // Any new wheel activity postpones "end of burst".
    clearWheelEndTimeout();
    wheelEndTimeoutRef.current = setTimeout(() => {
      setAnimating(false);
      // Reset burst marker so first event of next burst applies immediately.
      hasAppliedRef.current = false;
    }, WHEEL_TRANSITION_MS);
  }, [clearWheelEndTimeout, setAnimating]);

  const applyPending = useCallback(() => {
    // Single place where buffered zoom is committed to canvas.
    zoomToward(pendingZoomRef.current, pendingPivotRef.current.x, pendingPivotRef.current.y);
    lastWheelApplyRef.current = performance.now();
    hasAppliedRef.current = true;
    // Applying now invalidates any queued apply and restarts end timer.
    clearWheelApplyTimeout();
    scheduleWheelEnd();
  }, [zoomToward, clearWheelApplyTimeout, scheduleWheelEnd]);

  const handleWheelZoom = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      setAnimating(true);
      const now = performance.now();
      let pivot = wheelPivotRef.current;
      if (!pivot || now - pivot.at > WHEEL_PIVOT_MS) {
        // Start a fresh pivot after inactivity window.
        pivot = { x: e.clientX, y: e.clientY, at: now };
        wheelPivotRef.current = pivot;
      }

      // Convert wheel delta to normalized direction/scale units first.
      const normalizedDelta = normalizeWheelDelta(e.deltaMode, e.deltaY);
      const factor = 1 + normalizedDelta * WHEEL_ZOOM_FACTOR;
      // Buffer zoom result; actual apply may be immediate or throttled.
      pendingZoomRef.current = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, pendingZoomRef.current * factor));
      pendingPivotRef.current = { x: pivot.x, y: pivot.y };

      // Compute when next apply is legal under throttle policy.
      const delay = getWheelApplyDelay({
        hasApplied: hasAppliedRef.current,
        lastApplyAt: lastWheelApplyRef.current,
        now,
        throttleMs: WHEEL_THROTTLE_MS,
      });

      if (delay === 0) {
        // First event in burst, or throttle window already passed.
        applyPending();
      } else if (wheelApplyTimeoutRef.current === null) {
        // Queue one pending apply if none is already queued.
        wheelApplyTimeoutRef.current = setTimeout(applyPending, delay);
      }
    },
    [applyPending, setAnimating]
  );

  useEffect(() => {
    return () => {
      // Defensive cleanup for unmount/reload.
      clearWheelApplyTimeout();
      clearWheelEndTimeout();
    };
  }, [clearWheelApplyTimeout, clearWheelEndTimeout]);

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      const target = e.target as Element | null;
      if (!target) return;
      // Opt-out zones and modal state should never trigger canvas zoom.
      if (target.closest("[data-no-canvas-zoom]")) return;
      if (document.querySelector('dialog[open], [role="dialog"][aria-modal="true"]')) return;

      const el = canvasRef.current;
      if (!el) return;
      // Ignore wheel events outside this canvas instance.
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
