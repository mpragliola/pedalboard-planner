import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useApp } from "../../context/AppContext";
import { getObjectDimensions } from "../../lib/stateManager";
import { buildRoundedPathD, DEFAULT_JOIN_RADIUS } from "../../lib/polylinePath";
import { formatLength } from "../../lib/rulerFormat";
import { useCanvasCoords } from "../../hooks/useCanvasCoords";
import { useCableDraw } from "../../hooks/useCableDraw";
import { AddCableModal } from "./AddCableModal";
import type { Cable, CableSegment } from "../../types";
import "../ruler/RulerOverlay.css";
import "./CableLayerOverlay.css";

/** Current (in-progress) cable: dashed, black, 0.5 opacity to distinguish from laid-down cables. */
const CURRENT_CABLE_STROKE = "#000";
const CURRENT_CABLE_OPACITY = 0.5;
/** Dash/gap scale relative to stroke width so dashes stay visible at any zoom. */
const CURRENT_CABLE_DASH_SCALE = 3;
const CURRENT_CABLE_GAP_SCALE = 2;
const CABLE_STROKE_WIDTH_MM = 5;
const ENDPOINT_DOT_RADIUS_PX = 5;

export function CableLayerOverlay() {
  const { canvasRef, zoom, pan, unit, objects, addCableAndPersist, setCableLayer, spaceDown } = useApp();
  const { clientToCanvas, toScreen } = useCanvasCoords(canvasRef, zoom, pan);
  const [pendingSegments, setPendingSegments] = useState<CableSegment[] | null>(null);
  const finishClickRef = useRef<() => void>(() => {});
  /** Active pointer IDs – when >=2 we're pinch-zooming and suppress cable drawing. */
  const activePointersRef = useRef<Set<number>>(new Set());
  const isPinchingRef = useRef(false);

  const exitMode = useCallback(() => {
    setCableLayer(() => false);
  }, [setCableLayer]);

  const {
    segments,
    segmentStart,
    currentEnd,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    getFinalSegments,
    clearDrawing,
    hasSegments,
    hasPreview,
  } = useCableDraw({
    clientToCanvas,
    objects,
    getObjectDimensions,
    onDoubleClickExit: exitMode,
    onFinishClickRef: finishClickRef,
  });

  const openAddCableModal = useCallback(() => {
    const final = getFinalSegments();
    if (final.length > 0) setPendingSegments(final);
  }, [getFinalSegments]);

  useEffect(() => {
    finishClickRef.current = openAddCableModal;
  }, [openAddCableModal]);

  const handleAddCableConfirm = useCallback(
    (cable: Cable) => {
      addCableAndPersist(cable);
      clearDrawing();
      setPendingSegments(null);
    },
    [addCableAndPersist, clearDrawing]
  );

  const handleAddCableCancel = useCallback(() => {
    setPendingSegments(null);
  }, []);

  /* Ref so ESC handler always sees current drawing state (avoids stale closure) */
  const hasDrawingRef = useRef(false);
  hasDrawingRef.current = !!(hasSegments || hasPreview);

  const lastTapRef = useRef<{ time: number; clientX: number; clientY: number } | null>(null);
  const DOUBLE_TAP_MS = 350;
  const DOUBLE_TAP_PX = 50;

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (pendingSegments !== null) return;
      if (e.button !== 0 && e.pointerType !== "touch") return;
      /* Let clicks on the action buttons through (Add cable, etc.) */
      if ((e.target as HTMLElement).closest(".cable-layer-actions")) return;

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
        now - last.time < DOUBLE_TAP_MS &&
        Math.hypot(e.clientX - last.clientX, e.clientY - last.clientY) < DOUBLE_TAP_PX
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
      if (hit?.closest?.(".cable-layer-actions")) {
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
      if (hit?.closest?.(".cable-layer-actions")) {
        try {
          (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
        } catch {
          /* ok */
        }
        /* Only open modal when release was over Add cable button, not Cancel */
        if (hit?.closest?.(".cable-layer-add-btn") && (hasSegments || hasPreview)) openAddCableModal();
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
  const strokeWidthPx = CABLE_STROKE_WIDTH_MM * zoom;
  const dashLengthPx = strokeWidthPx * CURRENT_CABLE_DASH_SCALE;
  const gapLengthPx = strokeWidthPx * CURRENT_CABLE_GAP_SCALE;
  const currentCableStrokeDasharray = `${dashLengthPx} ${gapLengthPx}`;

  const points = (() => {
    if (segments.length === 0 && segmentStart) {
      return [toScreen(segmentStart.x, segmentStart.y)];
    }
    if (segments.length === 0) return [];
    const pts = [toScreen(segments[0].x1, segments[0].y1), ...segments.map((s) => toScreen(s.x2, s.y2))];
    if (hasPreview && currentEnd) {
      pts.push(toScreen(currentEnd.x, currentEnd.y));
    }
    return pts;
  })();

  const committedPathD =
    segments.length > 0
      ? buildRoundedPathD(
          [toScreen(segments[0].x1, segments[0].y1), ...segments.map((s) => toScreen(s.x2, s.y2))],
          joinRadiusPx
        )
      : "";

  const p1Screen = segmentStart && hasPreview ? toScreen(segmentStart.x, segmentStart.y) : null;
  const p2Screen = currentEnd && hasPreview ? toScreen(currentEnd.x, currentEnd.y) : null;
  const previewPathD = p1Screen && p2Screen ? `M ${p1Screen.x} ${p1Screen.y} L ${p2Screen.x} ${p2Screen.y}` : "";

  const firstPoint = points[0];
  const lastPoint = points.length > 1 ? points[points.length - 1] : null;

  const committedLength = useMemo(
    () => segments.reduce((sum, s) => sum + Math.hypot(s.x2 - s.x1, s.y2 - s.y1), 0),
    [segments]
  );
  const currentLength =
    segmentStart && currentEnd ? Math.hypot(currentEnd.x - segmentStart.x, currentEnd.y - segmentStart.y) : 0;
  const totalLength = committedLength + currentLength;

  const popupCenter =
    hasSegments || hasPreview
      ? hasPreview && segmentStart && currentEnd
        ? {
            x: pan.x + ((segmentStart.x + currentEnd.x) / 2) * zoom,
            y: pan.y + ((segmentStart.y + currentEnd.y) / 2) * zoom,
          }
        : segments.length > 0
        ? {
            x: pan.x + segments[segments.length - 1].x2 * zoom,
            y: pan.y + segments[segments.length - 1].y2 * zoom,
          }
        : segmentStart
        ? { x: pan.x + segmentStart.x * zoom, y: pan.y + segmentStart.y * zoom }
        : null
      : null;

  const showBothLengths = hasPreview && totalLength > committedLength + 0.01;

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
      className={`cable-layer-overlay ruler-overlay${pendingSegments !== null ? " cable-layer-modal-open" : ""}`}
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
            stroke={CURRENT_CABLE_STROKE}
            strokeWidth={strokeWidthPx}
            strokeOpacity={CURRENT_CABLE_OPACITY}
            strokeDasharray={currentCableStrokeDasharray}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}
        {previewPathD && (
          <path
            d={previewPathD}
            fill="none"
            stroke={CURRENT_CABLE_STROKE}
            strokeWidth={strokeWidthPx}
            strokeOpacity={CURRENT_CABLE_OPACITY}
            strokeDasharray={currentCableStrokeDasharray}
            strokeLinecap="round"
          />
        )}
        {firstPoint && (
          <circle cx={firstPoint.x} cy={firstPoint.y} r={ENDPOINT_DOT_RADIUS_PX} className="cable-endpoint-dot" />
        )}
        {lastPoint && (
          <circle cx={lastPoint.x} cy={lastPoint.y} r={ENDPOINT_DOT_RADIUS_PX} className="cable-endpoint-dot" />
        )}
      </svg>
      {(hasSegments || hasPreview) && popupCenter && totalLength > 0 && (
        <div
          className="ruler-popup"
          style={{
            left: popupCenter.x,
            top: popupCenter.y - 6,
            transform: "translate(-50%, -100%)",
          }}
        >
          <div className="ruler-popup-row">
            <span>Length</span>
            <span>
              {showBothLengths
                ? `${formatLength(committedLength, unit)} (${formatLength(totalLength, unit)})`
                : formatLength(totalLength, unit)}
            </span>
          </div>
        </div>
      )}
      {(hasSegments || hasPreview) && (
        <div className="cable-layer-actions">
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
              title="Add cable (Enter). Stay in cable mode to draw more; double-tap to exit."
            >
              Add cable
            </button>
          </div>
          <p className="cable-layer-hint" aria-hidden>
            Draw another or double-tap to exit
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
