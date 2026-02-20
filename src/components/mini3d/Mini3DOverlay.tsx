import {
  Component,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ErrorInfo,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type WheelEvent as ReactWheelEvent,
} from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
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
type TouchTapCandidate = {
  startX: number;
  startY: number;
  moved: boolean;
  startedWithSingleTouch: boolean;
};
type TouchTap = { time: number; x: number; y: number };

const TAP_MOVE_TOLERANCE_PX = 10;
const DOUBLE_TAP_TIME_WINDOW_MS = 320;
const DOUBLE_TAP_MAX_DISTANCE_PX = 28;

type CanvasErrorBoundaryProps = {
  onError: () => void;
  resetKey: number;
  children: ReactNode;
};

type CanvasErrorBoundaryState = {
  hasError: boolean;
};

class CanvasErrorBoundary extends Component<CanvasErrorBoundaryProps, CanvasErrorBoundaryState> {
  state: CanvasErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): CanvasErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo): void {
    this.props.onError();
  }

  componentDidUpdate(prevProps: CanvasErrorBoundaryProps): void {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false });
    }
  }

  render(): ReactNode {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

function getDistanceBetweenTouches(points: TouchPoint[]): number {
  if (points.length < 2) return 0;
  const [a, b] = points;
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function Mini3DOverlay({ onCloseComplete }: Mini3DOverlayProps) {
  const { objects, draggingObjectId } = useBoard();
  const {
    showMini3d,
    showMini3dFloor,
    showMini3dShadows,
    showMini3dSurfaceDetail,
    showMini3dSpecular,
    mini3dLowResourceMode,
    setMini3dLowResourceMode,
    background,
  } = useUi();

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
  const touchTapCandidateRef = useRef<Map<number, TouchTapCandidate>>(new Map());
  const lastTouchTapRef = useRef<TouchTap | null>(null);
  const contextLossCleanupRef = useRef<(() => void) | null>(null);
  const invalidateRef = useRef<(() => void) | null>(null);

  const [isVisible, setIsVisible] = useState(showMini3d);
  const [phase, setPhase] = useState<OverlayPhase>("closing");
  const [convergenceRunId, setConvergenceRunId] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [canvasFailure, setCanvasFailure] = useState(false);
  const [canvasResetKey, setCanvasResetKey] = useState(0);

  const canvasBackground = useMemo(
    () => CANVAS_BACKGROUNDS.find((bg) => bg.id === background) ?? CANVAS_BACKGROUNDS[0],
    [background]
  );

  const isBoardBeingDragged = useMemo(
    () => Boolean(draggingObjectId && objects.some((obj) => obj.id === draggingObjectId && obj.subtype === "board")),
    [draggingObjectId, objects]
  );

  const sceneLayout = useMemo(() => buildSceneLayout(objects), [objects]);
  const isPhone = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 768px) and (pointer: coarse)").matches;
  }, []);
  const isMobile3D = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 1024px), (pointer: coarse)").matches;
  }, []);
  // Low-resource mode is user-controlled (or enabled after a crash).
  const useLowMemoryTextures = mini3dLowResourceMode;
  const maxDpr = isPhone ? 1 : useLowMemoryTextures ? 1.5 : 2;
  const effectiveShowShadows = showMini3dShadows && (!isMobile3D || !useLowMemoryTextures) && !canvasFailure;
  // Keep floor specular available on mobile; heavy floor maps remain disabled by low-memory mode.
  const effectiveShowFloorDetail = showMini3dSurfaceDetail && !canvasFailure;
  const effectiveShowFloorSpecular = showMini3dSpecular && !canvasFailure;
  const shadowMapSize = useLowMemoryTextures ? 1024 : 2048;
  const useDemandMode = isMobile3D && useLowMemoryTextures;
  const maxObjects = isPhone ? 12 : 0;

  const convergenceTotalMs = useMemo(
    () => CONVERGENCE_BASE_TOTAL_MS + Math.max(0, sceneLayout.boxes.length - 1) * PER_COMPONENT_DELAY_MS,
    [sceneLayout.boxes.length]
  );

  useEffect(() => {
    showMini3dRef.current = showMini3d;
  }, [showMini3d]);

  useEffect(() => {
    if (!canvasFailure || mini3dLowResourceMode) return;
    setCanvasFailure(false);
    setCanvasResetKey((value) => value + 1);
  }, [canvasFailure, mini3dLowResourceMode]);

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
      touchTapCandidateRef.current.clear();
      lastTouchTapRef.current = null;
      setCanvasFailure(false);
      setCanvasResetKey((value) => value + 1);
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
    setCanvasFailure(false);
    activeTouchPointsRef.current.clear();
    pinchRef.current = null;
    touchTapCandidateRef.current.clear();
    lastTouchTapRef.current = null;
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
      if (contextLossCleanupRef.current) {
        contextLossCleanupRef.current();
        contextLossCleanupRef.current = null;
      }
      clearOpenTimer();
      clearCloseTimer();
    };
  }, [clearCloseTimer, clearOpenTimer]);

  const handleCanvasFailure = useCallback(() => {
    setCanvasFailure(true);
    if (isMobile3D) {
      setMini3dLowResourceMode(true);
    }
  }, [isMobile3D, setMini3dLowResourceMode]);

  const handleCanvasRetry = useCallback(() => {
    setCanvasFailure(false);
    setCanvasResetKey((value) => value + 1);
  }, []);

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
    invalidateRef.current?.();
  }, [setDistanceScale]);

  const handlePointerDown = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button === 2) return;
    e.preventDefault();
    e.stopPropagation();

    if (e.pointerType === "touch") {
      activeTouchPointsRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      const touchCount = activeTouchPointsRef.current.size;
      touchTapCandidateRef.current.set(e.pointerId, {
        startX: e.clientX,
        startY: e.clientY,
        moved: false,
        startedWithSingleTouch: touchCount === 1,
      });
      if (touchCount >= 2) {
        lastTouchTapRef.current = null;
      }
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

    invalidateRef.current?.();

    try {
      containerRef.current?.setPointerCapture(e.pointerId);
    } catch {
      /* Pointer capture can fail on some platforms. */
    }
  }, []);

  const handlePointerMove = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch" && activeTouchPointsRef.current.has(e.pointerId)) {
      const touchTapCandidate = touchTapCandidateRef.current.get(e.pointerId);
      if (touchTapCandidate && !touchTapCandidate.moved) {
        const movedDistance = Math.hypot(e.clientX - touchTapCandidate.startX, e.clientY - touchTapCandidate.startY);
        if (movedDistance > TAP_MOVE_TOLERANCE_PX) {
          touchTapCandidate.moved = true;
        }
      }
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
        invalidateRef.current?.();
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
    invalidateRef.current?.();
  }, [setDistanceScale]);

  const handlePointerUp = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch") {
      const wasCancelled = e.type === "pointercancel";
      const touchTapCandidate = touchTapCandidateRef.current.get(e.pointerId);
      touchTapCandidateRef.current.delete(e.pointerId);
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

      if (
        !wasCancelled &&
        touchTapCandidate &&
        touchTapCandidate.startedWithSingleTouch &&
        !touchTapCandidate.moved &&
        activeTouchPointsRef.current.size === 0
      ) {
        const now = performance.now();
        const lastTap = lastTouchTapRef.current;
        if (lastTap && now - lastTap.time <= DOUBLE_TAP_TIME_WINDOW_MS) {
          const tapDistance = Math.hypot(e.clientX - lastTap.x, e.clientY - lastTap.y);
          if (tapDistance <= DOUBLE_TAP_MAX_DISTANCE_PX) {
            lastTouchTapRef.current = null;
            toggleFullscreen();
          } else {
            lastTouchTapRef.current = { time: now, x: e.clientX, y: e.clientY };
          }
        } else {
          lastTouchTapRef.current = { time: now, x: e.clientX, y: e.clientY };
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
  }, [toggleFullscreen]);

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
        {canvasFailure ? (
          <div className="mini3d-fallback">
            <div className="mini3d-fallback__text">
              3D preview crashed on this browser. Mobile safe mode is enabled.
            </div>
            <button type="button" className="mini3d-fallback__retry" onClick={handleCanvasRetry}>
              Retry
            </button>
          </div>
        ) : (
          <CanvasErrorBoundary onError={handleCanvasFailure} resetKey={canvasResetKey}>
            <Canvas
              key={canvasResetKey}
              shadows
              gl={{
                antialias: !useLowMemoryTextures,
                alpha: true,
                ...(isMobile3D && useLowMemoryTextures ? { powerPreference: "low-power" as const } : {}),
              }}
              frameloop={useDemandMode ? "demand" : "always"}
              dpr={[1, maxDpr]}
              onCreated={({ gl, invalidate }) => {
                invalidateRef.current = invalidate;
                invalidate();
                gl.setClearColor("#131a24", 0.1);
                gl.shadowMap.type = THREE.PCFSoftShadowMap;
                gl.shadowMap.enabled = effectiveShowShadows;
                const canvas = gl.domElement;
                const onContextLost = (event: Event) => {
                  event.preventDefault();
                  handleCanvasFailure();
                };
                if (contextLossCleanupRef.current) {
                  contextLossCleanupRef.current();
                }
                canvas.addEventListener("webglcontextlost", onContextLost as EventListener, false);
                contextLossCleanupRef.current = () => {
                  canvas.removeEventListener("webglcontextlost", onContextLost as EventListener, false);
                };
              }}
              style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
            >
              <ShadowMapController enabled={effectiveShowShadows} />
              <PerspectiveCamera makeDefault fov={45} near={0.1} far={FIT_MAX_DISTANCE} position={[4, 4, 4]} />
              <Mini3DRootScene
                yawRef={yawRef}
                pitchRef={pitchRef}
                distanceScaleRef={distanceScaleRef}
                backgroundTexture={canvasBackground}
                useLowMemoryTextures={useLowMemoryTextures}
                showFloor={showMini3dFloor}
                showFloorDetail={effectiveShowFloorDetail}
                showFloorSpecular={effectiveShowFloorSpecular}
                showShadows={effectiveShowShadows}
                disableObjectTextures={mini3dLowResourceMode}
                shadowMapSize={shadowMapSize}
                layout={sceneLayout}
                freezeAutoFit={isBoardBeingDragged}
                overlayPhase={phase}
                convergenceRunId={convergenceRunId}
                maxObjects={maxObjects}
              />
            </Canvas>
          </CanvasErrorBoundary>
        )}

        <div className="mini3d-instruction">
          Drag to orbit. Mouse wheel or pinch to move camera slightly closer/farther. Double tap/click to toggle
          fullscreen.
        </div>
      </div>
    </>
  );
}
