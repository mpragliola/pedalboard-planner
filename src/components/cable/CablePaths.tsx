import { useEffect, useMemo, useRef, useState } from "react";
import { CONNECTOR_ICON_MAP } from "../../constants";
import { CABLE_TERMINAL_START_COLOR, CABLE_TERMINAL_END_COLOR } from "../../constants/cables";
import { DEFAULT_JOIN_RADIUS } from "../../lib/polylinePath";
import { tryReleasePointerCapture, trySetPointerCapture } from "../../lib/pointerCapture";
import { isDoubleTapWithinThreshold } from "../../lib/tapGesture";
import type { Point } from "../../lib/vector";
import { connectorLabelsForCable, type ConnectorLabel } from "../../lib/cableConnectorLabels";
import { deriveCableDragState, type CableDragState } from "../../lib/cableDrag";
import { buildCablePathData } from "../../lib/cableStrokePaths";
import { nearestSegmentIndexForPoint } from "../../lib/cableGeometry";
import {
  createConditionalSnapStrategy,
  createIdentitySnapStrategy,
  createObjectSnapStrategy,
  type ModifierSnapContext,
  type ObjectSnapContext,
} from "../../lib/snapStrategies";
import { useBoard } from "../../context/BoardContext";
import { useCable } from "../../context/CableContext";
import { useCanvas } from "../../context/CanvasContext";
import { useSelection } from "../../context/SelectionContext";
import { useTemplateService } from "../../context/TemplateServiceContext";
import { useCanvasCoords } from "../../hooks/useCanvasCoords";
import { useCablePhysics } from "../../hooks/useCablePhysics";
import { useDragState } from "../../hooks/useDragState";
import {
  IDLE_CABLE_HANDLE_INTERACTION_STATE,
  consumeCableHandlePending,
  isCableHandlePressing,
  startCableHandleInteraction,
  type CableHandleInteractionState,
} from "./cableHandleInteractionStateMachine";
import * as CP from "../../constants/cablePaths";
import type { Cable } from "../../types";
import "./CablePaths.scss";

type FlashPoint = {
  cableId: string;
  point: Point;
};

type LastCableTap = {
  cableId: string;
  time: number;
  x: number;
  y: number;
};

type HandleType = "start" | "mid" | "end";
interface EndpointDot {
  point: Point;
  type: "start" | "end";
}

interface CablePathsProps {
  cables: Cable[];
  visible: boolean;
  opacity?: number;
  selectedCableId: string | null;
  onCablePointerDown: (id: string, e: React.PointerEvent) => void;
}

type CablePathsSnapContext = ModifierSnapContext & ObjectSnapContext;

/**
 * Renders cables in canvas (world) coordinates inside the viewport so they
 * pan and zoom smoothly with the same CSS transform as the rest of the canvas.
 */
export function CablePaths({ cables, visible, opacity = 1, selectedCableId, onCablePointerDown }: CablePathsProps) {
  const { objects } = useBoard();
  const { setCablesWithHistory, setCablesSilent } = useCable();
  const templateService = useTemplateService();
  const { setSelectedCableId } = useSelection();
  const { canvasRef, zoom, pan, pausePanZoom, spaceDown } = useCanvas();
  const { clientToCanvas } = useCanvasCoords(canvasRef, zoom, pan);
  // Shared cable snap policy:
  // - SHIFT or META bypasses snapping
  // - default path snaps to nearest object boundary
  const snapStrategy = useMemo(
    () =>
      createConditionalSnapStrategy<CablePathsSnapContext>(
        (context) => context.shiftKey || Boolean(context.metaKey),
        createIdentitySnapStrategy<CablePathsSnapContext>(),
        createObjectSnapStrategy<CablePathsSnapContext>()
      ),
    []
  );
  const resolveCableSnapPoint = (point: Point, shiftKey: boolean, metaKey: boolean) =>
    snapStrategy.snap(point, {
      shiftKey,
      metaKey,
      objects,
      getObjectDimensions: templateService.getObjectDimensions,
    });

  const dragRef = useRef<CableDragState | null>(null);
  const pressTimerRef = useRef<number | null>(null);
  const [handleInteraction, setHandleInteraction] = useState<CableHandleInteractionState>(
    IDLE_CABLE_HANDLE_INTERACTION_STATE
  );
  const handleInteractionRef = useRef<CableHandleInteractionState>(IDLE_CABLE_HANDLE_INTERACTION_STATE);
  const [flashPoint, setFlashPoint] = useState<FlashPoint | null>(null);
  const flashTimerRef = useRef<number | null>(null);
  const lastCableTapRef = useRef<LastCableTap | null>(null);

  const commitHandleInteraction = (nextState: CableHandleInteractionState) => {
    // Keep ref/state in lockstep:
    // - ref for synchronous reads inside pointer/drag callbacks
    // - state for rendering pressed-handle visual feedback
    handleInteractionRef.current = nextState;
    setHandleInteraction(nextState);
  };

  const clearHandlePress = () => {
    if (pressTimerRef.current) {
      window.clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
    // Reset to explicit idle when press/drag gesture ends or is canceled.
    commitHandleInteraction(IDLE_CABLE_HANDLE_INTERACTION_STATE);
  };

  useEffect(() => {
    return () => {
      if (flashTimerRef.current) window.clearTimeout(flashTimerRef.current);
      if (pressTimerRef.current) window.clearTimeout(pressTimerRef.current);
    };
  }, []);

  const { dragCableId, dragHandleIndex, dragPoints, dragSegA, dragSegB, dragSegBForPath } =
    deriveCableDragState(dragRef.current);

  const physicsPointsA = useCablePhysics(dragSegA?.start ?? null, dragSegA?.end ?? null, !!dragSegA);
  const physicsPointsB = useCablePhysics(dragSegB?.start ?? null, dragSegB?.end ?? null, !!dragSegB);

  const cableMap = useMemo(() => new Map(cables.map((c) => [c.id, c])), [cables]);

  const { paths, endpointDots, connectorLabels } = useMemo(() => {
    const joinRadius = DEFAULT_JOIN_RADIUS;
    const paths: { id: string; hitD: string; strokeDs: string[]; color: string }[] = [];
    const endpointDots: EndpointDot[] = [];
    const connectorLabels: { id: string; a: ConnectorLabel; b: ConnectorLabel }[] = [];

    for (const cable of cables) {
      const points: Point[] = cable.segments;
      if (points.length < 2) continue;
      const isDraggedCable = cable.id === dragCableId && dragHandleIndex !== null && !!dragPoints;
      const activePoints = isDraggedCable ? (dragPoints as Point[]) : points;
      const { hitD, strokeDs } = buildCablePathData({
        activePoints,
        joinRadius,
        isDraggedCable,
        dragHandleIndex,
        dragSegA,
        dragSegBForPath,
        physicsPointsA,
        physicsPointsB,
      });

      paths.push({ id: cable.id, hitD, strokeDs, color: cable.color });
      const labels = connectorLabelsForCable(cable);
      if (labels) connectorLabels.push({ id: cable.id, ...labels });
      const first = activePoints[0];
      const last = activePoints[activePoints.length - 1];
      endpointDots.push({ point: first, type: "start" });
      endpointDots.push({ point: last, type: "end" });
    }

    return { paths, endpointDots, connectorLabels };
  }, [
    cables,
    dragCableId,
    dragHandleIndex,
    dragPoints,
    dragSegA,
    dragSegB,
    dragSegBForPath,
    physicsPointsA,
    physicsPointsB,
  ]);

  const { handleDragStart: handleHandleDragStart, clearDragState: clearHandleDragState } = useDragState<{
    points: Point[];
    handleIndex: number;
  }>({
    zoom,
    spaceDown,
    thresholdPx: CP.CABLE_PATHS_HANDLE_DRAG_THRESHOLD_PX,
    activateOnStart: false,
    getPendingPayload: (id) => {
      // Pending payload is one-shot per pointer-down and encoded in explicit interaction state.
      const { nextState, payload } = consumeCableHandlePending(handleInteractionRef.current, id);
      if (nextState !== handleInteractionRef.current) {
        commitHandleInteraction(nextState);
      }
      return payload;
    },
    onDragActivated: ({ pending, event }) => {
      // Once drag is activated, the pending long-press delete timer must be canceled
      // immediately. Waiting until onDragMove can still allow timeout firing during drag.
      // This closes the race where "press-to-delete" could remove a node after drag start.
      clearHandlePress();
      dragRef.current = { cableId: pending.id, points: pending.payload.points, handleIndex: pending.payload.handleIndex };
      return {
        mouse: { x: event.clientX, y: event.clientY },
        payload: { points: pending.payload.points, handleIndex: pending.payload.handleIndex },
      };
    },
    onDragMove: ({ event }) => {
      const drag = dragRef.current;
      if (!drag) return;
      clearHandlePress();
      pausePanZoom?.(true);
      const canvasPoint = clientToCanvas(event.clientX, event.clientY);
      const snapped = resolveCableSnapPoint(canvasPoint, event.shiftKey, event.metaKey);
      const nextPoints = drag.points.slice();
      nextPoints[drag.handleIndex] = snapped;
      dragRef.current = { ...drag, points: nextPoints };
      setCablesSilent((prev) => prev.map((c) => (c.id === drag.cableId ? { ...c, segments: nextPoints } : c)));
    },
    onDragEnd: () => {
      clearHandlePress();
      pausePanZoom?.(false);
      const drag = dragRef.current;
      if (!drag) return;
      const finalPoints = drag.points;
      dragRef.current = null;
      setCablesWithHistory((prev) => prev.map((c) => (c.id === drag.cableId ? { ...c, segments: finalPoints } : c)));
    },
  });

  const handleSegmentDoubleClick = (cableId: string, e: React.MouseEvent | React.PointerEvent): boolean => {
    e.stopPropagation();
    if (!selectedCableId || selectedCableId !== cableId) return false;
    const cable = cableMap.get(cableId);
    if (!cable) return false;
    const canvasPoint = clientToCanvas(e.clientX, e.clientY);
    const segIndex = nearestSegmentIndexForPoint(cable.segments, canvasPoint);
    if (segIndex == null) return false;
    const points: Point[] = cable.segments;
    const snapped = resolveCableSnapPoint(canvasPoint, e.shiftKey, e.metaKey);
    setFlashPoint({ cableId, point: snapped });
    if (flashTimerRef.current) window.clearTimeout(flashTimerRef.current);
    flashTimerRef.current = window.setTimeout(
      () => setFlashPoint(null),
      CP.CABLE_PATHS_INSERT_FLASH_DURATION_MS
    );
    const nextPoints = [...points.slice(0, segIndex + 1), snapped, ...points.slice(segIndex + 1)];
    setCablesWithHistory((prev) => prev.map((c) => (c.id === cableId ? { ...c, segments: nextPoints } : c)));
    return true;
  };

  const handleTouchSegmentTap = (cableId: string, e: React.PointerEvent): boolean => {
    const now = performance.now();
    const prevTap = lastCableTapRef.current;
    // Double-tap insertion is cable-local: two taps on different cables should not pair.
    const isSameCable = prevTap?.cableId === cableId;
    const isDoubleTapOnCable =
      isSameCable &&
      // Shared detector centralizes threshold math; this component only supplies policy values.
      isDoubleTapWithinThreshold(
        prevTap ? { time: prevTap.time, x: prevTap.x, y: prevTap.y } : null,
        { time: now, x: e.clientX, y: e.clientY },
        {
          windowMs: CP.CABLE_PATHS_DOUBLE_TAP_TIME_WINDOW_MS,
          maxDistancePx: CP.CABLE_PATHS_DOUBLE_TAP_MAX_DISTANCE_PX,
        }
      );
    if (
      isDoubleTapOnCable
    ) {
      lastCableTapRef.current = null;
      return handleSegmentDoubleClick(cableId, e);
    }
    lastCableTapRef.current = { cableId, time: now, x: e.clientX, y: e.clientY };
    return false;
  };
  const handleHandlePointerDown = (cableId: string, handleIndex: number, e: React.PointerEvent) => {
    e.stopPropagation();
    setSelectedCableId(cableId);
    const cable = cableMap.get(cableId);
    if (!cable || cable.segments.length < 2) return;
    const points: Point[] = cable.segments;
    const isExtremity = handleIndex === 0 || handleIndex === points.length - 1;

    // Long-press removal
    clearHandlePress();
    commitHandleInteraction(
      startCableHandleInteraction({
        cableId,
        handleIndex,
        points,
        isExtremity,
      })
    );
    if (!isExtremity) {
      pressTimerRef.current = window.setTimeout(() => {
        const nextPoints = points.filter((_, idx) => idx !== handleIndex);
        if (nextPoints.length < 2) return;
        dragRef.current = null;
        clearHandleDragState();
        clearHandlePress();
        setCablesWithHistory((prev) => prev.map((c) => (c.id === cableId ? { ...c, segments: nextPoints } : c)));
        tryReleasePointerCapture(e.target as Element, e.pointerId);
      }, CP.CABLE_PATHS_HANDLE_REMOVE_PRESS_MS);
    }

    trySetPointerCapture(e.target as Element, e.pointerId);
    handleHandleDragStart(cableId, e);
  };

  const handleHandlePointerRelease = (e: React.PointerEvent) => {
    e.stopPropagation();
    clearHandlePress();
    tryReleasePointerCapture(e.currentTarget as Element, e.pointerId);
  };

  if (!visible || cables.length === 0) return null;

  const handles =
    selectedCableId && cableMap.has(selectedCableId)
      ? (() => {
          const c = cableMap.get(selectedCableId)!;
          const pts: Point[] = c.segments;
          return pts.map((p, idx) => ({
            point: p,
            idx,
            type: idx === 0 ? ("start" as HandleType) : idx === pts.length - 1 ? ("end" as HandleType) : ("mid" as HandleType),
          }));
        })()
      : [];

  return (
    <svg
      className="cable-paths-svg"
      viewBox={`${-CP.CABLE_PATHS_CANVAS_HALF} ${-CP.CABLE_PATHS_CANVAS_HALF} ${CP.CABLE_PATHS_CANVAS_SIZE} ${CP.CABLE_PATHS_CANVAS_SIZE}`}
      preserveAspectRatio="none"
      style={{
        position: "absolute",
        left: -CP.CABLE_PATHS_CANVAS_HALF,
        top: -CP.CABLE_PATHS_CANVAS_HALF,
        width: CP.CABLE_PATHS_CANVAS_SIZE,
        height: CP.CABLE_PATHS_CANVAS_SIZE,
        pointerEvents: "none",
        zIndex: CP.CABLE_PATHS_Z_INDEX,
        colorScheme: "normal",
        opacity,
      }}
    >
      {flashPoint && (
        <circle
          cx={flashPoint.point.x}
          cy={flashPoint.point.y}
          r={CP.CABLE_PATHS_INSERT_FLASH_RADIUS_MM}
          className="cable-insert-flash"
          pointerEvents="none"
        />
      )}
      {paths.map((p) => (
        <g key={p.id}>
          {/* Invisible wide stroke for hit area */}
          <path
            d={p.hitD}
            fill="none"
            stroke="transparent"
            strokeWidth={CP.CABLE_PATHS_HIT_STROKE_MM}
            strokeLinejoin="round"
            strokeLinecap="round"
            className="cable-hit-area"
            data-cable-id={p.id}
            style={{ cursor: "pointer", pointerEvents: "stroke" }}
            onPointerDown={(e) => {
              if (e.pointerType === "touch") {
                if (handleTouchSegmentTap(p.id, e)) return;
              } else if (e.detail >= CP.CABLE_PATHS_DOUBLE_CLICK_DETAIL_THRESHOLD) {
                if (handleSegmentDoubleClick(p.id, e)) return;
              }
              onCablePointerDown(p.id, e);
            }}
          />
          {/* Thicker stroke behind cable when selected – always visible, no filter */}
          {selectedCableId === p.id && (
            <>
              {p.strokeDs.map((d, idx) => (
                <path
                  key={`halo-${p.id}-${idx}`}
                  d={d}
                  fill="none"
                  stroke={CP.CABLE_PATHS_SELECTED_CABLE_HALO_COLOR}
                  strokeWidth={CP.CABLE_PATHS_STROKE_WIDTH_MM + 2 * CP.CABLE_PATHS_HALO_EXTRA_MM}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  style={{ pointerEvents: "none" }}
                />
              ))}
            </>
          )}
          {p.strokeDs.map((d, idx) => (
            <path
              key={`stroke-${p.id}-${idx}`}
              d={d}
              fill="none"
              stroke={p.color}
              strokeWidth={CP.CABLE_PATHS_STROKE_WIDTH_MM}
              strokeLinejoin="round"
              strokeLinecap="round"
              style={{ pointerEvents: "none" }}
            />
          ))}
        </g>
      ))}
      {endpointDots.map((dot, i) => (
        <circle
          key={i}
          cx={dot.point.x}
          cy={dot.point.y}
          r={CP.CABLE_PATHS_ENDPOINT_DOT_RADIUS_MM}
          className="cable-endpoint-dot"
          fill={dot.type === "start" ? CABLE_TERMINAL_START_COLOR : CABLE_TERMINAL_END_COLOR}
          stroke={CP.CABLE_PATHS_ENDPOINT_DOT_STROKE}
          strokeWidth={CP.CABLE_PATHS_ENDPOINT_DOT_STROKE_WIDTH_MM}
        />
      ))}
      {handles.map(({ point, idx, type }) => {
        const handleFill =
          type === "start"
            ? CABLE_TERMINAL_START_COLOR
            : type === "end"
              ? CABLE_TERMINAL_END_COLOR
              : CP.CABLE_PATHS_MID_HANDLE_FILL;
        return (
          <g key={`handle-${idx}`}>
            <circle
              cx={point.x}
              cy={point.y}
              r={CP.CABLE_PATHS_HANDLE_HALO_RADIUS_MM}
              className="cable-handle-halo"
              onPointerDown={(e) => handleHandlePointerDown(selectedCableId!, idx, e)}
              onPointerUp={handleHandlePointerRelease}
              onPointerCancel={handleHandlePointerRelease}
              fill={handleFill}
            />
            <circle
              cx={point.x}
              cy={point.y}
              r={CP.CABLE_PATHS_HANDLE_DOT_RADIUS_MM}
              className={[
                "cable-handle-dot",
                `cable-handle-dot--${type}`,
                selectedCableId &&
                isCableHandlePressing(handleInteraction, selectedCableId, idx)
                  ? "cable-handle-dot--pressing"
                  : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onPointerDown={(e) => handleHandlePointerDown(selectedCableId!, idx, e)}
              onPointerUp={handleHandlePointerRelease}
              onPointerCancel={handleHandlePointerRelease}
              fill={handleFill}
            />
          </g>
        );
      })}
      {connectorLabels.map(({ id, a, b }) => (
        <g key={`labels-${id}`} className="cable-connector-labels" style={{ pointerEvents: "none" }}>
          {a.text ? (
            <g className="cable-connector-label-group">
              <text
                x={a.labelPosition.x}
                y={a.labelPosition.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="cable-connector-label"
              >
                {a.text}
              </text>
              <image
                href={CONNECTOR_ICON_MAP[a.kind]}
                x={a.iconPosition.x}
                y={a.iconPosition.y}
                width={CP.CABLE_PATHS_LABEL_ICON_SIZE_MM}
                height={CP.CABLE_PATHS_LABEL_ICON_SIZE_MM}
                preserveAspectRatio="xMidYMid meet"
                className="cable-connector-label-icon"
              />
            </g>
          ) : null}
          {b.text ? (
            <g className="cable-connector-label-group">
              <text
                x={b.labelPosition.x}
                y={b.labelPosition.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="cable-connector-label"
              >
                {b.text}
              </text>
              <image
                href={CONNECTOR_ICON_MAP[b.kind]}
                x={b.iconPosition.x}
                y={b.iconPosition.y}
                width={CP.CABLE_PATHS_LABEL_ICON_SIZE_MM}
                height={CP.CABLE_PATHS_LABEL_ICON_SIZE_MM}
                preserveAspectRatio="xMidYMid meet"
                className="cable-connector-label-icon"
              />
            </g>
          ) : null}
        </g>
      ))}
    </svg>
  );
}
