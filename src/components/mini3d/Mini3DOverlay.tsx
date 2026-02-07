import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useBoard } from "../../context/BoardContext";
import { useUi } from "../../context/UiContext";
import { DEFAULT_OBJECT_COLOR } from "../../constants";
import { clamp } from "../../lib/math";
import { parseColor, rgba, shade } from "../../lib/color";
import { normalizeRotation } from "../../lib/geometry";
import { getDirectionalOffset } from "../../lib/geometry2d";
import { vec2Add, vec2Scale, type Point } from "../../lib/vector";
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

const ROTATE_DRAG_SENS = 0.006;
const ROTATE_PITCH_SENS = 0.006;
const BASE_OVERLAY_OPACITY = 0.85;
const DOUBLE_TAP_MS = 320;
const DOUBLE_TAP_DISTANCE = 24;
const OPEN_FADE_MS = 500;
const VIEW_PADDING_PX = 6;
const INITIAL_PITCH_OFFSET = 0.18; // Slightly above view by default.

/**
 * Single knob for mini-3D perspective intensity.
 * 0.0 = flatter (less foreshortening), 1.0 = strong perspective, 1.25+ = very dramatic.
 * Recommended range: 0.0..1.5.
 */
const MINI3D_PERSPECTIVE_DRAMA = 1;
const MINI3D_PERSPECTIVE_DRAMA_SAFE = clamp(MINI3D_PERSPECTIVE_DRAMA, 0, 1.5);
const MINI3D_PERSPECTIVE_SCENE_FACTOR = Math.max(0.22, 1.9 - MINI3D_PERSPECTIVE_DRAMA_SAFE * 1.35);
const MINI3D_CAMERA_DISTANCE_SCENE_FACTOR = Math.max(0.3, 1.15 - MINI3D_PERSPECTIVE_DRAMA_SAFE * 0.57);

type DragState = { pointerId: number; startX: number; startY: number; startYaw: number; startPitch: number; moved: boolean };
type OverlayPhase = "opening" | "open" | "closing";
type Mini3DOverlayProps = { onCloseComplete?: () => void };

type CssVars = CSSProperties & Record<`--${string}`, string>;
type FitTransform = { scale: number; offsetX: number; offsetY: number };

function getPointersCenter(points: readonly [Point, Point]): Point {
  return vec2Scale(vec2Add(points[0], points[1]), 0.5);
}

export function Mini3DOverlay({ onCloseComplete }: Mini3DOverlayProps) {
  const { objects } = useBoard();
  const { showMini3d } = useUi();

  const containerRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);

  const [isVisible, setIsVisible] = useState(showMini3d);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [phase, setPhase] = useState<OverlayPhase>(showMini3d ? "opening" : "closing");
  const [size, setSize] = useState({ width: 0, height: 0 });

  const showMini3dRef = useRef(showMini3d);
  const yawRef = useRef(DEFAULT_CAMERA_YAW);
  const pitchRef = useRef(INITIAL_PITCH_OFFSET);
  const rotateDragRef = useRef<DragState | null>(null);
  const activePointersRef = useRef<Map<number, Point>>(new Map());
  const baseFitRef = useRef<FitTransform | null>(null);
  const baseSizeRef = useRef<{ width: number; height: number } | null>(null);

  const prevShowMini3dRef = useRef(false);
  const openTimerRef = useRef<number | null>(null);
  const closeTimerRef = useRef<number | null>(null);

  const lastTapRef = useRef<{ time: number; x: number; y: number } | null>(null);

  const stacked = useMemo(() => computeStackedObjects(objects), [objects]);
  const scene = useMemo(() => getSceneMetrics(stacked), [stacked]);
  const convergenceTotal = useMemo(() => getConvergenceTotal(stacked.length), [stacked.length]);

  const perspective = useMemo(() => clamp(scene.maxDim * MINI3D_PERSPECTIVE_SCENE_FACTOR, 60, 900), [scene.maxDim]);
  const cameraDistance = useMemo(() => -clamp(scene.maxDim * MINI3D_CAMERA_DISTANCE_SCENE_FACTOR, 60, 500), [scene.maxDim]);

  const computeFitTransform = useCallback(
    (yaw: number, pitchOffset: number, sizeOverride?: { width: number; height: number }): FitTransform => {
      const targetSize = sizeOverride ?? size;
      const availableWidth = Math.max(1, targetSize.width - VIEW_PADDING_PX * 2);
      const availableHeight = Math.max(1, targetSize.height - VIEW_PADDING_PX * 2);
      const pitch = clamp(0.35 + pitchOffset, MIN_PITCH, MAX_PITCH);

      const halfWidth = scene.width * 0.5;
      const halfDepth = scene.depth * 0.5;
      const minY = -scene.maxZ;
      const maxY = 0;

      const convergencePad = phase === "open" ? 0 : CONVERGENCE_OFFSET_DISTANCE;
      const xValues = [-halfWidth - convergencePad, halfWidth + convergencePad];
      const yValues = [minY, maxY];
      const zValues = [-halfDepth - convergencePad, halfDepth + convergencePad];

      const yawCss = -yaw;
      const pitchCss = -pitch;
      const cosY = Math.cos(yawCss);
      const sinY = Math.sin(yawCss);
      const cosX = Math.cos(pitchCss);
      const sinX = Math.sin(pitchCss);

      const projectBounds = (scale: number) => {
        let minX = Infinity;
        let maxX = -Infinity;
        let minProjectedY = Infinity;
        let maxProjectedY = -Infinity;

        for (const x of xValues) {
          for (const y of yValues) {
            for (const z of zValues) {
              const xr = x * cosY + z * sinY;
              const zr = -x * sinY + z * cosY;
              const yr = y;

              const x2 = xr;
              const y2 = yr * cosX - zr * sinX;
              const z2 = yr * sinX + zr * cosX;

              const x3 = x2 * scale;
              const y3 = y2 * scale;
              const z3 = z2 * scale + cameraDistance;

              const denom = perspective - z3;
              if (!Number.isFinite(denom) || denom <= 1) return null;

              const factor = perspective / denom;
              const sx = x3 * factor;
              const sy = y3 * factor;

              if (sx < minX) minX = sx;
              if (sx > maxX) maxX = sx;
              if (sy < minProjectedY) minProjectedY = sy;
              if (sy > maxProjectedY) maxProjectedY = sy;
            }
          }
        }

        if (!Number.isFinite(minX) || !Number.isFinite(maxX) || !Number.isFinite(minProjectedY) || !Number.isFinite(maxProjectedY)) {
          return null;
        }

        return { minX, maxX, minY: minProjectedY, maxY: maxProjectedY };
      };

      const fits = (scale: number) => {
        const bounds = projectBounds(scale);
        if (!bounds) return false;
        const width = bounds.maxX - bounds.minX;
        const height = bounds.maxY - bounds.minY;
        return width <= availableWidth && height <= availableHeight;
      };

      let low = 0.01;
      let high = 0.12;
      while (fits(high) && high < 8) {
        low = high;
        high *= 1.45;
      }

      for (let i = 0; i < 24; i += 1) {
        const mid = (low + high) * 0.5;
        if (fits(mid)) {
          low = mid;
        } else {
          high = mid;
        }
      }

      const scale = clamp(low * 0.985, 0.01, 8);
      const finalBounds = projectBounds(scale);
      if (!finalBounds) return { scale, offsetX: 0, offsetY: 0 };

      return {
        scale,
        offsetX: -(finalBounds.minX + finalBounds.maxX) * 0.5,
        offsetY: -(finalBounds.minY + finalBounds.maxY) * 0.5,
      };
    },
    [cameraDistance, perspective, phase, scene.depth, scene.maxZ, scene.width, size.height, size.width]
  );

  const sceneFit = useMemo(() => computeFitTransform(yawRef.current, pitchRef.current), [computeFitTransform]);

  useEffect(() => {
    if (isFullscreen) return;
    if (size.width <= 0 || size.height <= 0) return;
    baseFitRef.current = sceneFit;
    baseSizeRef.current = { width: size.width, height: size.height };
  }, [isFullscreen, sceneFit, size.height, size.width]);

  const getZoomScale = useCallback(() => {
    if (!isFullscreen) return 1;
    const baseSize = baseSizeRef.current;
    if (!baseSize || baseSize.width <= 0 || baseSize.height <= 0) return 1;
    return Math.min(size.width / baseSize.width, size.height / baseSize.height);
  }, [isFullscreen, size.height, size.width]);

  const syncCameraVars = useCallback(() => {
    const world = worldRef.current;
    if (!world) return;
    const pitch = clamp(0.35 + pitchRef.current, MIN_PITCH, MAX_PITCH);
    const baseSize = isFullscreen ? baseSizeRef.current ?? undefined : undefined;
    const fit = computeFitTransform(yawRef.current, pitchRef.current, baseSize);
    const zoomScale = getZoomScale();
    world.style.setProperty("--mini3d-scale", `${fit.scale * zoomScale}`);
    world.style.setProperty("--mini3d-offset-x", `${fit.offsetX * zoomScale}px`);
    world.style.setProperty("--mini3d-offset-y", `${fit.offsetY * zoomScale}px`);
    world.style.setProperty("--mini3d-yaw", `${-yawRef.current}rad`);
    world.style.setProperty("--mini3d-pitch", `${-pitch}rad`);
  }, [computeFitTransform, getZoomScale, isFullscreen]);

  const toggleFullscreen = useCallback(() => {
    if (!isFullscreen && size.width > 0 && size.height > 0) {
      baseFitRef.current = computeFitTransform(yawRef.current, pitchRef.current);
      baseSizeRef.current = { width: size.width, height: size.height };
    }
    setIsFullscreen((value) => !value);
  }, [computeFitTransform, isFullscreen, size.height, size.width]);


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

  const stopRotateDrag = useCallback(() => {
    rotateDragRef.current = null;
    activePointersRef.current.clear();
  }, []);

  const beginRotateDrag = useCallback(
    (pointerId: number, startX: number, startY: number) => {
      rotateDragRef.current = {
        pointerId,
        startX,
        startY,
        startYaw: yawRef.current,
        startPitch: pitchRef.current,
        moved: false,
      };
    },
    []
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
    showMini3dRef.current = showMini3d;
  }, [showMini3d]);

  useEffect(() => {
    const wasShowing = prevShowMini3dRef.current;
    prevShowMini3dRef.current = showMini3d;

    if (showMini3d) {
      clearCloseTimer();
    }

    if (showMini3d && !wasShowing) {
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
      setPhase("closing");

      clearOpenTimer();
      clearCloseTimer();
      closeTimerRef.current = window.setTimeout(() => {
        if (showMini3dRef.current) {
          closeTimerRef.current = null;
          return;
        }
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
    stopRotateDrag,
  ]);

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
      stopRotateDrag();
      clearOpenTimer();
      clearCloseTimer();
    };
  }, [clearCloseTimer, clearOpenTimer, stopRotateDrag]);

  const handleRotatePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (e.button === 2) return;

      if (e.pointerType === "touch" && activePointersRef.current.size === 1) {
        const now = performance.now();
        const last = lastTapRef.current;
        if (last && now - last.time <= DOUBLE_TAP_MS) {
          const dx = e.clientX - last.x;
          const dy = e.clientY - last.y;
          if (Math.hypot(dx, dy) <= DOUBLE_TAP_DISTANCE) {
            lastTapRef.current = null;
            toggleFullscreen();
            return;
          }
        }
        lastTapRef.current = { time: now, x: e.clientX, y: e.clientY };
      }

      e.preventDefault();
      e.stopPropagation();

      let startX = e.clientX;
      let startY = e.clientY;
      if (activePointersRef.current.size === 2) {
        const pointers = Array.from(activePointersRef.current.values()) as [Point, Point];
        const center = getPointersCenter(pointers);
        startX = center.x;
        startY = center.y;
      }

      beginRotateDrag(e.pointerId, startX, startY);
      containerRef.current?.setPointerCapture(e.pointerId);
    },
    [beginRotateDrag, toggleFullscreen]
  );

  const handleRotatePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const drag = rotateDragRef.current;
      if (!drag) return;

      activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

      let currentX = e.clientX;
      let currentY = e.clientY;

      if (activePointersRef.current.size === 2) {
        e.preventDefault();
        e.stopPropagation();
        const pointers = Array.from(activePointersRef.current.values()) as [Point, Point];
        const center = getPointersCenter(pointers);
        currentX = center.x;
        currentY = center.y;
      }

      const dx = currentX - drag.startX;
      const dy = currentY - drag.startY;
      if (!drag.moved && Math.hypot(dx, dy) >= 3) {
        drag.moved = true;
      }
      yawRef.current = drag.startYaw - dx * ROTATE_DRAG_SENS;
      pitchRef.current = clamp(drag.startPitch + dy * ROTATE_PITCH_SENS, PITCH_OFFSET_MIN, PITCH_OFFSET_MAX);
      syncCameraVars();
    },
    [syncCameraVars]
  );

  const handleRotatePointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      activePointersRef.current.delete(e.pointerId);

      const drag = rotateDragRef.current;
      if (!drag) return;
      if (drag.pointerId !== e.pointerId) return;

      rotateDragRef.current = null;
      try {
        containerRef.current?.releasePointerCapture(e.pointerId);
      } catch {
        /* OK if pointer was already released */
      }
    },
    []
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

  const backdropClass = [
    "mini3d-backdrop",
    isFullscreen ? "mini3d-backdrop--fullscreen" : "",
    phase === "opening" ? "mini3d-backdrop--opening" : "",
    phase === "open" ? "mini3d-backdrop--open" : "",
    phase === "closing" ? "mini3d-backdrop--closing" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const overlayStyle: CssVars = {
    "--mini3d-overlay-opacity": `${BASE_OVERLAY_OPACITY}`,
    "--mini3d-open-fade-ms": `${OPEN_FADE_MS}ms`,
    "--mini3d-close-fade-ms": `${convergenceTotal}ms`,
    pointerEvents: showMini3d ? "auto" : "none",
  };

  const zoomScale = getZoomScale();
  const displayFit = isFullscreen && baseFitRef.current ? baseFitRef.current : sceneFit;

  const stageStyle: CssVars = {
    "--mini3d-perspective": `${perspective}px`,
  };

  const worldStyle: CssVars = {
    "--mini3d-scale": `${displayFit.scale * zoomScale}`,
    "--mini3d-offset-x": `${displayFit.offsetX * zoomScale}px`,
    "--mini3d-offset-y": `${displayFit.offsetY * zoomScale}px`,
    "--mini3d-camera-z": `${cameraDistance}px`,
    "--mini3d-yaw": `${-yawRef.current}rad`,
    "--mini3d-pitch": `${-clamp(0.35 + pitchRef.current, MIN_PITCH, MAX_PITCH)}rad`,
  };

  return (
    <>
      <div className={backdropClass} style={overlayStyle} />
      <div
        className={overlayClass}
        ref={containerRef}
        style={overlayStyle}
        aria-label="3D overlay"
        title="3D overlay"
        onDoubleClick={() => {
          toggleFullscreen();
        }}
        onPointerDown={handleRotatePointerDown}
        onPointerMove={handleRotatePointerMove}
        onPointerUp={handleRotatePointerUp}
        onPointerCancel={handleRotatePointerUp}
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
          {"Click/tap and drag to rotate. Double click/tap to toggle fullscreen."}
        </div>
      ) : null}
      </div>
    </>
  );
}












