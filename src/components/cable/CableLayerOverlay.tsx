import { useCallback, useEffect, useRef, useState } from "react";
import { useBoard } from "../../context/BoardContext";
import { useCable } from "../../context/CableContext";
import { useCanvas } from "../../context/CanvasContext";
import { useRendering } from "../../context/RenderingContext";
import { templateService } from "../../lib/templateService";
import { buildRoundedPathD, buildSmoothPathD, DEFAULT_JOIN_RADIUS } from "../../lib/polylinePath";
import { formatLength } from "../../lib/rulerFormat";
import { vec2Add, vec2Scale, type Vec2, type Point } from "../../lib/vector";
import { useCanvasCoords } from "../../hooks/useCanvasCoords";
import { useCableDraw } from "../../hooks/useCableDraw";
import { useCablePhysics } from "../../hooks/useCablePhysics";
import { AddCableModal } from "./AddCableModal";
import { CABLE_TERMINAL_START_COLOR, CABLE_TERMINAL_END_COLOR } from "../../constants/cables";
import * as CLO from "../../constants/cableLayerOverlay";
import type { Cable } from "../../types";
import "../ruler/RulerOverlay.scss";
import "./CableLayerOverlay.scss";

export function CableLayerOverlay() {
  const { canvasRef, zoom, pan, spaceDown } = useCanvas();
  const { objects } = useBoard();
  const { addCable } = useCable();
  const { setCableLayer } = useRendering();
  const { clientToCanvas, toScreen } = useCanvasCoords(canvasRef, zoom, pan);
  const [pendingSegments, setPendingSegments] = useState<Point[] | null>(null);
  const finishClickRef = useRef<() => void>(() => {});
  /** Active pointer IDs – when >=2 we're pinch-zooming and suppress cable drawing. */
  const activePointersRef = useRef<Set<number>>(new Set());
  const isPinchingRef = useRef(false);

  const exitMode = useCallback(() => {
    setCableLayer(() => false);
  }, [setCableLayer]);

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

  const physicsPoints = useCablePhysics(segmentStart, currentEnd, hasPreview && pendingSegments === null);

  const openAddCableModal = useCallback(() => {
    const final = getFinalPoints();
    if (final.length > 1) setPendingSegments(final);
  }, [getFinalPoints]);

  useEffect(() => {
    finishClickRef.current = openAddCableModal;
  }, [openAddCableModal]);

  const handleAddCableConfirm = useCallback(
    (cable: Cable) => {
      addCable(cable);
      clearDrawing();
      setPendingSegments(null);
      exitMode();
    },
    [addCable, clearDrawing, exitMode]
  );

  const handleAddCableCancel = useCallback(() => {
    setPendingSegments(null);
  }, []);

  /* Ref so ESC handler always sees current drawing state (avoids stale closure) */
  const hasDrawingRef = useRef(false);
  hasDrawingRef.current = !!(hasSegments || hasPreview);

  const lastTapRef = useRef<{ time: number; clientX: number; clientY: number } | null>(null);
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (pendingSegments !== null) return;
      if (e.button !== 0 && e.pointerType !== "touch") return;
      /* Let clicks on the action buttons through (Add cable, etc.) */
      if ((e.target as HTMLElement).closest(CLO.CABLE_LAYER_ACTIONS_SELECTOR)) return;

      /* Space+drag → let canvas handle panning */
      if (spaceDown) return;

      /* Track active pointers for pinch detection */
      activePointersRef.current.add(e.pointerId);
      if (activePointersRef.current.size >= 2) {
        /* Multi-touch detected → release any capture so pinch-to-zoom works */
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

      if (isPinchingRef.current) return;

      const now = Date.now();
      const last = lastTapRef.current;
      if (
        last &&
        now - last.time < CLO.CABLE_LAYER_DOUBLE_TAP_MS &&
        Math.hypot(e.clientX - last.clientX, e.clientY - last.clientY) < CLO.CABLE_LAYER_DOUBLE_TAP_MAX_DISTANCE_PX
      ) {
        lastTapRef.current = null;
        e.preventDefault();
        e.stopPropagation();
        if (hasSegments || hasPreview) {
          /* Defer opening so the upcoming pointerup/click is delivered to the overlay, not the modal backdrop */
          requestAnimationFrame(() => {
            requestAnimationFrame(() => openAddCableModal());
          });
          try {
            (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
          } catch {
            /* may not have capture */
          }
        } else {
          exitMode();
        }
        return;
      }
      onPointerDown(e);
      if (e.button === 0 || e.pointerType === "touch") {
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      }
    },
    [pendingSegments, spaceDown, onPointerDown, exitMode, hasSegments, hasPreview, openAddCableModal]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (pendingSegments !== null || isPinchingRef.current) return;
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
    [pendingSegments, onPointerMove]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      const wasPinching = isPinchingRef.current;
      activePointersRef.current.delete(e.pointerId);
      const lastPointerReleased = activePointersRef.current.size === 0;
      if (lastPointerReleased) isPinchingRef.current = false;
      if (pendingSegments !== null || isPinchingRef.current) return;
      /* Don't add a segment when releasing the last finger after a pinch */
      if (lastPointerReleased && wasPinching) return;
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
    },
    [pendingSegments, onPointerUp, hasSegments, hasPreview, openAddCableModal]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (pendingSegments !== null) {
        if (e.key === "Escape") setPendingSegments(null);
        return;
      }
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
  }, [exitMode, openAddCableModal, pendingSegments, clearDrawing]);

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

  const overlayActive = pendingSegments === null;

  return (
    <div
      className={`cable-layer-overlay ruler-overlay${
        overlayActive ? " cable-layer-active" : ""
      }${pendingSegments !== null ? " cable-layer-modal-open" : ""}`}
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
      <AddCableModal
        open={pendingSegments !== null}
        segments={pendingSegments ?? []}
        onConfirm={handleAddCableConfirm}
        onCancel={handleAddCableCancel}
      />
    </div>
  );
}
