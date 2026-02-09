import { useState, useCallback, useEffect, useRef } from "react";
import { vec2Add, vec2Scale } from "../lib/vector";
import type { Offset, Point } from "../lib/vector";
import {
  ZOOM_MIN,
  ZOOM_MAX,
  ZOOM_STEP,
  TILE_SIZE_BASE,
  WHEEL_PIVOT_MS,
  WHEEL_THROTTLE_MS,
  WHEEL_TRANSITION_MS,
  WHEEL_ZOOM_FACTOR,
  PINCH_DETECTION_THRESHOLD,
} from "../constants";

function dist(a: { clientX: number; clientY: number }, b: { clientX: number; clientY: number }) {
  return Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
}

type ClientPoint = { clientX: number; clientY: number };

function clientPointToPoint(p: ClientPoint): Point {
  return { x: p.clientX, y: p.clientY };
}

function center(a: ClientPoint, b: ClientPoint): Point {
  return vec2Scale(vec2Add(clientPointToPoint(a), clientPointToPoint(b)), 0.5);
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA") {
    const input = target as HTMLInputElement | HTMLTextAreaElement;
    return !input.readOnly && !input.disabled;
  }
  return Boolean(target.closest('[contenteditable="true"]'));
}

export interface UseCanvasZoomPanOptions {
  initialZoom?: number;
  initialPan?: Offset;
  /** Called when pinch starts (2 fingers); use to cancel object drag so pinch and drag are mutually exclusive. */
  onPinchStart?: () => void;
}

export function useCanvasZoomPan(options?: UseCanvasZoomPanOptions) {
  const onPinchStart = options?.onPinchStart;
  const [zoom, setZoom] = useState<number>(options?.initialZoom ?? 1);
  const [pan, setPan] = useState<Offset>(options?.initialPan ?? { x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const pauseRef = useRef(false);
  const [spaceDown, setSpaceDown] = useState(false);
  const panStartRef = useRef<{ mouseX: number; mouseY: number; panX: number; panY: number; pointerId: number } | null>(
    null
  );
  const pinchRef = useRef<{
    initialDistance: number;
    initialZoom: number;
    initialPan: Offset;
    centerX: number;
    centerY: number;
    mode: "pinch" | "pan"; // 'pinch' for zoom, 'pan' for two-finger drag
    prevCenterX: number;
    prevCenterY: number;
  } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef(zoom);
  const panRef = useRef(pan);
  const [animating, setAnimating] = useState(false);
  const wheelPivotRef = useRef<{ x: number; y: number; at: number } | null>(null);
  const lastWheelApplyRef = useRef(0);
  const wheelApplyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wheelEndTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingZoomRef = useRef(zoomRef.current);
  const pendingPivotRef = useRef<Point>({ x: 0, y: 0 });
  /* Keep pending in sync when we apply from buttons/center so wheel uses correct base */
  useEffect(() => {
    if (!animating) {
      pendingZoomRef.current = zoomRef.current;
    }
  }, [zoom, animating]);

  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);
  useEffect(() => {
    panRef.current = pan;
  }, [pan]);

  const zoomToward = useCallback((newZoom: number, pivotX: number, pivotY: number) => {
    if (pauseRef.current) return;
    const z = zoomRef.current;
    const p = panRef.current;
    const clampedZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, newZoom));
    const newPanX = pivotX - ((pivotX - p.x) * clampedZoom) / z;
    const newPanY = pivotY - ((pivotY - p.y) * clampedZoom) / z;
    zoomRef.current = clampedZoom;
    panRef.current = { x: newPanX, y: newPanY };
    setZoom(clampedZoom);
    setPan({ x: newPanX, y: newPanY });
  }, []);

  const zoomIn = useCallback(() => {
    setAnimating(true);
    const el = canvasRef.current;
    const centerX = el ? el.getBoundingClientRect().left + el.offsetWidth / 2 : window.innerWidth / 2;
    const centerY = el ? el.getBoundingClientRect().top + el.offsetHeight / 2 : window.innerHeight / 2;
    /* Defer so CSS sees old transform first, then new → transition runs */
    requestAnimationFrame(() => {
      requestAnimationFrame(() => zoomToward(zoomRef.current + ZOOM_STEP, centerX, centerY));
    });
  }, [zoomToward]);

  const zoomOut = useCallback(() => {
    setAnimating(true);
    const el = canvasRef.current;
    const centerX = el ? el.getBoundingClientRect().left + el.offsetWidth / 2 : window.innerWidth / 2;
    const centerY = el ? el.getBoundingClientRect().top + el.offsetHeight / 2 : window.innerHeight / 2;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => zoomToward(zoomRef.current - ZOOM_STEP, centerX, centerY));
    });
  }, [zoomToward]);

  const handleWheelZoom = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      setAnimating(true); /* CSS transition for smooth wheel zoom */
      const now = performance.now();
      let pivot = wheelPivotRef.current;
      if (!pivot || now - pivot.at > WHEEL_PIVOT_MS) {
        pivot = { x: e.clientX, y: e.clientY, at: now };
        wheelPivotRef.current = pivot;
      }
      const normalizedDelta = e.deltaMode === 1 ? -e.deltaY * 32 : -e.deltaY;
      const factor = 1 + normalizedDelta * WHEEL_ZOOM_FACTOR;
      /* Accumulate so multiple wheel events before apply compound */
      pendingZoomRef.current = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, pendingZoomRef.current * factor));
      pendingPivotRef.current = { x: pivot.x, y: pivot.y };
      const lastApply = lastWheelApplyRef.current;
      const elapsed = lastApply === 0 ? WHEEL_THROTTLE_MS : now - lastApply;
      const applyPending = () => {
        zoomToward(pendingZoomRef.current, pendingPivotRef.current.x, pendingPivotRef.current.y);
        lastWheelApplyRef.current = performance.now();
        wheelApplyTimeoutRef.current = null;
        if (wheelEndTimeoutRef.current !== null) clearTimeout(wheelEndTimeoutRef.current);
        wheelEndTimeoutRef.current = setTimeout(() => {
          setAnimating(false);
          lastWheelApplyRef.current = 0;
        }, WHEEL_TRANSITION_MS);
      };
      if (lastApply === 0 || elapsed >= WHEEL_THROTTLE_MS) {
        if (wheelApplyTimeoutRef.current !== null) {
          clearTimeout(wheelApplyTimeoutRef.current);
          wheelApplyTimeoutRef.current = null;
        }
        applyPending();
      } else if (wheelApplyTimeoutRef.current === null) {
        wheelApplyTimeoutRef.current = setTimeout(applyPending, WHEEL_THROTTLE_MS - elapsed);
      }
    },
    [zoomToward]
  );

  /* Clean up wheel-zoom timers on unmount */
  useEffect(() => {
    return () => {
      if (wheelApplyTimeoutRef.current !== null) clearTimeout(wheelApplyTimeoutRef.current);
      if (wheelEndTimeoutRef.current !== null) clearTimeout(wheelEndTimeoutRef.current);
    };
  }, []);

  /* Attach wheel to document and only handle when cursor is over canvas so zoom works
   * even when overlays (cable layer, etc.) are on top, and so we don't depend on ref
   * being set when this effect first runs (Canvas mounts after AppProvider). */
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      const target = e.target as Element | null;
      if (!target) return;
      if (target.closest("[data-no-canvas-zoom]")) return;
      // Skip wheel zoom when any modal dialog is open so wheel can scroll inside modals.
      if (document.querySelector('dialog[open], [role="dialog"][aria-modal="true"]')) return;
      const el = canvasRef.current;
      if (!el) return;
      if (!el.contains(target)) return;
      const rect = el.getBoundingClientRect();
      if (
        e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom
      )
        return;
      handleWheelZoom(e);
    };
    const wheelOptions = { passive: false, capture: true } as const;
    document.addEventListener("wheel", onWheel, wheelOptions);
    return () => document.removeEventListener("wheel", onWheel, wheelOptions);
  }, [handleWheelZoom]);

  /* Pinch-to-zoom (touch) and two-finger pan */
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        onPinchStart?.();
        setIsPanning(false);
        panStartRef.current = null;
        const c = center(e.touches[0], e.touches[1]);
        pinchRef.current = {
          initialDistance: dist(e.touches[0], e.touches[1]),
          initialZoom: zoomRef.current,
          initialPan: { ...panRef.current },
          centerX: c.x,
          centerY: c.y,
          mode: "pan", // Start in pan mode; switch to pinch if distance changes significantly
          prevCenterX: c.x,
          prevCenterY: c.y,
        };
      }
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && pinchRef.current) {
        e.preventDefault();
        const d = dist(e.touches[0], e.touches[1]);
        const scale = d / pinchRef.current.initialDistance;
        const c = center(e.touches[0], e.touches[1]);

        // Detect if this is pinch-to-zoom or two-finger pan
        // If the distance ratio deviates significantly from 1.0, it's a pinch
        if (scale < PINCH_DETECTION_THRESHOLD || scale > 1 / PINCH_DETECTION_THRESHOLD) {
          // It's a pinch-to-zoom gesture
          pinchRef.current.mode = "pinch";
          const newZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, pinchRef.current.initialZoom * scale));
          zoomToward(newZoom, pinchRef.current.centerX, pinchRef.current.centerY);
        } else {
          // It's a two-finger pan gesture; move based on center point movement
          pinchRef.current.mode = "pan";
          const dx = c.x - pinchRef.current.prevCenterX;
          const dy = c.y - pinchRef.current.prevCenterY;
          setPan({
            x: panRef.current.x + dx,
            y: panRef.current.y + dy,
          });
          pinchRef.current.prevCenterX = c.x;
          pinchRef.current.prevCenterY = c.y;
        }
      }
    };
    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) pinchRef.current = null;
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
    };
  }, [zoomToward, onPinchStart]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        if (isEditableTarget(e.target)) return;
        e.preventDefault();
        setSpaceDown(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        if (isEditableTarget(e.target)) return;
        e.preventDefault();
        setSpaceDown(false);
        if (isPanning) {
          setIsPanning(false);
          panStartRef.current = null;
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isPanning]);

  useEffect(() => {
    if (!isPanning) return;
    const handlePointerMove = (e: PointerEvent) => {
      if (panStartRef.current && e.pointerId === panStartRef.current.pointerId) {
        const dx = e.clientX - panStartRef.current.mouseX;
        const dy = e.clientY - panStartRef.current.mouseY;
        setPan({
          x: panStartRef.current.panX + dx,
          y: panStartRef.current.panY + dy,
        });
      }
    };
    const handlePointerUp = (e: PointerEvent) => {
      if (panStartRef.current && e.pointerId === panStartRef.current.pointerId) {
        setIsPanning(false);
        panStartRef.current = null;
      }
    };
    window.addEventListener("pointermove", handlePointerMove, { capture: true });
    window.addEventListener("pointerup", handlePointerUp, { capture: true });
    window.addEventListener("pointercancel", handlePointerUp, { capture: true });
    return () => {
      window.removeEventListener("pointermove", handlePointerMove, { capture: true });
      window.removeEventListener("pointerup", handlePointerUp, { capture: true });
      window.removeEventListener("pointercancel", handlePointerUp, { capture: true });
    };
  }, [isPanning]);

  const handleCanvasPointerDown = useCallback(
    (e: React.PointerEvent) => {
      const onObject = (e.target as Element).closest(".canvas-object-wrapper");
      if (pauseRef.current) return;
      const startPan =
        e.button === 1 || // middle button always pans (even over objects)
        (e.button === 0 && spaceDown) || // space + left drag pans everywhere
        (!onObject && e.button === 0); // left button pans when dragging on empty canvas
      if (startPan) {
        e.preventDefault();
        setAnimating(false); /* no CSS transition during drag */
        setIsPanning(true);
        panStartRef.current = {
          mouseX: e.clientX,
          mouseY: e.clientY,
          panX: pan.x,
          panY: pan.y,
          pointerId: e.pointerId,
        };
      }
    },
    [spaceDown, pan.x, pan.y]
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
    pausePanZoom: (v: boolean) => {
      pauseRef.current = v;
      if (v) {
        setAnimating(false);
        setIsPanning(false);
        panStartRef.current = null;
        pinchRef.current = null;
      }
    },
  };
}
