import { useCallback, useEffect, useRef, useState } from "react";
import { useBoard } from "../../context/BoardContext";
import { useUi } from "../../context/UiContext";
import { DEFAULT_OBJECT_COLOR } from "../../constants";
import { normalizeRotation } from "../../lib/geometry";
import { clamp, easeOutCubic } from "../../lib/math";
import { parseColor, shade, rgba } from "../../lib/color";
import { drawQuad, drawTexturedQuad } from "../../lib/canvas2d";
import { getDirectionalOffset } from "../../lib/geometry2d";
import {
  vec3Dot,
  vec3Normalize,
  createCamera,
  projectPerspective,
  faceDepth,
  depthForPoint,
  faceNormal,
  isFaceVisible,
} from "../../lib/geometry3d";
import type { Vec3 } from "../../lib/vector";
import {
  getTextureImage,
  resolveImageSrc,
  computeStackedObjects,
  getSceneMetrics,
  FALLBACK_COLOR,
  DEFAULT_CAMERA_YAW,
  MIN_PITCH,
  MAX_PITCH,
  PITCH_OFFSET_MIN,
  PITCH_OFFSET_MAX,
  type ImageCacheEntry,
  type ZAnimState,
  type Face,
  type StackedObject,
} from "./mini3dMath";
import "./Mini3DOverlay.scss";

// Mini 3D canvas overlay: projection, draw loop, and pointer-based rotation.
const ROTATE_SPEED_RAD = Math.PI / 5;
const ROTATE_DRAG_SENS = 0.006;
const ROTATE_PITCH_SENS = 0.006;
const Z_ANIM_SPEED = 30;
const Z_ANIM_EPS = 0.05;
const CANVAS_PADDING = 12;
const FACE_SORT_EPS = 1e-4;
const CONVERGENCE_DURATION = 600;
const PER_COMPONENT_DELAY = 40;
const FADE_IN_DURATION = 500;
const OFFSET_DISTANCE = 80;
const BASE_OVERLAY_OPACITY = 0.85;
const DOUBLE_TAP_MS = 320;
const DOUBLE_TAP_DISTANCE = 24;

type RenderFace = Face & { order: number };

function buildFaces(stacked: StackedObject[], yaw: number, pitchOffset: number): RenderFace[] {
  // Convert stacked objects into renderable faces for the current camera angle.
  const metrics = getSceneMetrics(stacked);
  const pitch = clamp(metrics.basePitch + pitchOffset, MIN_PITCH, MAX_PITCH);
  const camera = createCamera(metrics.center, metrics.radius, yaw, pitch);
  const lightDir = vec3Normalize({ x: -0.4, y: -0.6, z: 1 });
  const faces: RenderFace[] = [];
  let order = 0;

  for (const data of stacked) {
    const { obj, width, depth, height, baseZ } = data;
    const rotation = (normalizeRotation(obj.rotation ?? 0) * Math.PI) / 180;
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);
    const cx = obj.x + width / 2;
    const cy = obj.y + depth / 2;
    const depthFor = (p: Vec3) => depthForPoint(p, camera);
    const local = [
      { x: -width / 2, y: -depth / 2 },
      { x: width / 2, y: -depth / 2 },
      { x: width / 2, y: depth / 2 },
      { x: -width / 2, y: depth / 2 },
    ];
    const baseWorld = local.map((p) => ({
      x: cx + p.x * cos - p.y * sin,
      y: cy + p.x * sin + p.y * cos,
      z: baseZ,
    }));
    const topWorld = baseWorld.map((p) => ({ x: p.x, y: p.y, z: baseZ + height }));
    const baseProj = baseWorld.map((p) => projectPerspective(p, camera));
    const topProj = topWorld.map((p) => projectPerspective(p, camera));
    const topDepths = topWorld.map(depthFor);
    const color = parseColor(obj.color ?? DEFAULT_OBJECT_COLOR) ?? FALLBACK_COLOR;
    const textureSrc = obj.image ? resolveImageSrc(obj.image) : null;
    const topUv = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 0, y: 1 },
    ];

    const baseDepths = baseWorld.map(depthFor);
    const topNormal = faceNormal(topWorld[0], topWorld[1], topWorld[2]);
    if (isFaceVisible(topWorld, topNormal, camera)) {
      faces.push({
        points: topProj,
        depth: faceDepth(topWorld, camera),
        depths: topDepths,
        maxDepth: Math.max(...topDepths),
        kind: "top",
        color,
        shade: 1,
        textureSrc,
        uv: topUv,
        order: order++,
      });
    }
    const bottomNormal = faceNormal(baseWorld[2], baseWorld[1], baseWorld[0]);
    if (isFaceVisible(baseWorld, bottomNormal, camera)) {
      faces.push({
        points: baseProj,
        depth: faceDepth(baseWorld, camera),
        depths: baseDepths,
        maxDepth: Math.max(...baseDepths),
        kind: "bottom",
        color,
        shade: 0.6,
        order: order++,
      });
    }

    for (let i = 0; i < 4; i += 1) {
      const i2 = (i + 1) % 4;
      const world = [baseWorld[i], baseWorld[i2], topWorld[i2], topWorld[i]];
      const proj = [baseProj[i], baseProj[i2], topProj[i2], topProj[i]];
      const normal = faceNormal(world[0], world[1], world[2]);
      if (!isFaceVisible(world, normal, camera)) continue;
      const lit = Math.max(0, vec3Dot(normal, lightDir));
      const shadeValue = 0.5 + 0.5 * lit;
      const sideDepths = world.map(depthFor);
      faces.push({
        points: proj,
        depth: faceDepth(world, camera),
        depths: sideDepths,
        maxDepth: Math.max(...sideDepths),
        kind: "side",
        color,
        shade: shadeValue,
        order: order++,
      });
    }
  }
  return faces;
}

/**
 * Mini3DOverlay component renders a 3D projection of the board's objects onto 
 * a canvas overlay.
 * It computes a simple 3D representation of each object as a box, applies a 
 * perspective projection, and draws the visible faces in back-to-front order. 
 * The overlay supports pointer-based rotation and an auto-rotate mode. 
 * It also includes opening and closing animations that converge/diverge
 * the objects toward/from the scene center while fading the overlay in/out. 
 */
export function Mini3DOverlay() {
  const { objects } = useBoard();
  const { showMini3d } = useUi();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [autoRotate, setAutoRotate] = useState(false);
  const [isVisible, setIsVisible] = useState(showMini3d);
  const yawRef = useRef(DEFAULT_CAMERA_YAW);
  const pitchRef = useRef(0);
  const rotateDragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    startYaw: number;
    startPitch: number;
  } | null>(null);
  const activePointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const objectsRef = useRef(objects);
  const sizeRef = useRef({ width: 0, height: 0 });
  const imageCacheRef = useRef<Map<string, ImageCacheEntry>>(new Map());
  const zAnimRef = useRef<Map<string, ZAnimState>>(new Map());
  const autoRotateRef = useRef(autoRotate);
  // Track open/close animation timings and current opacity outside React state.
  const openTimeRef = useRef<number | null>(null);
  const closeTimeRef = useRef<number | null>(null);
  const overlayOpacityRef = useRef(showMini3d ? BASE_OVERLAY_OPACITY : 0);
  const openOpacityRef = useRef(showMini3d ? BASE_OVERLAY_OPACITY : 0);
  const closeOpacityRef = useRef(showMini3d ? BASE_OVERLAY_OPACITY : 0);
  const scheduleRenderRef = useRef<() => void>(() => {});
  const lastTapRef = useRef<{ time: number; x: number; y: number } | null>(null);
  const suppressClickRef = useRef<number | null>(null);
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
    (yaw: number, pitchOffset: number, stackedForRender: StackedObject[], currentSize: { width: number; height: number }) => {
      // Allow draw during closing animation even if the UI flag is off.
      if (!showMini3d && !closeTimeRef.current) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const { width, height } = currentSize;
      if (width <= 0 || height <= 0) return;
      const dpr = window.devicePixelRatio || 1;
      const targetW = Math.max(1, Math.floor(width * dpr));
      const targetH = Math.max(1, Math.floor(height * dpr));
      if (canvas.width !== targetW) canvas.width = targetW;
      if (canvas.height !== targetH) canvas.height = targetH;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (stackedForRender.length === 0) return;

      const stackedAnimated = stackedForRender.map((item) => ({
        ...item,
        baseZ: getAnimatedBaseZ(item.obj.id, item.baseZ),
      }));
      const faces = buildFaces(stackedAnimated, yaw, pitchOffset);
      if (faces.length === 0) return;
      // Stable depth sort to reduce flicker when faces are nearly co-planar.
      faces.sort((a, b) => {
        const byMax = b.maxDepth - a.maxDepth;
        if (Math.abs(byMax) > FACE_SORT_EPS) return byMax;
        const byDepth = b.depth - a.depth;
        if (Math.abs(byDepth) > FACE_SORT_EPS) return byDepth;
        return a.order - b.order;
      });

      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;
      for (const face of faces) {
        for (const p of face.points) {
          minX = Math.min(minX, p.x);
          minY = Math.min(minY, p.y);
          maxX = Math.max(maxX, p.x);
          maxY = Math.max(maxY, p.y);
        }
      }
      const contentW = maxX - minX;
      const contentH = maxY - minY;
      if (contentW <= 0 || contentH <= 0) return;
      const scale = Math.min(
        (width - CANVAS_PADDING * 2) / contentW,
        (height - CANVAS_PADDING * 2) / contentH
      );
      if (!Number.isFinite(scale) || scale <= 0) return;
      const offsetX =
        CANVAS_PADDING + (width - CANVAS_PADDING * 2 - contentW * scale) / 2 - minX * scale;
      const offsetY =
        CANVAS_PADDING + (height - CANVAS_PADDING * 2 - contentH * scale) / 2 - minY * scale;

      ctx.setTransform(scale * dpr, 0, 0, scale * dpr, offsetX * dpr, offsetY * dpr);
      ctx.lineJoin = "round";
      ctx.lineWidth = 1 / scale;

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

      const totalDelay = Math.max(0, stackedTargets.length - 1) * PER_COMPONENT_DELAY;
      const convergenceTotal = CONVERGENCE_DURATION + totalDelay;
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
        const metrics = getSceneMetrics(stackedTargets);
        const startTime = opening ? openStart ?? 0 : closeStart ?? 0;
        stackedForRender = stackedTargets.map((item, index) => {
          const elapsed = time - startTime - index * PER_COMPONENT_DELAY;
          const t = clamp(elapsed / CONVERGENCE_DURATION, 0, 1);
          const progress = opening ? 1 - easeOutCubic(t) : easeOutCubic(t);
          if (progress <= 0) return item;
          // Move each item toward/away from the scene center for convergence.
          const centerX = item.obj.x + item.width / 2;
          const centerY = item.obj.y + item.depth / 2;
          const { offsetX, offsetY } = getDirectionalOffset(
            centerX - metrics.center.x,
            centerY - metrics.center.y,
            OFFSET_DISTANCE * progress
          );
          if (offsetX === 0 && offsetY === 0) return item;
          return {
            ...item,
            obj: { ...item.obj, x: item.obj.x + offsetX, y: item.obj.y + offsetY },
          };
        });
      }

      drawScene(yawRef.current, pitchRef.current, stackedForRender, sizeRef.current);

      if (openStart != null && time - openStart >= convergenceTotal) {
        openTimeRef.current = null;
      }
      if (closeStart != null && time - closeStart >= convergenceTotal) {
        closeTimeRef.current = null;
        setOverlayOpacity(0);
        if (!showMini3d) setIsVisible(false);
      }

      if (animationActive) keepRunning = true;

      if (keepRunning) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        rafRef.current = null;
        lastTimeRef.current = null;
      }
    },
    [drawScene, setOverlayOpacity, showMini3d, syncZTargets, updateZAnimation]
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

    if (isVisible && closeTimeRef.current == null) {
      // Closing sequence: keep mounted until the animation completes.
      closeOpacityRef.current = overlayOpacityRef.current;
      closeTimeRef.current = performance.now();
      openTimeRef.current = null;
      rotateDragRef.current = null;
      activePointersRef.current.clear();
      requestRender();
    }
  }, [isVisible, requestRender, setOverlayOpacity, showMini3d]);

  const handleRotatePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      // Track pointers for touch + mouse drag to rotate.
      activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (e.button === 1) {
        e.preventDefault();
        e.stopPropagation();
        setAutoRotate(false);
        rotateDragRef.current = {
          pointerId: e.pointerId,
          startX: e.clientX,
          startY: e.clientY,
          startYaw: yawRef.current,
          startPitch: pitchRef.current,
        };
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
            setAutoRotate(false);
            rotateDragRef.current = {
              pointerId: e.pointerId,
              startX: e.clientX,
              startY: e.clientY,
              startYaw: yawRef.current,
              startPitch: pitchRef.current,
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
        // Two-finger drag rotates around the pinch center.
        setAutoRotate(false);
        const pointers = Array.from(activePointersRef.current.values());
        const centerX = (pointers[0].x + pointers[1].x) / 2;
        const centerY = (pointers[0].y + pointers[1].y) / 2;
        rotateDragRef.current = {
          pointerId: e.pointerId,
          startX: centerX,
          startY: centerY,
          startYaw: yawRef.current,
          startPitch: pitchRef.current,
        };
      }
    },
    [setAutoRotate]
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
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className="mini3d-overlay"
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
        setAutoRotate((v) => !v);
      }}
      onPointerDown={handleRotatePointerDown}
      onPointerMove={handleRotatePointerMove}
      onPointerUp={handleRotatePointerUp}
      onPointerCancel={handleRotatePointerUp}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setAutoRotate((v) => !v);
        }
      }}
    >
      <canvas className="mini3d-canvas" ref={canvasRef} />
      {showMini3d ? (
        <div className="mini3d-instruction">
          Middle button (or double tap) and drag to rotate. Click for auto-rotation.
        </div>
      ) : null}
    </div>
  );
}
