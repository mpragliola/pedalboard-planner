import { useCallback, useEffect, useRef } from "react";
import { useBoard } from "../../context/BoardContext";
import { useCanvas } from "../../context/CanvasContext";
import { useRendering } from "../../context/RenderingContext";
import { templateService } from "../../lib/templateService";
import { buildRoundedPathD, buildSmoothPathD, DEFAULT_JOIN_RADIUS } from "../../lib/polylinePath";
import { formatLength } from "../../lib/rulerFormat";
import { vec2Add, vec2Scale, type Vec2, type Point } from "../../lib/vector";
import { useCanvasCoords } from "../../hooks/useCanvasCoords";
import { useCableDraw } from "../../hooks/useCableDraw";
import { useCablePhysics } from "../../hooks/useCablePhysics";
import {
  canHandleCableLayerPointerDown,
  isPrimaryCableLayerPointer,
  resolveCableLayerPointerDownDecision,
} from "./cableLayerPointerDown";
import { CABLE_TERMINAL_START_COLOR, CABLE_TERMINAL_END_COLOR } from "../../constants/cables";
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
  const { setCableLayer } = useRendering();
  const { clientToCanvas, toScreen } = useCanvasCoords(canvasRef, zoom, pan);
  const finishClickRef = useRef<() => void>(() => {});
  /** Active pointer IDs – when >=2 we're pinch-zooming and suppress cable drawing. */
  const activePointersRef = useRef<Set<number>>(new Set());
  const isPinchingRef = useRef(false);

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

  /* Ref so ESC handler always sees current drawing state (avoids stale closure) */
  const hasDrawingRef = useRef(false);
  hasDrawingRef.current = !!(hasSegments || hasPreview);

  const lastTapRef = useRef<{ time: number; clientX: number; clientY: number } | null>(null);
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      // Phase 1: cheap preflight blockers that should never claim the cable gesture.
      const overActions = Boolean((e.target as HTMLElement).closest(CLO.CABLE_LAYER_ACTIONS_SELECTOR));
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

      // Phase 3: update local pointer tracking and resolve a single decision token.
      activePointersRef.current.add(e.pointerId);
      const now = Date.now();
      const last = lastTapRef.current;
      const isDoubleTap =
        Boolean(last) &&
        now - (last?.time ?? 0) < CLO.CABLE_LAYER_DOUBLE_TAP_MS &&
        Math.hypot(e.clientX - (last?.clientX ?? 0), e.clientY - (last?.clientY ?? 0)) <
          CLO.CABLE_LAYER_DOUBLE_TAP_MAX_DISTANCE_PX;
      const decision = resolveCableLayerPointerDownDecision({
        activePointerCount: activePointersRef.current.size,
        isPinching: isPinchingRef.current,
        isDoubleTap,
      });

      if (decision === "begin-pinch") {
        /* Multi-touch detected -> release any capture so pinch-to-zoom works. */
        isPinchingRef.current = true;
        const el = e.currentTarget as HTMLElement;
        for (const pid of activePointersRef.current) {
          try {
            el.releasePointerCapture(pid);
          } catch {
            /* ok */
          }
        }
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
          try {
            (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
          } catch {
            /* may not have capture */
          }
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
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
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
      if (isModalOpen || isPinchingRef.current) return;
      /* When pointer moves over Add cable button, release capture so the button can receive the click */
      const hit = document.elementFromPoint(e.clientX, e.clientY);
      if (hit?.closest?.(CLO.CABLE_LAYER_ACTIONS_SELECTOR)) {
        try {
          (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
        } catch {
          /* ok */
        }
      }
      onPointerMove(e);
    },
    [isModalOpen, onPointerMove]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      const wasPinching = isPinchingRef.current;
      activePointersRef.current.delete(e.pointerId);
      const lastPointerReleased = activePointersRef.current.size === 0;
      if (lastPointerReleased) isPinchingRef.current = false;
      if (isModalOpen || isPinchingRef.current) {
        releaseCableGesture();
        return;
      }
      /* Don't add a segment when releasing the last finger after a pinch */
      if (lastPointerReleased && wasPinching) {
        releaseCableGesture();
        return;
      }
      /* With pointer capture, e.target is the overlay; use elementFromPoint to see where release actually was */
      const hit = document.elementFromPoint(e.clientX, e.clientY);
      if (hit?.closest?.(CLO.CABLE_LAYER_ACTIONS_SELECTOR)) {
        try {
          (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
        } catch {
          /* ok */
        }
        /* Only open modal when release was over Add cable button, not Cancel */
        if (hit?.closest?.(CLO.CABLE_LAYER_ADD_BUTTON_SELECTOR) && (hasSegments || hasPreview)) openAddCableModal();
        if (e.button === 0 || e.pointerType === "touch") {
          lastTapRef.current = { time: Date.now(), clientX: e.clientX, clientY: e.clientY };
        }
        releaseCableGesture();
        return;
      }
      onPointerUp(e);
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        /* may not have capture */
      }
      if (e.button === 0 || e.pointerType === "touch") {
        lastTapRef.current = { time: Date.now(), clientX: e.clientX, clientY: e.clientY };
      }
      releaseCableGesture();
    },
    [isModalOpen, onPointerUp, hasSegments, hasPreview, openAddCableModal, releaseCableGesture]
  );

  useEffect(() => () => releaseCableGesture(), [releaseCableGesture]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      /* While the parent modal is open, let it handle its own keyboard events */
      if (isModalOpen) return;
      if (e.key === "Escape") {
        if (hasDrawingRef.current) {
          e.preventDefault();
          clearDrawing();
        } else {
          exitMode();
        }
        return;
      }
      if (e.key === "Enter" && hasDrawingRef.current) {
        e.preventDefault();
        openAddCableModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [exitMode, openAddCableModal, isModalOpen, clearDrawing]);

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
      <svg className="cable-layer-svg ruler-diagonal" style={{ left: 0, top: 0 }}>
        {committedPathD && (
          <path
            d={committedPathD}
            fill="none"
            stroke={CLO.CABLE_LAYER_CURRENT_CABLE_STROKE}
            strokeWidth={strokeWidthPx}
            strokeOpacity={CLO.CABLE_LAYER_CURRENT_CABLE_OPACITY}
            strokeDasharray={currentCableStrokeDasharray}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}
        {previewPathD && (
          <path
            d={previewPathD}
            fill="none"
            stroke={CLO.CABLE_LAYER_CURRENT_CABLE_STROKE}
            strokeWidth={strokeWidthPx}
            strokeOpacity={CLO.CABLE_LAYER_CURRENT_CABLE_OPACITY}
            strokeDasharray={currentCableStrokeDasharray}
            strokeLinecap="round"
          />
        )}
        {firstPoint && (
          <circle
            cx={firstPoint.x}
            cy={firstPoint.y}
            r={CLO.CABLE_LAYER_ENDPOINT_DOT_RADIUS_PX}
            className="cable-endpoint-dot"
            fill={CABLE_TERMINAL_START_COLOR}
            stroke={CLO.CABLE_LAYER_ENDPOINT_DOT_STROKE}
            strokeWidth={CLO.CABLE_LAYER_ENDPOINT_DOT_STROKE_WIDTH_PX}
          />
        )}
        {lastPoint && (
          <circle
            cx={lastPoint.x}
            cy={lastPoint.y}
            r={CLO.CABLE_LAYER_ENDPOINT_DOT_RADIUS_PX}
            className="cable-endpoint-dot"
            fill={CABLE_TERMINAL_END_COLOR}
            stroke={CLO.CABLE_LAYER_ENDPOINT_DOT_STROKE}
            strokeWidth={CLO.CABLE_LAYER_ENDPOINT_DOT_STROKE_WIDTH_PX}
          />
        )}
      </svg>
      {(hasSegments || hasPreview) && popupCenter && totalLength > 0 && (
        <div
          className="ruler-popup"
          data-no-canvas-zoom
          style={{
            left: popupCenter.x,
            top: popupCenter.y - CLO.CABLE_LAYER_LENGTH_POPUP_Y_OFFSET_PX,
            transform: "translate(-50%, -100%)",
          }}
        >
          <div className="ruler-popup-row">
            <span>Length</span>
            <span>
              {showBothLengths
                ? `${formatLength(committedLength, "mm")} (${formatLength(totalLength, "mm")})`
                : formatLength(totalLength, "mm")}
            </span>
          </div>
        </div>
      )}
      {(hasSegments || hasPreview) && (
        <div className="cable-layer-actions" data-no-canvas-zoom>
          <div className="cable-layer-buttons">
            <button
              type="button"
              className="cable-layer-cancel-btn"
              onClick={clearDrawing}
              title="Cancel current cable (Esc or right-click). Start drawing again."
            >
              Cancel
            </button>
            <button
              type="button"
              className="cable-layer-add-btn"
              onClick={openAddCableModal}
              title="Add cable (Enter). Finish drawing and exit Add cable mode."
            >
              Add cable
            </button>
          </div>
          <p className="cable-layer-hint" aria-hidden>
            Finish or press Esc to cancel
          </p>
        </div>
      )}
    </div>
  );
}
