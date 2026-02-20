import { useEffect, useMemo, useRef, useState } from "react";
import { CONNECTOR_ICON_MAP } from "../../constants";
import { CABLE_TERMINAL_START_COLOR, CABLE_TERMINAL_END_COLOR } from "../../constants/cables";
import { DEFAULT_JOIN_RADIUS } from "../../lib/polylinePath";
import type { Point } from "../../lib/vector";
import { snapToObjects } from "../../lib/snapToBoundingBox";
import { getObjectDimensions } from "../../lib/objectDimensions";
import { connectorLabelsForCable, type ConnectorLabel } from "../../lib/cableConnectorLabels";
import { deriveCableDragState, type CableDragState } from "../../lib/cableDrag";
import { buildCablePathData } from "../../lib/cableStrokePaths";
import { nearestSegmentIndexForPoint } from "../../lib/cableGeometry";
import { useBoard } from "../../context/BoardContext";
import { useCable } from "../../context/CableContext";
import { useCanvas } from "../../context/CanvasContext";
import { useCanvasCoords } from "../../hooks/useCanvasCoords";
import { useCablePhysics } from "../../hooks/useCablePhysics";
import { useDragState } from "../../hooks/useDragState";
import {
  CABLE_PATHS_CANVAS_HALF,
  CABLE_PATHS_CANVAS_SIZE,
  CABLE_PATHS_DOUBLE_CLICK_DETAIL_THRESHOLD,
  CABLE_PATHS_DOUBLE_TAP_MAX_DISTANCE_PX,
  CABLE_PATHS_DOUBLE_TAP_TIME_WINDOW_MS,
  CABLE_PATHS_ENDPOINT_DOT_RADIUS_MM,
  CABLE_PATHS_ENDPOINT_DOT_STROKE,
  CABLE_PATHS_ENDPOINT_DOT_STROKE_WIDTH_MM,
  CABLE_PATHS_HANDLE_DOT_RADIUS_MM,
  CABLE_PATHS_HANDLE_DRAG_THRESHOLD_PX,
  CABLE_PATHS_HANDLE_HALO_RADIUS_MM,
  CABLE_PATHS_HANDLE_REMOVE_PRESS_MS,
  CABLE_PATHS_HALO_EXTRA_MM,
  CABLE_PATHS_HIT_STROKE_MM,
  CABLE_PATHS_INSERT_FLASH_DURATION_MS,
  CABLE_PATHS_INSERT_FLASH_RADIUS_MM,
  CABLE_PATHS_LABEL_ICON_SIZE_MM,
  CABLE_PATHS_MID_HANDLE_FILL,
  CABLE_PATHS_SELECTED_CABLE_HALO_COLOR,
  CABLE_PATHS_STROKE_WIDTH_MM,
  CABLE_PATHS_Z_INDEX,
} from "../../constants/cablePaths";
import type { Cable, CanvasObjectType } from "../../types";
import "./CablePaths.scss";

type PressState = {
  cableId: string;
  handleIndex: number;
};

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

/**
 * Renders cables in canvas (world) coordinates inside the viewport so they
 * pan and zoom smoothly with the same CSS transform as the rest of the canvas.
 */
export function CablePaths({ cables, visible, opacity = 1, selectedCableId, onCablePointerDown }: CablePathsProps) {
  const { objects } = useBoard();
  const { setCables, setSelectedCableId } = useCable();
  const { canvasRef, zoom, pan, pausePanZoom, spaceDown } = useCanvas();
  const { clientToCanvas } = useCanvasCoords(canvasRef, zoom, pan);

  const dragRef = useRef<CableDragState | null>(null);
  const pressTimerRef = useRef<number | null>(null);
  const [pressingHandle, setPressingHandle] = useState<PressState | null>(null);
  const [flashPoint, setFlashPoint] = useState<FlashPoint | null>(null);
  const flashTimerRef = useRef<number | null>(null);
  const pendingHandleIndexRef = useRef<number | null>(null);
  const lastCableTapRef = useRef<LastCableTap | null>(null);

  const clearHandlePress = () => {
    if (pressTimerRef.current) {
      window.clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
    setPressingHandle(null);
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

  const normalizePoints = (points: Point[]) => points;

  const { handleDragStart: handleHandleDragStart, clearDragState: clearHandleDragState } = useDragState<{
    points: Point[];
    handleIndex: number;
  }>({
    zoom,
    spaceDown,
    thresholdPx: CABLE_PATHS_HANDLE_DRAG_THRESHOLD_PX,
    activateOnStart: false,
    getPendingPayload: (id) => {
      const handleIndex = pendingHandleIndexRef.current;
      pendingHandleIndexRef.current = null;
      if (handleIndex === null) return null;
      const cable = cables.find((c) => c.id === id);
      if (!cable || cable.segments.length < 2) return null;
      return { points: cable.segments, handleIndex };
    },
    onDragActivated: ({ pending, event }) => {
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
      const snapped =
        event.shiftKey || event.metaKey
          ? canvasPoint
          : snapToObjects(canvasPoint.x, canvasPoint.y, objects as CanvasObjectType[], getObjectDimensions);
      const nextPoints = drag.points.slice();
      nextPoints[drag.handleIndex] = snapped;
      dragRef.current = { ...drag, points: nextPoints };
      setCables((prev) => prev.map((c) => (c.id === drag.cableId ? { ...c, segments: normalizePoints(nextPoints) } : c)), false);
    },
    onDragEnd: () => {
      clearHandlePress();
      pausePanZoom?.(false);
      const drag = dragRef.current;
      if (!drag) return;
      const finalPoints = drag.points;
      dragRef.current = null;
      setCables((prev) => prev.map((c) => (c.id === drag.cableId ? { ...c, segments: normalizePoints(finalPoints) } : c)), true);
    },
  });

  const handleSegmentDoubleClick = (cableId: string, e: React.MouseEvent | React.PointerEvent): boolean => {
    e.stopPropagation();
    if (!selectedCableId || selectedCableId !== cableId) return false;
    const cable = cables.find((c) => c.id === cableId);
    if (!cable) return false;
    const canvasPoint = clientToCanvas(e.clientX, e.clientY);
    const segIndex = nearestSegmentIndexForPoint(cable.segments, canvasPoint);
    if (segIndex == null) return false;
    const points: Point[] = cable.segments;
    const snapped =
      e.shiftKey || e.metaKey
        ? canvasPoint
        : snapToObjects(canvasPoint.x, canvasPoint.y, objects as CanvasObjectType[], getObjectDimensions);
    setFlashPoint({ cableId, point: snapped });
    if (flashTimerRef.current) window.clearTimeout(flashTimerRef.current);
    flashTimerRef.current = window.setTimeout(
      () => setFlashPoint(null),
      CABLE_PATHS_INSERT_FLASH_DURATION_MS
    );
    const nextPoints = [...points.slice(0, segIndex + 1), snapped, ...points.slice(segIndex + 1)];
    setCables((prev) => prev.map((c) => (c.id === cableId ? { ...c, segments: normalizePoints(nextPoints) } : c)), true);
    return true;
  };

  const handleTouchSegmentTap = (cableId: string, e: React.PointerEvent): boolean => {
    const now = performance.now();
    const prevTap = lastCableTapRef.current;
    if (
      prevTap &&
      prevTap.cableId === cableId &&
      now - prevTap.time <= CABLE_PATHS_DOUBLE_TAP_TIME_WINDOW_MS &&
      Math.hypot(e.clientX - prevTap.x, e.clientY - prevTap.y) <= CABLE_PATHS_DOUBLE_TAP_MAX_DISTANCE_PX
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
    const cable = cables.find((c) => c.id === cableId);
    if (!cable || cable.segments.length < 2) return;
    const points: Point[] = cable.segments;
    const isExtremity = handleIndex === 0 || handleIndex === points.length - 1;

    // Long-press removal
    clearHandlePress();
    if (!isExtremity) {
      setPressingHandle({ cableId, handleIndex });
      pressTimerRef.current = window.setTimeout(() => {
        const nextPoints = points.filter((_, idx) => idx !== handleIndex);
        if (nextPoints.length < 2) return;
        dragRef.current = null;
        clearHandleDragState();
        clearHandlePress();
        setCables((prev) => prev.map((c) => (c.id === cableId ? { ...c, segments: normalizePoints(nextPoints) } : c)), true);
        try {
          (e.target as Element).releasePointerCapture(e.pointerId);
        } catch {
          /* ignore */
        }
      }, CABLE_PATHS_HANDLE_REMOVE_PRESS_MS);
    }

    pendingHandleIndexRef.current = handleIndex;
    (e.target as Element).setPointerCapture(e.pointerId);
    handleHandleDragStart(cableId, e);
  };

  const handleHandlePointerRelease = (e: React.PointerEvent) => {
    e.stopPropagation();
    clearHandlePress();
    try {
      (e.currentTarget as Element).releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  if (!visible || cables.length === 0) return null;

  const handles =
    selectedCableId && cables.find((c) => c.id === selectedCableId)
      ? (() => {
          const c = cables.find((cable) => cable.id === selectedCableId)!;
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
      viewBox={`${-CABLE_PATHS_CANVAS_HALF} ${-CABLE_PATHS_CANVAS_HALF} ${CABLE_PATHS_CANVAS_SIZE} ${CABLE_PATHS_CANVAS_SIZE}`}
      preserveAspectRatio="none"
      style={{
        position: "absolute",
        left: -CABLE_PATHS_CANVAS_HALF,
        top: -CABLE_PATHS_CANVAS_HALF,
        width: CABLE_PATHS_CANVAS_SIZE,
        height: CABLE_PATHS_CANVAS_SIZE,
        pointerEvents: "none",
        zIndex: CABLE_PATHS_Z_INDEX,
        colorScheme: "normal",
        opacity,
      }}
    >
      {flashPoint && (
        <circle
          cx={flashPoint.point.x}
          cy={flashPoint.point.y}
          r={CABLE_PATHS_INSERT_FLASH_RADIUS_MM}
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
            strokeWidth={CABLE_PATHS_HIT_STROKE_MM}
            strokeLinejoin="round"
            strokeLinecap="round"
            className="cable-hit-area"
            data-cable-id={p.id}
            style={{ cursor: "pointer", pointerEvents: "stroke" }}
            onPointerDown={(e) => {
              if (e.pointerType === "touch") {
                if (handleTouchSegmentTap(p.id, e)) return;
              } else if (e.detail >= CABLE_PATHS_DOUBLE_CLICK_DETAIL_THRESHOLD) {
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
                  stroke={CABLE_PATHS_SELECTED_CABLE_HALO_COLOR}
                  strokeWidth={CABLE_PATHS_STROKE_WIDTH_MM + 2 * CABLE_PATHS_HALO_EXTRA_MM}
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
              strokeWidth={CABLE_PATHS_STROKE_WIDTH_MM}
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
          r={CABLE_PATHS_ENDPOINT_DOT_RADIUS_MM}
          className="cable-endpoint-dot"
          fill={dot.type === "start" ? CABLE_TERMINAL_START_COLOR : CABLE_TERMINAL_END_COLOR}
          stroke={CABLE_PATHS_ENDPOINT_DOT_STROKE}
          strokeWidth={CABLE_PATHS_ENDPOINT_DOT_STROKE_WIDTH_MM}
        />
      ))}
      {handles.map(({ point, idx, type }) => {
        const handleFill =
          type === "start"
            ? CABLE_TERMINAL_START_COLOR
            : type === "end"
              ? CABLE_TERMINAL_END_COLOR
              : CABLE_PATHS_MID_HANDLE_FILL;
        return (
          <g key={`handle-${idx}`}>
            <circle
              cx={point.x}
              cy={point.y}
              r={CABLE_PATHS_HANDLE_HALO_RADIUS_MM}
              className="cable-handle-halo"
              onPointerDown={(e) => handleHandlePointerDown(selectedCableId!, idx, e)}
              onPointerUp={handleHandlePointerRelease}
              onPointerCancel={handleHandlePointerRelease}
              fill={handleFill}
            />
            <circle
              cx={point.x}
              cy={point.y}
              r={CABLE_PATHS_HANDLE_DOT_RADIUS_MM}
              className={[
                "cable-handle-dot",
                `cable-handle-dot--${type}`,
                pressingHandle && pressingHandle.cableId === selectedCableId && pressingHandle.handleIndex === idx
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
                width={CABLE_PATHS_LABEL_ICON_SIZE_MM}
                height={CABLE_PATHS_LABEL_ICON_SIZE_MM}
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
                width={CABLE_PATHS_LABEL_ICON_SIZE_MM}
                height={CABLE_PATHS_LABEL_ICON_SIZE_MM}
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
