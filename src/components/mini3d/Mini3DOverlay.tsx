import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { useBoard } from "../../context/BoardContext";
import { useUi } from "../../context/UiContext";
import { CANVAS_BACKGROUNDS } from "../../constants/backgrounds";
import { clamp } from "../../lib/math";
import { Mini3DRootScene, ShadowMapController } from "./Mini3DRootScene";
import {
  CAMERA_DISTANCE_SCALE_DEFAULT,
  CAMERA_DISTANCE_SCALE_MAX,
  CAMERA_DISTANCE_SCALE_MIN,
  CAMERA_DISTANCE_WHEEL_SENSITIVITY,
  CONVERGENCE_BASE_TOTAL_MS,
  DEFAULT_PITCH,
  DEFAULT_YAW,
  DRAG_SENSITIVITY,
  FIT_MAX_DISTANCE,
  MAX_PITCH,
  MIN_PITCH,
  OPEN_FADE_MS,
  OVERLAY_OPACITY,
  PER_COMPONENT_DELAY_MS,
} from "./mini3dConstants";
import { buildSceneLayout } from "./sceneLayout";
import type { CssVars, DragState, Mini3DOverlayProps, OverlayPhase } from "./mini3dTypes";
import "./Mini3DOverlay.scss";

type TouchPoint = { x: number; y: number };
type PinchState = { startDistance: number; startScale: number };

function getDistanceBetweenTouches(points: TouchPoint[]): number {
  if (points.length < 2) return 0;
  const [a, b] = points;
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function Mini3DOverlay({ onCloseComplete }: Mini3DOverlayProps) {
  const { objects, draggingObjectId } = useBoard();
  const { showMini3d, showMini3dFloor, showMini3dShadows, showMini3dSurfaceDetail, background } = useUi();

  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const yawRef = useRef(DEFAULT_YAW);
  const pitchRef = useRef(DEFAULT_PITCH);
  const openTimerRef = useRef<number | null>(null);
  const closeTimerRef = useRef<number | null>(null);
  const showMini3dRef = useRef(showMini3d);
  const prevShowMini3dRef = useRef(false);
  const closeFadeMsRef = useRef(CONVERGENCE_BASE_TOTAL_MS);
  const distanceScaleRef = useRef(CAMERA_DISTANCE_SCALE_DEFAULT);
  const activeTouchPointsRef = useRef<Map<number, TouchPoint>>(new Map());
  const pinchRef = useRef<PinchState | null>(null);

  const [isVisible, setIsVisible] = useState(showMini3d);
  const [phase, setPhase] = useState<OverlayPhase>("closing");
  const [convergenceRunId, setConvergenceRunId] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const canvasBackground = useMemo(
    () => CANVAS_BACKGROUNDS.find((bg) => bg.id === background) ?? CANVAS_BACKGROUNDS[0],
    [background]
  );

  const isBoardBeingDragged = useMemo(
    () => Boolean(draggingObjectId && objects.some((obj) => obj.id === draggingObjectId && obj.subtype === "board")),
    [draggingObjectId, objects]
  );

  const sceneLayout = useMemo(() => buildSceneLayout(objects), [objects]);

  const convergenceTotalMs = useMemo(
    () => CONVERGENCE_BASE_TOTAL_MS + Math.max(0, sceneLayout.boxes.length - 1) * PER_COMPONENT_DELAY_MS,
    [sceneLayout.boxes.length]
  );

  useEffect(() => {
    showMini3dRef.current = showMini3d;
  }, [showMini3d]);

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

  useEffect(() => {
    const wasShown = prevShowMini3dRef.current;
    prevShowMini3dRef.current = showMini3d;

    if (showMini3d) {
      if (wasShown) return;
      clearCloseTimer();
      distanceScaleRef.current = CAMERA_DISTANCE_SCALE_DEFAULT;
      activeTouchPointsRef.current.clear();
      pinchRef.current = null;
      setIsVisible(true);
      setPhase("opening");
      setConvergenceRunId((value) => value + 1);
      clearOpenTimer();
      openTimerRef.current = window.setTimeout(() => {
        openTimerRef.current = null;
        if (!showMini3dRef.current) return;
        setPhase("open");
      }, convergenceTotalMs);
      return;
    }

    if (!wasShown || !isVisible) return;
    setIsFullscreen(false);
    dragRef.current = null;
    activeTouchPointsRef.current.clear();
    pinchRef.current = null;
    setPhase("closing");
    setConvergenceRunId((value) => value + 1);
    closeFadeMsRef.current = convergenceTotalMs;
    clearOpenTimer();
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => {
      closeTimerRef.current = null;
      if (showMini3dRef.current) return;
      setIsVisible(false);
      onCloseComplete?.();
    }, closeFadeMsRef.current);
  }, [clearCloseTimer, clearOpenTimer, convergenceTotalMs, isVisible, onCloseComplete, showMini3d]);

  useEffect(() => {
    return () => {
      clearOpenTimer();
      clearCloseTimer();
    };
  }, [clearCloseTimer, clearOpenTimer]);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((v) => !v);
  }, []);

  const setDistanceScale = useCallback((nextScale: number) => {
    distanceScaleRef.current = clamp(nextScale, CAMERA_DISTANCE_SCALE_MIN, CAMERA_DISTANCE_SCALE_MAX);
  }, []);

  const handleWheel = useCallback((e: ReactWheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const factor = Math.exp(e.deltaY * CAMERA_DISTANCE_WHEEL_SENSITIVITY);
    setDistanceScale(distanceScaleRef.current * factor);
  }, [setDistanceScale]);

  const handlePointerDown = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button === 2) return;
    e.preventDefault();
    e.stopPropagation();

    if (e.pointerType === "touch") {
      activeTouchPointsRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      const points = [...activeTouchPointsRef.current.values()];
      if (points.length >= 2) {
        const startDistance = getDistanceBetweenTouches(points);
        if (startDistance > 0) {
          pinchRef.current = { startDistance, startScale: distanceScaleRef.current };
          dragRef.current = null;
        }
      }
    }

    const shouldStartDrag = e.pointerType !== "touch" || activeTouchPointsRef.current.size < 2;
    if (shouldStartDrag) {
      dragRef.current = {
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        startYaw: yawRef.current,
        startPitch: pitchRef.current,
      };
    }

    try {
      containerRef.current?.setPointerCapture(e.pointerId);
    } catch {
      /* Pointer capture can fail on some platforms. */
    }
  }, []);

  const handlePointerMove = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch" && activeTouchPointsRef.current.has(e.pointerId)) {
      activeTouchPointsRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      const points = [...activeTouchPointsRef.current.values()];
      if (points.length >= 2) {
        e.preventDefault();
        e.stopPropagation();

        if (!pinchRef.current) {
          const startDistance = getDistanceBetweenTouches(points);
          if (startDistance > 0) {
            pinchRef.current = { startDistance, startScale: distanceScaleRef.current };
          }
        }

        const pinch = pinchRef.current;
        if (!pinch || pinch.startDistance <= 0) return;
        const distanceNow = getDistanceBetweenTouches(points);
        if (distanceNow <= 0) return;
        const pinchRatio = distanceNow / pinch.startDistance;
        setDistanceScale(pinch.startScale / pinchRatio);
        return;
      }
    }

    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;

    e.preventDefault();
    e.stopPropagation();

    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    yawRef.current = drag.startYaw - dx * DRAG_SENSITIVITY;
    pitchRef.current = clamp(drag.startPitch + dy * DRAG_SENSITIVITY, MIN_PITCH, MAX_PITCH);
  }, [setDistanceScale]);

  const handlePointerUp = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch") {
      activeTouchPointsRef.current.delete(e.pointerId);
      if (activeTouchPointsRef.current.size < 2) {
        pinchRef.current = null;
        const [remainingPointerId, remainingPoint] = activeTouchPointsRef.current.entries().next().value ?? [];
        if (typeof remainingPointerId === "number" && remainingPoint) {
          dragRef.current = {
            pointerId: remainingPointerId,
            startX: remainingPoint.x,
            startY: remainingPoint.y,
            startYaw: yawRef.current,
            startPitch: pitchRef.current,
          };
        }
      }
    }

    const drag = dragRef.current;
    if (drag && drag.pointerId === e.pointerId) {
      dragRef.current = null;
    }

    try {
      containerRef.current?.releasePointerCapture(e.pointerId);
    } catch {
      /* Pointer may already be released. */
    }
  }, []);

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

  const styleVars: CssVars = {
    "--mini3d-overlay-opacity": `${OVERLAY_OPACITY}`,
    "--mini3d-open-fade-ms": `${OPEN_FADE_MS}ms`,
    "--mini3d-close-fade-ms": `${phase === "closing" ? closeFadeMsRef.current : convergenceTotalMs}ms`,
  };

  return (
    <>
      <div className={backdropClass} style={styleVars} />
      <div
        ref={containerRef}
        className={overlayClass}
        style={styleVars}
        aria-label="3D overlay"
        title="3D overlay"
        onDoubleClick={toggleFullscreen}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
      >
        <Canvas
          shadows
          gl={{ antialias: true, alpha: true }}
          frameloop="always"
          dpr={[1, 2]}
          onCreated={({ gl }) => {
            gl.setClearColor("#131a24", 0.1);
            gl.shadowMap.type = THREE.PCFSoftShadowMap;
            gl.shadowMap.enabled = showMini3dShadows;
          }}
          style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
        >
          <ShadowMapController enabled={showMini3dShadows} />
          <perspectiveCamera makeDefault fov={45} near={0.1} far={FIT_MAX_DISTANCE} position={[4, 4, 4]} />
          <Mini3DRootScene
            yawRef={yawRef}
            pitchRef={pitchRef}
            distanceScaleRef={distanceScaleRef}
            backgroundTexture={canvasBackground}
            showFloor={showMini3dFloor}
            showFloorDetail={showMini3dSurfaceDetail}
            showShadows={showMini3dShadows}
            layout={sceneLayout}
            freezeAutoFit={isBoardBeingDragged}
            overlayPhase={phase}
            convergenceRunId={convergenceRunId}
          />
        </Canvas>

        <div className="mini3d-instruction">
          Drag to orbit. Mouse wheel or pinch to move camera slightly closer/farther. Double click to toggle fullscreen.
        </div>
      </div>
    </>
  );
}
