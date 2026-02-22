import { useCallback, useEffect, useRef } from "react";
import { useBoard } from "../../context/BoardContext";
import { useCanvas } from "../../context/CanvasContext";
import { useRendering } from "../../context/RenderingContext";
import { useTemplateService } from "../../context/TemplateServiceContext";
import { buildRoundedPathD, buildSmoothPathD, DEFAULT_JOIN_RADIUS } from "../../lib/polylinePath";
import {
  tryReleasePointerCapture,
  tryReleasePointerCaptures,
  trySetPointerCapture,
} from "../../lib/pointerCapture";
import { isDoubleTapWithinThreshold } from "../../lib/tapGesture";
import { vec2Add, vec2Scale, type Vec2, type Point } from "../../lib/vector";
import { useCanvasCoords } from "../../hooks/useCanvasCoords";
import { useCableDraw } from "../../hooks/useCableDraw";
import { useCablePhysics } from "../../hooks/useCablePhysics";
import { useCableLayerKeyboard } from "./useCableLayerKeyboard";
import { CableLayerSurface } from "./CableLayerSurface";
import {
  canHandleCableLayerPointerDown,
  isPrimaryCableLayerPointer,
  resolveCableLayerPointerDownDecision,
} from "./cableLayerPointerDown";
import {
  applyCableLayerPointerDown,
  applyCableLayerPointerUp,
  createInitialCableLayerGestureState,
} from "./cableLayerGestureStateMachine";
import {
  isPointerUpPrimary,
  resolveCableLayerPointerUpPreflight,
} from "./cableLayerPointerUp";
import * as CLO from "../../constants/cableLayerOverlay";
import "../ruler/RulerOverlay.scss";
import "./CableLayerOverlay.scss";

interface CableLayerOverlayProps {
  /** Called when the user commits a drawn path. The parent shows the add-cable modal and
   *  must invoke onConfirmed() after the cable has been saved so the overlay can clear its
   *  drawing state and exit cable-draw mode. On cancel, onConfirmed is not called and the
   *  drawing remains intact so the user can continue editing. */
  onFinishDrawing: (segments: Point[], onConfirmed: () => void) => void;
  /** True while the parent-owned add-cable modal is open; suppresses overlay pointer events. */
  isModalOpen: boolean;
}

export function CableLayerOverlay({ onFinishDrawing, isModalOpen }: CableLayerOverlayProps) {
  const { canvasRef, zoom, pan, spaceDown, gesture } = useCanvas();
  const { objects } = useBoard();
  const templateService = useTemplateService();
  const { setCableLayer } = useRendering();
  const { clientToCanvas, toScreen } = useCanvasCoords(canvasRef, zoom, pan);
  const finishClickRef = useRef<() => void>(() => {});
  const actionsRef = useRef<HTMLDivElement>(null);
  const addButtonRef = useRef<HTMLButtonElement>(null);
  /** Single source of truth for overlay pointer/pinch lifecycle state. */
  const gestureStateRef = useRef(createInitialCableLayerGestureState());

  const exitMode = useCallback(() => {
    setCableLayer(() => false);
  }, [setCableLayer]);

  const releaseCableGesture = useCallback(() => {
    gesture.releaseMode("cable-draw");
  }, [gesture]);

  const {
    points: cablePoints,
    segmentStart,
    currentEnd,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    getFinalPoints,
    clearDrawing,
    hasSegments,
    hasPreview,
    committedLength,
    totalLength,
  } = useCableDraw({
    clientToCanvas,
    objects,
    getObjectDimensions: templateService.getObjectDimensions,
    onDoubleClickExit: exitMode,
    onFinishClickRef: finishClickRef,
  });

  const physicsPoints = useCablePhysics(segmentStart, currentEnd, hasPreview && !isModalOpen);

  const openAddCableModal = useCallback(() => {
    const final = getFinalPoints();
    if (final.length > 1) {
      onFinishDrawing(final, () => {
        clearDrawing();
        exitMode();
      });
    }
  }, [getFinalPoints, onFinishDrawing, clearDrawing, exitMode]);

  useEffect(() => {
    finishClickRef.current = openAddCableModal;
  }, [openAddCableModal]);

  useCableLayerKeyboard({
    isModalOpen,
    hasDrawing: hasSegments || hasPreview,
    clearDrawing,
    exitMode,
    openAddCableModal,
  });

  const lastTapRef = useRef<{ time: number; x: number; y: number } | null>(null);
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      // Phase 1: cheap preflight blockers that should never claim the cable gesture.
      const overActions = actionsRef.current?.contains(e.target as Node) ?? false;
      if (
        !canHandleCableLayerPointerDown({
          isModalOpen,
          isPrimaryPointer: isPrimaryCableLayerPointer(e.button, e.pointerType),
          overActions,
          spaceDown,
        })
      ) {
        return;
      }
      // Phase 2: claim cable-draw ownership in the shared gesture coordinator.
      // If another mode owns the pointer stream, we intentionally noop.
      if (!gesture.requestMode("cable-draw")) return;

      // Phase 3: machine transition + decision resolution.
      gestureStateRef.current = applyCableLayerPointerDown(gestureStateRef.current, e.pointerId);
      const gestureState = gestureStateRef.current;
      // Use shared threshold helper so time+distance logic stays consistent across components.
      const isDoubleTap = isDoubleTapWithinThreshold(
        lastTapRef.current,
        { time: Date.now(), x: e.clientX, y: e.clientY },
        {
          windowMs: CLO.CABLE_LAYER_DOUBLE_TAP_MS,
          maxDistancePx: CLO.CABLE_LAYER_DOUBLE_TAP_MAX_DISTANCE_PX,
        }
      );
      const decision = resolveCableLayerPointerDownDecision({
        activePointerCount: gestureState.activePointerIds.size,
        isPinching: gestureState.tag === "pinching",
        isDoubleTap,
      });

      if (decision === "begin-pinch") {
        /* Multi-touch detected -> release any capture so pinch-to-zoom works. */
        const el = e.currentTarget as HTMLElement;
        tryReleasePointerCaptures(el, gestureState.activePointerIds);
        return;
      }

      if (decision === "ignore") return;

      if (decision === "double-tap") {
        // Double tap is a mode-level action: either finish current cable or exit draw mode.
        lastTapRef.current = null;
        e.preventDefault();
        e.stopPropagation();
        if (hasSegments || hasPreview) {
          /* Defer one frame so the upcoming pointerup/click is delivered to the overlay first. */
          requestAnimationFrame(() => openAddCableModal());
          tryReleasePointerCapture(e.currentTarget as HTMLElement, e.pointerId);
        } else {
          releaseCableGesture();
          exitMode();
        }
        return;
      }

      if (
        decision === "draw" &&
        (e.button === 0 || e.pointerType === "touch")
      ) {
        // Normal draw path: delegate to draw hook, then capture this pointer id.
        onPointerDown(e);
        trySetPointerCapture(e.currentTarget as HTMLElement, e.pointerId);
      }
    },
    [
      isModalOpen,
      spaceDown,
      gesture,
      onPointerDown,
      exitMode,
      hasSegments,
      hasPreview,
      openAddCableModal,
      releaseCableGesture,
    ]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (isModalOpen || gestureStateRef.current.tag === "pinching") return;
      /* When pointer moves over Add cable button, release capture so the button can receive the click */
      const hit = document.elementFromPoint(e.clientX, e.clientY);
      if (hit && actionsRef.current?.contains(hit)) {
        tryReleasePointerCapture(e.currentTarget as HTMLElement, e.pointerId);
      }
      onPointerMove(e);
    },
    [isModalOpen, onPointerMove]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      // Phase 1: advance the explicit machine first, then branch from transition phase.
      const pointerUpTransition = applyCableLayerPointerUp(gestureStateRef.current, e.pointerId);
      gestureStateRef.current = pointerUpTransition.nextState;

      // Phase 2: early suppression branches (modal open, active pinch, or post-pinch final release).
      const preflightDecision = resolveCableLayerPointerUpPreflight({
        isModalOpen,
        isPinching: pointerUpTransition.phase === "still-pinching",
        suppressBecausePinchEnded: pointerUpTransition.phase === "pinch-ended",
      });
      if (preflightDecision !== "process") {
        releaseCableGesture();
        return;
      }

      // Phase 3: route by pointer-up hit target (actions area vs canvas path commit).
      // With pointer capture, `e.target` is overlay; elementFromPoint gives actual hit.
      const hit = document.elementFromPoint(e.clientX, e.clientY);
      if (hit && actionsRef.current?.contains(hit)) {
        // Allow buttons to receive click by dropping capture when release occurs over actions.
        tryReleasePointerCapture(e.currentTarget as HTMLElement, e.pointerId);
        // Only Add button opens modal; Cancel should not.
        if (addButtonRef.current?.contains(hit) && (hasSegments || hasPreview)) openAddCableModal();
        // Track tap for subsequent double-tap detection.
        if (isPointerUpPrimary(e.button, e.pointerType)) {
          lastTapRef.current = { time: Date.now(), x: e.clientX, y: e.clientY };
        }
        releaseCableGesture();
        return;
      }

      // Phase 4: normal draw pointer-up path delegates to draw hook.
      onPointerUp(e);
      tryReleasePointerCapture(e.currentTarget as HTMLElement, e.pointerId);
      if (isPointerUpPrimary(e.button, e.pointerType)) {
        lastTapRef.current = { time: Date.now(), x: e.clientX, y: e.clientY };
      }
      releaseCableGesture();
    },
    [isModalOpen, onPointerUp, hasSegments, hasPreview, openAddCableModal, releaseCableGesture]
  );

  useEffect(() => () => releaseCableGesture(), [releaseCableGesture]);

  const joinRadiusPx = DEFAULT_JOIN_RADIUS * zoom;
  const strokeWidthPx = CLO.CABLE_LAYER_STROKE_WIDTH_MM * zoom;
  const dashLengthPx = strokeWidthPx * CLO.CABLE_LAYER_CURRENT_CABLE_DASH_SCALE;
  const gapLengthPx = strokeWidthPx * CLO.CABLE_LAYER_CURRENT_CABLE_GAP_SCALE;
  const currentCableStrokeDasharray = `${dashLengthPx} ${gapLengthPx}`;
  const toScreenPoint = (point: Vec2): Vec2 => toScreen(point.x, point.y);

  const committedScreenPoints: Vec2[] =
    cablePoints.length > 0 ? cablePoints.map((point) => toScreenPoint(point)) : [];

  const displayPoints: Vec2[] = (() => {
    if (cablePoints.length === 0 && segmentStart) {
      return [toScreenPoint(segmentStart)];
    }
    if (cablePoints.length === 0) return [];
    const pts = [...committedScreenPoints];
    if (hasPreview && currentEnd) {
      pts.push(toScreenPoint(currentEnd));
    }
    return pts;
  })();

  const committedPathD =
    committedScreenPoints.length >= 2
      ? buildRoundedPathD(committedScreenPoints, joinRadiusPx)
      : "";

  const physicsScreenPoints = physicsPoints.map((point) => toScreenPoint(point));
  const previewPathD =
    physicsScreenPoints.length >= 2
      ? buildSmoothPathD(physicsScreenPoints)
      : segmentStart && currentEnd && hasPreview
        ? `M ${toScreenPoint(segmentStart).x} ${toScreenPoint(segmentStart).y} L ${toScreenPoint(currentEnd).x} ${toScreenPoint(currentEnd).y}`
        : "";

  const firstPoint = displayPoints[0];
  const lastPoint = displayPoints.length > 1 ? displayPoints[displayPoints.length - 1] : null;

  const popupCenter: Vec2 | null =
    hasSegments || hasPreview
      ? hasPreview && segmentStart && currentEnd
        ? toScreenPoint(vec2Scale(vec2Add(segmentStart, currentEnd), 0.5))
        : cablePoints.length > 0
        ? toScreenPoint(cablePoints[cablePoints.length - 1])
        : segmentStart
        ? toScreenPoint(segmentStart)
        : null
      : null;

  const showBothLengths =
    hasPreview && totalLength > committedLength + CLO.CABLE_LAYER_LENGTH_COMPARE_EPSILON_MM;

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      if (hasSegments || hasPreview) {
        e.preventDefault();
        clearDrawing();
      }
    },
    [hasSegments, hasPreview, clearDrawing]
  );

  return (
    <div
      className={`cable-layer-overlay ruler-overlay${
        !isModalOpen ? " cable-layer-active" : ""
      }${isModalOpen ? " cable-layer-modal-open" : ""}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onContextMenu={handleContextMenu}
    >
      <CableLayerSurface
        committedPathD={committedPathD}
        previewPathD={previewPathD}
        strokeWidthPx={strokeWidthPx}
        currentCableStrokeDasharray={currentCableStrokeDasharray}
        firstPoint={firstPoint}
        lastPoint={lastPoint}
        hasSegments={hasSegments}
        hasPreview={hasPreview}
        popupCenter={popupCenter}
        totalLength={totalLength}
        committedLength={committedLength}
        showBothLengths={showBothLengths}
        onCancelDrawing={clearDrawing}
        onAddCableModal={openAddCableModal}
        actionsRef={actionsRef}
        addButtonRef={addButtonRef}
      />
    </div>
  );
}
