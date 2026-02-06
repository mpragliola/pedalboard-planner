import { useCallback, useEffect, useRef, useState } from "react";
import { useBoard } from "../../context/BoardContext";
import { useUi } from "../../context/UiContext";
import { clamp } from "../../lib/math";
import { shade, rgba } from "../../lib/color";
import { drawQuad, drawTexturedQuad } from "../../lib/canvas2d";
import {
  getTextureImage,
  computeStackedObjects,
  DEFAULT_CAMERA_YAW,
  PITCH_OFFSET_MIN,
  PITCH_OFFSET_MAX,
  type ImageCacheEntry,
  type ZAnimState,
  type StackedObject,
} from "./mini3dMath";
import {
  applyConvergence,
  buildFaces,
  computeCanvasTransform,
  getConvergenceTotal,
  getFacesBounds,
  prepareCanvas,
  sortFacesByDepth,
  type Size,
} from "./mini3dRender";
import "./Mini3DOverlay.scss";

// Tuning constants for interaction and animation.
const ROTATE_SPEED_RAD = Math.PI / 5;
const ROTATE_DRAG_SENS = 0.006;
const ROTATE_PITCH_SENS = 0.006;
const Z_ANIM_SPEED = 30;
const Z_ANIM_EPS = 0.05;
const FADE_IN_DURATION = 500;
const BASE_OVERLAY_OPACITY = 0.85;
const DOUBLE_TAP_MS = 320;
const DOUBLE_TAP_DISTANCE = 24;
const DOUBLE_CLICK_DELAY_MS = 320;

type PointerPoint = { x: number; y: number };
type DragState = { pointerId: number; startX: number; startY: number; startYaw: number; startPitch: number };
type Mini3DOverlayProps = { onCloseComplete?: () => void };

/**
 * Mini3DOverlay renders a lightweight 3D projection of board objects on a canvas.
 * Rendering is manual (no WebGL): objects are treated as boxes, projected, then
 * drawn back-to-front.
 *
 * Interaction:
 * - Middle mouse drag or two-finger drag rotates the camera.
 * - Click toggles auto-rotation (also accessible via keyboard).
 * - Double click toggles fullscreen view.
 *
 * Animations:
 * - Open/close converges/diverges objects toward scene center.
 * - Z stacking animates smoothly via exponential smoothing.
 */
export function Mini3DOverlay({ onCloseComplete }: Mini3DOverlayProps) {
  const { objects } = useBoard();
  const { showMini3d } = useUi();

  // DOM refs.
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // React state for UI toggles and mount visibility.
  const [autoRotate, setAutoRotate] = useState(false);
  const [isVisible, setIsVisible] = useState(showMini3d);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Mutable refs for animation state and transient values.
  const yawRef = useRef(DEFAULT_CAMERA_YAW);
  const pitchRef = useRef(0);
  const rotateDragRef = useRef<DragState | null>(null);
  const activePointersRef = useRef<Map<number, PointerPoint>>(new Map());
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  const objectsRef = useRef(objects);
  const sizeRef = useRef<Size>({ width: 0, height: 0 });

  const imageCacheRef = useRef<Map<string, ImageCacheEntry>>(new Map());
  const zAnimRef = useRef<Map<string, ZAnimState>>(new Map());
  const autoRotateRef = useRef(autoRotate);

  // Opacity & open/close animation tracking.
  const openTimeRef = useRef<number | null>(null);
  const closeTimeRef = useRef<number | null>(null);
  const overlayOpacityRef = useRef(showMini3d ? BASE_OVERLAY_OPACITY : 0);
  const openOpacityRef = useRef(showMini3d ? BASE_OVERLAY_OPACITY : 0);
  const closeOpacityRef = useRef(showMini3d ? BASE_OVERLAY_OPACITY : 0);

  // Avoid re-rendering just to schedule a draw.
  const scheduleRenderRef = useRef<() => void>(() => {});
  const lastTapRef = useRef<{ time: number; x: number; y: number } | null>(null);
  const suppressClickRef = useRef<number | null>(null);
  const clickTimeoutRef = useRef<number | null>(null);

  const toggleAutoRotate = useCallback(() => {
    setAutoRotate((value) => !value);
  }, [setAutoRotate]);

  const notifyImageLoaded = useCallback(() => {
    scheduleRenderRef.current();
  }, []);

  const setOverlayOpacity = useCallback((value: number) => {
    const next = clamp(value, 0, 1);
    overlayOpacityRef.current = next;
    // Mutate the DOM style directly so opacity updates don't re-render React.
    const el = containerRef.current;
    if (el) {
      el.style.opacity = `${next}`;
    }
  }, []);

  const syncZTargets = useCallback((stacked: StackedObject[]): boolean => {
    const map = zAnimRef.current;
    const seen = new Set<string>();
    let active = false;
    // Keep per-object Z animation state in sync with latest stacked targets.
    for (const item of stacked) {
      const id = item.obj.id;
      seen.add(id);
      const target = item.baseZ;
      const entry = map.get(id);
      if (!entry) {
        map.set(id, { current: target, target });
        continue;
      }
      if (Math.abs(entry.target - target) > Z_ANIM_EPS) {
        entry.target = target;
      }
      if (Math.abs(entry.current - entry.target) > Z_ANIM_EPS) active = true;
    }
    for (const [id] of map) {
      if (!seen.has(id)) map.delete(id);
    }
    return active;
  }, []);

  const updateZAnimation = useCallback((dt: number): boolean => {
    const map = zAnimRef.current;
    if (map.size === 0) return false;
    // Exponential smoothing to converge current Z toward target Z.
    const alpha = 1 - Math.exp(-Z_ANIM_SPEED * dt);
    let active = false;
    for (const entry of map.values()) {
      const diff = entry.target - entry.current;
      if (Math.abs(diff) <= Z_ANIM_EPS) {
        entry.current = entry.target;
        continue;
      }
      entry.current += diff * alpha;
      if (Math.abs(entry.target - entry.current) > Z_ANIM_EPS) active = true;
    }
    return active;
  }, []);

  const getAnimatedBaseZ = useCallback((id: string, fallback: number): number => {
    const entry = zAnimRef.current.get(id);
    return entry ? entry.current : fallback;
  }, []);

  const drawScene = useCallback(
    (yaw: number, pitchOffset: number, stackedForRender: StackedObject[], currentSize: Size) => {
      // Allow draw during closing animation even if the UI flag is off.
      if (!showMini3d && !closeTimeRef.current) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      if (currentSize.width <= 0 || currentSize.height <= 0) return;

      const dpr = window.devicePixelRatio || 1;
      const ctx = prepareCanvas(canvas, currentSize, dpr);
      if (!ctx) return;
      if (stackedForRender.length === 0) return;

      const stackedAnimated = stackedForRender.map((item) => ({
        ...item,
        baseZ: getAnimatedBaseZ(item.obj.id, item.baseZ),
      }));
      const faces = buildFaces(stackedAnimated, yaw, pitchOffset);
      if (faces.length === 0) return;
      sortFacesByDepth(faces);

      const bounds = getFacesBounds(faces);
      if (!bounds) return;
      const transform = computeCanvasTransform(bounds, currentSize);
      if (!transform) return;

      ctx.setTransform(
        transform.scale * dpr,
        0,
        0,
        transform.scale * dpr,
        transform.offsetX * dpr,
        transform.offsetY * dpr
      );
      ctx.lineJoin = "round";
      ctx.lineWidth = 1 / transform.scale;

      const stroke = "rgba(0, 0, 0, 0.25)";
      for (const face of faces) {
        let fill: string | CanvasPattern = rgba(shade(face.color, face.shade), 0.9);
        if (face.kind === "top") {
          // Top faces can be textured; fall back to shaded color if not ready.
          if (face.textureSrc) {
            const image = getTextureImage(face.textureSrc, imageCacheRef.current, notifyImageLoaded);
            if (image) {
              drawTexturedQuad(ctx, image, face.points, face.uv, stroke, 0.92);
              continue;
            } else {
              fill = rgba(shade(face.color, 1.02), 0.92);
            }
          } else {
            fill = rgba(shade(face.color, 1.02), 0.92);
          }
        } else if (face.kind === "bottom") {
          fill = rgba(shade(face.color, 0.55), 0.9);
        }
        drawQuad(ctx, face.points, fill, stroke);
      }
    },
    [getAnimatedBaseZ, notifyImageLoaded, showMini3d]
  );

  const step = useCallback(
    (time: number) => {
      const isClosing = closeTimeRef.current != null;
      if (!showMini3d && !isClosing) {
        rafRef.current = null;
        lastTimeRef.current = null;
        return;
      }

      // Clamp dt to avoid large jumps when returning from background.
      if (lastTimeRef.current == null) lastTimeRef.current = time;
      const dt = Math.min(0.05, (time - lastTimeRef.current) / 1000);
      lastTimeRef.current = time;

      let keepRunning = false;

      if (autoRotateRef.current && showMini3d) {
        yawRef.current = (yawRef.current + ROTATE_SPEED_RAD * dt) % (Math.PI * 2);
        keepRunning = true;
      }

      // Update stacked Z positions even when only animating opacity/convergence.
      const stackedTargets = computeStackedObjects(objectsRef.current);
      syncZTargets(stackedTargets);
      const zActive = updateZAnimation(dt);
      if (zActive) keepRunning = true;

      const convergenceTotal = getConvergenceTotal(stackedTargets.length);
      const openStart = openTimeRef.current;
      const closeStart = closeTimeRef.current;
      const opening = openStart != null && time - openStart < convergenceTotal;
      const closing = closeStart != null && time - closeStart < convergenceTotal;
      const animationActive = opening || closing;

      // Drive overlay opacity separately from React render cycle.
      if (opening && openStart != null) {
        const t = clamp((time - openStart) / FADE_IN_DURATION, 0, 1);
        const startOpacity = openOpacityRef.current;
        setOverlayOpacity(startOpacity + (BASE_OVERLAY_OPACITY - startOpacity) * t);
      } else if (closing && closeStart != null) {
        const t = clamp((time - closeStart) / convergenceTotal, 0, 1);
        const startOpacity = closeOpacityRef.current;
        setOverlayOpacity(startOpacity * (1 - t));
      } else if (showMini3d) {
        setOverlayOpacity(BASE_OVERLAY_OPACITY);
      }

      let stackedForRender = stackedTargets;
      if (animationActive && stackedTargets.length > 0) {
        const startTime = opening ? openStart ?? 0 : closeStart ?? 0;
        stackedForRender = applyConvergence(time, stackedTargets, startTime, opening);
      }

      drawScene(yawRef.current, pitchRef.current, stackedForRender, sizeRef.current);

      if (openStart != null && time - openStart >= convergenceTotal) {
        openTimeRef.current = null;
      }
      if (closeStart != null && time - closeStart >= convergenceTotal) {
        closeTimeRef.current = null;
        setOverlayOpacity(0);
        if (!showMini3d) {
          setIsVisible(false);
          onCloseComplete?.();
        }
      }

      if (animationActive) keepRunning = true;

      if (keepRunning) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        rafRef.current = null;
        lastTimeRef.current = null;
      }
    },
    [drawScene, onCloseComplete, setOverlayOpacity, showMini3d, syncZTargets, updateZAnimation]
  );

  const requestRender = useCallback(() => {
    // Allow render scheduling during close animation.
    if (!showMini3d && !closeTimeRef.current) return;
    if (rafRef.current != null) return;
    lastTimeRef.current = null;
    rafRef.current = requestAnimationFrame(step);
  }, [showMini3d, step]);

  scheduleRenderRef.current = requestRender;

  useEffect(() => {
    if (!isVisible) return;
    const el = containerRef.current;
    if (!el) return;
    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      const next = { width: rect.width, height: rect.height };
      const prev = sizeRef.current;
      if (next.width !== prev.width || next.height !== prev.height) {
        sizeRef.current = next;
        requestRender();
      }
    };
    // Resize observer keeps the canvas in sync with layout changes.
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(el);
    return () => observer.disconnect();
  }, [isVisible, requestRender]);

  useEffect(() => {
    objectsRef.current = objects;
    // Trigger a render any time object data changes.
    requestRender();
  }, [objects, requestRender]);

  useEffect(() => {
    autoRotateRef.current = autoRotate;
    if (showMini3d && autoRotate) requestRender();
  }, [autoRotate, requestRender, showMini3d]);

  useEffect(() => {
    if (showMini3d) {
      // Opening sequence: mount if needed, fade in, converge objects.
      if (!isVisible) {
        setIsVisible(true);
        openOpacityRef.current = 0;
        setOverlayOpacity(0);
      } else {
        openOpacityRef.current = overlayOpacityRef.current;
      }
      openTimeRef.current = performance.now();
      closeTimeRef.current = null;
      requestRender();
      return;
    }

    if (isFullscreen) setIsFullscreen(false);

    if (isVisible && closeTimeRef.current == null) {
      // Closing sequence: keep mounted until the animation completes.
      closeOpacityRef.current = overlayOpacityRef.current;
      closeTimeRef.current = performance.now();
      openTimeRef.current = null;
      rotateDragRef.current = null;
      activePointersRef.current.clear();
      requestRender();
    }
  }, [isFullscreen, isVisible, requestRender, setOverlayOpacity, showMini3d]);

  useEffect(() => {
    if (isVisible) requestRender();
  }, [isFullscreen, isVisible, requestRender]);

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

  const handleRotatePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      // Track pointers for touch + mouse drag to rotate.
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
            beginRotateDrag(e.pointerId, e.clientX, e.clientY);
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
        // Two-finger drag rotates around the pinch center.
        const pointers = Array.from(activePointersRef.current.values());
        const centerX = (pointers[0].x + pointers[1].x) / 2;
        const centerY = (pointers[0].y + pointers[1].y) / 2;
        beginRotateDrag(e.pointerId, centerX, centerY);
      }
    },
    [beginRotateDrag]
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
        const pointers = Array.from(activePointersRef.current.values());
        currentX = (pointers[0].x + pointers[1].x) / 2;
        currentY = (pointers[0].y + pointers[1].y) / 2;
      }

      // Apply yaw/pitch changes based on pointer deltas.
      const dx = currentX - drag.startX;
      const dy = currentY - drag.startY;
      yawRef.current = drag.startYaw + dx * ROTATE_DRAG_SENS;
      pitchRef.current = clamp(drag.startPitch + dy * ROTATE_PITCH_SENS, PITCH_OFFSET_MIN, PITCH_OFFSET_MAX);
      requestRender();
    },
    [requestRender]
  );

  const handleRotatePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    activePointersRef.current.delete(e.pointerId);

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
  }, []);

  useEffect(() => {
    if (!showMini3d) return;
    const el = containerRef.current;
    if (!el) return;

    const handleTouchMove = (e: TouchEvent) => {
      // Prevent page scroll while rotating with two fingers.
      if (e.touches.length >= 2 && rotateDragRef.current) {
        e.preventDefault();
      }
    };

    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    return () => el.removeEventListener("touchmove", handleTouchMove);
  }, [showMini3d]);

  useEffect(() => {
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTimeRef.current = null;
      rotateDragRef.current = null;
      activePointersRef.current.clear();
      if (suppressClickRef.current != null) {
        window.clearTimeout(suppressClickRef.current);
        suppressClickRef.current = null;
      }
      if (clickTimeoutRef.current != null) {
        window.clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = null;
      }
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`mini3d-overlay${isFullscreen ? " mini3d-overlay--fullscreen" : ""}`}
      ref={containerRef}
      style={{ opacity: overlayOpacityRef.current, pointerEvents: showMini3d ? "auto" : "none" }}
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
          toggleAutoRotate();
        }, DOUBLE_CLICK_DELAY_MS);
      }}
      onDoubleClick={() => {
        if (clickTimeoutRef.current != null) {
          window.clearTimeout(clickTimeoutRef.current);
          clickTimeoutRef.current = null;
        }
        setIsFullscreen((value) => !value);
        requestRender();
      }}
      onPointerDown={handleRotatePointerDown}
      onPointerMove={handleRotatePointerMove}
      onPointerUp={handleRotatePointerUp}
      onPointerCancel={handleRotatePointerUp}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggleAutoRotate();
        }
      }}
    >
      <canvas className="mini3d-canvas" ref={canvasRef} />
      {showMini3d ? (
        <div className="mini3d-instruction">
          Middle button (or double tap) and drag to rotate. Click for auto-rotation. Double click to toggle fullscreen.
        </div>
      ) : null}
    </div>
  );
}
