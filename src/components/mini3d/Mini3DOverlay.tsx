import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useBoard } from "../../context/BoardContext";
import { useUi } from "../../context/UiContext";
import { DEFAULT_OBJECT_COLOR } from "../../constants";
import { clamp } from "../../lib/math";
import { parseColor, rgba, shade } from "../../lib/color";
import { normalizeRotation } from "../../lib/geometry";
import { getDirectionalOffset } from "../../lib/geometry2d";
import { resolveImageSrc } from "./mini3dAssets";
import {
  computeStackedObjects,
  DEFAULT_CAMERA_YAW,
  MIN_PITCH,
  MAX_PITCH,
  PITCH_OFFSET_MIN,
  PITCH_OFFSET_MAX,
  getSceneMetrics,
  getConvergenceTotal,
  FALLBACK_COLOR,
  PER_COMPONENT_DELAY,
  CONVERGENCE_OFFSET_DISTANCE,
} from "./mini3dMath";
import "./Mini3DOverlay.scss";

const ROTATE_SPEED_RAD = Math.PI / 5;
const ROTATE_DRAG_SENS = 0.006;
const ROTATE_PITCH_SENS = 0.006;
const BASE_OVERLAY_OPACITY = 0.85;
const DOUBLE_TAP_MS = 320;
const DOUBLE_TAP_DISTANCE = 24;
const DOUBLE_TAP_DRAG_DISTANCE = 8;
const DOUBLE_CLICK_DELAY_MS = 320;
const OPEN_FADE_MS = 500;
const VIEW_PADDING_PX = 12;

type PointerPoint = { x: number; y: number };
type DragState = { pointerId: number; startX: number; startY: number; startYaw: number; startPitch: number };
type DoubleTapState = { pointerId: number; startX: number; startY: number; moved: boolean };
type OverlayPhase = "opening" | "open" | "closing";
type Mini3DOverlayProps = { onCloseComplete?: () => void };

type CssVars = CSSProperties & Record<`--${string}`, string>;

function getPointersCenter(points: readonly [PointerPoint, PointerPoint]): PointerPoint {
  return {
    x: (points[0].x + points[1].x) * 0.5,
    y: (points[0].y + points[1].y) * 0.5,
  };
}

export function Mini3DOverlay({ onCloseComplete }: Mini3DOverlayProps) {
  const { objects } = useBoard();
  const { showMini3d } = useUi();

  const containerRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);

  const [autoRotate, setAutoRotate] = useState(false);
  const [isVisible, setIsVisible] = useState(showMini3d);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [phase, setPhase] = useState<OverlayPhase>(showMini3d ? "opening" : "closing");
  const [size, setSize] = useState({ width: 0, height: 0 });

  const yawRef = useRef(DEFAULT_CAMERA_YAW);
  const pitchRef = useRef(0);
  const rotateDragRef = useRef<DragState | null>(null);
  const activePointersRef = useRef<Map<number, PointerPoint>>(new Map());

  const autoRotateRafRef = useRef<number | null>(null);
  const autoRotateLastTimeRef = useRef<number | null>(null);

  const prevShowMini3dRef = useRef(false);
  const openTimerRef = useRef<number | null>(null);
  const closeTimerRef = useRef<number | null>(null);

  const lastTapRef = useRef<{ time: number; x: number; y: number } | null>(null);
  const doubleTapRef = useRef<DoubleTapState | null>(null);
  const suppressClickRef = useRef<number | null>(null);
  const clickTimeoutRef = useRef<number | null>(null);

  const stacked = useMemo(() => computeStackedObjects(objects), [objects]);
  const scene = useMemo(() => getSceneMetrics(stacked), [stacked]);
  const convergenceTotal = useMemo(() => getConvergenceTotal(stacked.length), [stacked.length]);

  const perspective = useMemo(() => clamp(scene.maxDim * 3.2, 260, 1200), [scene.maxDim]);
  const cameraDistance = useMemo(() => -clamp(scene.maxDim * 0.95, 170, 1100), [scene.maxDim]);

  const computeFitScale = useCallback(
    (yaw: number, pitchOffset: number) => {
      const pitch = clamp(0.35 + pitchOffset, MIN_PITCH, MAX_PITCH);
      const absCosYaw = Math.abs(Math.cos(yaw));
      const absSinYaw = Math.abs(Math.sin(yaw));

      const projectedWidth = Math.max(1, scene.width * absCosYaw + scene.depth * absSinYaw);
      const footprintDepth = scene.width * absSinYaw + scene.depth * absCosYaw;
      const projectedHeight = Math.max(1, footprintDepth * Math.sin(pitch) + scene.maxZ * Math.cos(pitch));

      const availableWidth = Math.max(1, size.width - VIEW_PADDING_PX * 2);
      const availableHeight = Math.max(1, size.height - VIEW_PADDING_PX * 2);
      const fitWithoutPerspective = Math.min(availableWidth / projectedWidth, availableHeight / projectedHeight);

      // CSS perspective shrinks content when the scene is translated away from the camera.
      const perspectiveFactor = perspective / (perspective - cameraDistance);
      const compensated = fitWithoutPerspective / Math.max(0.0001, perspectiveFactor);

      return clamp(compensated * 0.98, 0.08, 4);
    },
    [cameraDistance, perspective, scene.depth, scene.maxZ, scene.width, size.height, size.width]
  );

  const sceneScale = useMemo(() => computeFitScale(yawRef.current, pitchRef.current), [computeFitScale]);

  const syncCameraVars = useCallback(() => {
    const world = worldRef.current;
    if (!world) return;
    const pitch = clamp(0.35 + pitchRef.current, MIN_PITCH, MAX_PITCH);
    const scale = computeFitScale(yawRef.current, pitchRef.current);
    world.style.setProperty("--mini3d-scale", `${scale}`);
    world.style.setProperty("--mini3d-yaw", `${-yawRef.current}rad`);
    world.style.setProperty("--mini3d-pitch", `${-pitch}rad`);
  }, [computeFitScale]);

  const clearOpenTimer = useCallback(() => {
    if (openTimerRef.current != null) {
      window.clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
  }, []);

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current != null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const stopPendingClickTimers = useCallback(() => {
    if (suppressClickRef.current != null) {
      window.clearTimeout(suppressClickRef.current);
      suppressClickRef.current = null;
    }
    if (clickTimeoutRef.current != null) {
      window.clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
    }
  }, []);

  const stopRotateDrag = useCallback(() => {
    rotateDragRef.current = null;
    activePointersRef.current.clear();
  }, []);

  const beginRotateDrag = useCallback(
    (pointerId: number, startX: number, startY: number) => {
      setAutoRotate(false);
      rotateDragRef.current = {
        pointerId,
        startX,
        startY,
        startYaw: yawRef.current,
        startPitch: pitchRef.current,
      };
    },
    [setAutoRotate]
  );

  useEffect(() => {
    if (!isVisible) return;
    const el = containerRef.current;
    if (!el) return;

    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      setSize((prev) => {
        const next = { width: rect.width, height: rect.height };
        if (next.width === prev.width && next.height === prev.height) return prev;
        return next;
      });
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(el);
    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    syncCameraVars();
  }, [isVisible, syncCameraVars]);

  useEffect(() => {
    const wasShowing = prevShowMini3dRef.current;
    prevShowMini3dRef.current = showMini3d;

    if (showMini3d && !wasShowing) {
      clearCloseTimer();
      if (!isVisible) setIsVisible(true);
      setPhase("opening");

      clearOpenTimer();
      openTimerRef.current = window.setTimeout(() => {
        openTimerRef.current = null;
        setPhase("open");
      }, convergenceTotal);
      return;
    }

    if (!showMini3d && wasShowing && isVisible) {
      setIsFullscreen(false);
      setAutoRotate(false);
      stopRotateDrag();
      stopPendingClickTimers();
      setPhase("closing");

      clearOpenTimer();
      clearCloseTimer();
      closeTimerRef.current = window.setTimeout(() => {
        closeTimerRef.current = null;
        setIsVisible(false);
        onCloseComplete?.();
      }, convergenceTotal);
    }
  }, [
    clearCloseTimer,
    clearOpenTimer,
    convergenceTotal,
    isVisible,
    onCloseComplete,
    showMini3d,
    stopPendingClickTimers,
    stopRotateDrag,
  ]);

  useEffect(() => {
    if (!autoRotate || !showMini3d) {
      if (autoRotateRafRef.current != null) cancelAnimationFrame(autoRotateRafRef.current);
      autoRotateRafRef.current = null;
      autoRotateLastTimeRef.current = null;
      return;
    }

    const step = (time: number) => {
      if (autoRotateLastTimeRef.current == null) autoRotateLastTimeRef.current = time;
      const dt = Math.min(0.05, (time - autoRotateLastTimeRef.current) / 1000);
      autoRotateLastTimeRef.current = time;
      yawRef.current = (yawRef.current + ROTATE_SPEED_RAD * dt) % (Math.PI * 2);
      syncCameraVars();
      autoRotateRafRef.current = requestAnimationFrame(step);
    };

    autoRotateRafRef.current = requestAnimationFrame(step);

    return () => {
      if (autoRotateRafRef.current != null) cancelAnimationFrame(autoRotateRafRef.current);
      autoRotateRafRef.current = null;
      autoRotateLastTimeRef.current = null;
    };
  }, [autoRotate, showMini3d, syncCameraVars]);

  useEffect(() => {
    if (!showMini3d) return;
    const el = containerRef.current;
    if (!el) return;

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length >= 2 && rotateDragRef.current) {
        e.preventDefault();
      }
    };

    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    return () => el.removeEventListener("touchmove", handleTouchMove);
  }, [showMini3d]);

  useEffect(() => {
    return () => {
      if (autoRotateRafRef.current != null) cancelAnimationFrame(autoRotateRafRef.current);
      autoRotateRafRef.current = null;
      autoRotateLastTimeRef.current = null;
      stopRotateDrag();
      stopPendingClickTimers();
      clearOpenTimer();
      clearCloseTimer();
    };
  }, [clearCloseTimer, clearOpenTimer, stopPendingClickTimers, stopRotateDrag]);

  const handleRotatePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (e.button === 1) {
        e.preventDefault();
        e.stopPropagation();
        beginRotateDrag(e.pointerId, e.clientX, e.clientY);
        containerRef.current?.setPointerCapture(e.pointerId);
        return;
      }

      if (e.pointerType === "touch") {
        e.preventDefault();
        e.stopPropagation();
      }

      if (e.pointerType === "touch" && activePointersRef.current.size === 1) {
        const now = performance.now();
        const last = lastTapRef.current;
        if (last && now - last.time <= DOUBLE_TAP_MS) {
          const dx = e.clientX - last.x;
          const dy = e.clientY - last.y;
          if (Math.hypot(dx, dy) <= DOUBLE_TAP_DISTANCE) {
            doubleTapRef.current = {
              pointerId: e.pointerId,
              startX: e.clientX,
              startY: e.clientY,
              moved: false,
            };
            lastTapRef.current = null;
            suppressClickRef.current = window.setTimeout(() => {
              suppressClickRef.current = null;
            }, DOUBLE_TAP_MS);
            return;
          }
        }
        lastTapRef.current = { time: now, x: e.clientX, y: e.clientY };
      }

      if (e.pointerType === "touch" && activePointersRef.current.size === 2) {
        const pointers = Array.from(activePointersRef.current.values()) as [PointerPoint, PointerPoint];
        const center = getPointersCenter(pointers);
        beginRotateDrag(e.pointerId, center.x, center.y);
      }
    },
    [beginRotateDrag]
  );

  const handleRotatePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const doubleTap = doubleTapRef.current;
      if (doubleTap && doubleTap.pointerId === e.pointerId) {
        const dx = e.clientX - doubleTap.startX;
        const dy = e.clientY - doubleTap.startY;
        if (!doubleTap.moved && Math.hypot(dx, dy) >= DOUBLE_TAP_DRAG_DISTANCE) {
          doubleTap.moved = true;
          beginRotateDrag(e.pointerId, doubleTap.startX, doubleTap.startY);
        }
      }

      const drag = rotateDragRef.current;
      if (!drag) return;

      activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

      let currentX = e.clientX;
      let currentY = e.clientY;

      if (activePointersRef.current.size === 2) {
        e.preventDefault();
        e.stopPropagation();
        const pointers = Array.from(activePointersRef.current.values()) as [PointerPoint, PointerPoint];
        const center = getPointersCenter(pointers);
        currentX = center.x;
        currentY = center.y;
      }

      const dx = currentX - drag.startX;
      const dy = currentY - drag.startY;
      yawRef.current = drag.startYaw - dx * ROTATE_DRAG_SENS;
      pitchRef.current = clamp(drag.startPitch + dy * ROTATE_PITCH_SENS, PITCH_OFFSET_MIN, PITCH_OFFSET_MAX);
      syncCameraVars();
    },
    [beginRotateDrag, syncCameraVars]
  );

  const handleRotatePointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      activePointersRef.current.delete(e.pointerId);

      const doubleTap = doubleTapRef.current;
      if (doubleTap && doubleTap.pointerId === e.pointerId) {
        doubleTapRef.current = null;
        if (!doubleTap.moved) {
          if (clickTimeoutRef.current != null) {
            window.clearTimeout(clickTimeoutRef.current);
            clickTimeoutRef.current = null;
          }
          setIsFullscreen((value) => !value);
        }
      }

      const drag = rotateDragRef.current;
      if (!drag) return;

      const isMiddleMouseDrag = e.button === 1;
      const isTouchDragEndedByPointerCount = e.pointerType === "touch" && activePointersRef.current.size < 2;

      if (isMiddleMouseDrag || isTouchDragEndedByPointerCount) {
        rotateDragRef.current = null;
        try {
          containerRef.current?.releasePointerCapture(e.pointerId);
        } catch {
          /* OK if pointer was already released */
        }
      }
    },
    [setIsFullscreen]
  );

  if (!isVisible) return null;

  const overlayClass = [
    "mini3d-overlay",
    isFullscreen ? "mini3d-overlay--fullscreen" : "",
    phase === "opening" ? "mini3d-overlay--opening" : "",
    phase === "open" ? "mini3d-overlay--open" : "",
    phase === "closing" ? "mini3d-overlay--closing" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const overlayStyle: CssVars = {
    "--mini3d-overlay-opacity": `${BASE_OVERLAY_OPACITY}`,
    "--mini3d-open-fade-ms": `${OPEN_FADE_MS}ms`,
    "--mini3d-close-fade-ms": `${convergenceTotal}ms`,
    pointerEvents: showMini3d ? "auto" : "none",
  };

  const stageStyle: CssVars = {
    "--mini3d-perspective": `${perspective}px`,
  };

  const worldStyle: CssVars = {
    "--mini3d-scale": `${sceneScale}`,
    "--mini3d-camera-z": `${cameraDistance}px`,
    "--mini3d-yaw": `${-yawRef.current}rad`,
    "--mini3d-pitch": `${-clamp(0.35 + pitchRef.current, MIN_PITCH, MAX_PITCH)}rad`,
  };

  return (
    <div
      className={overlayClass}
      ref={containerRef}
      style={overlayStyle}
      role="button"
      tabIndex={0}
      aria-pressed={autoRotate}
      aria-label="Toggle 3D rotation"
      title={autoRotate ? "Stop rotation" : "Start rotation"}
      onClick={() => {
        if (suppressClickRef.current != null) {
          window.clearTimeout(suppressClickRef.current);
          suppressClickRef.current = null;
          return;
        }
        if (clickTimeoutRef.current != null) {
          window.clearTimeout(clickTimeoutRef.current);
        }
        clickTimeoutRef.current = window.setTimeout(() => {
          clickTimeoutRef.current = null;
          setAutoRotate((value) => !value);
        }, DOUBLE_CLICK_DELAY_MS);
      }}
      onDoubleClick={() => {
        if (clickTimeoutRef.current != null) {
          window.clearTimeout(clickTimeoutRef.current);
          clickTimeoutRef.current = null;
        }
        setIsFullscreen((value) => !value);
      }}
      onPointerDown={handleRotatePointerDown}
      onPointerMove={handleRotatePointerMove}
      onPointerUp={handleRotatePointerUp}
      onPointerCancel={handleRotatePointerUp}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setAutoRotate((value) => !value);
        }
      }}
    >
      <div className="mini3d-stage" style={stageStyle}>
        <div className="mini3d-world" ref={worldRef} style={worldStyle}>
          {stacked.map((item, index) => {
            const color = parseColor(item.obj.color ?? DEFAULT_OBJECT_COLOR) ?? FALLBACK_COLOR;
            const topColor = rgba(shade(color, 1.05), 0.96);
            const sideFront = rgba(shade(color, 0.84), 0.94);
            const sideBack = rgba(shade(color, 0.58), 0.92);
            const sideRight = rgba(shade(color, 0.72), 0.93);
            const sideLeft = rgba(shade(color, 0.64), 0.93);
            const bottomColor = rgba(shade(color, 0.42), 0.88);

            const centerX = item.obj.pos.x + item.width / 2 - scene.center.x;
            const centerZ = item.obj.pos.y + item.depth / 2 - scene.center.y;
            const renderHeight = Math.max(1, item.height);
            const centerY = -(item.baseZ + renderHeight / 2);
            const rotation = normalizeRotation(item.obj.rotation ?? 0);

            const deltaX = item.obj.pos.x + item.width / 2 - scene.center.x;
            const deltaY = item.obj.pos.y + item.depth / 2 - scene.center.y;
            const offset = getDirectionalOffset(deltaX, deltaY, CONVERGENCE_OFFSET_DISTANCE);

            const shiftClass =
              phase === "opening"
                ? "mini3d-item-shift mini3d-item-shift--opening"
                : phase === "closing"
                  ? "mini3d-item-shift mini3d-item-shift--closing"
                  : "mini3d-item-shift";

            const shiftStyle: CssVars = {
              "--mini3d-delay-ms": `${index * PER_COMPONENT_DELAY}ms`,
              "--mini3d-conv-x": `${offset.offsetX}`,
              "--mini3d-conv-z": `${offset.offsetY}`,
            };

            const boxStyle: CssVars = {
              "--mini3d-width": `${item.width}px`,
              "--mini3d-depth": `${item.depth}px`,
              "--mini3d-height": `${renderHeight}px`,
              "--mini3d-top-color": topColor,
              "--mini3d-front-color": sideFront,
              "--mini3d-back-color": sideBack,
              "--mini3d-right-color": sideRight,
              "--mini3d-left-color": sideLeft,
              "--mini3d-bottom-color": bottomColor,
              "--mini3d-top-image": item.obj.image ? `url("${resolveImageSrc(item.obj.image)}")` : "none",
              transform: `translate3d(${centerX}px, ${centerY}px, ${centerZ}px) rotateY(${rotation}deg)`,
            };

            return (
              <div key={item.obj.id} className={shiftClass} style={shiftStyle}>
                <div className="mini3d-box" style={boxStyle}>
                  <div className="mini3d-face mini3d-face--front" />
                  <div className="mini3d-face mini3d-face--back" />
                  <div className="mini3d-face mini3d-face--right" />
                  <div className="mini3d-face mini3d-face--left" />
                  <div className="mini3d-face mini3d-face--top" />
                  <div className="mini3d-face mini3d-face--bottom" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showMini3d ? (
        <div className="mini3d-instruction">
          Middle button or double-tap drag to rotate. Click/tap for auto-rotation. Double click/tap to toggle
          fullscreen.
        </div>
      ) : null}
    </div>
  );
}








