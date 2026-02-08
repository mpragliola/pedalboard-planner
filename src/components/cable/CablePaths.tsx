import { useEffect, useMemo, useRef, useState } from "react";
import { CABLE_TERMINAL_START_COLOR, CABLE_TERMINAL_END_COLOR } from "../../constants/cables";
import { buildRoundedPathD, buildSmoothPathD, DEFAULT_JOIN_RADIUS } from "../../lib/polylinePath";
import { vec2Add, vec2Length, vec2Normalize, vec2Scale, vec2Sub, type Offset, type Point } from "../../lib/vector";
import { snapToObjects } from "../../lib/snapToBoundingBox";
import { getObjectDimensions } from "../../lib/objectDimensions";
import { useBoard } from "../../context/BoardContext";
import { useCable } from "../../context/CableContext";
import { useCanvas } from "../../context/CanvasContext";
import { useCanvasCoords } from "../../hooks/useCanvasCoords";
import { useCablePhysics } from "../../hooks/useCablePhysics";
import type { Cable, CanvasObjectType } from "../../types";
import "./CablePaths.scss";

const CABLE_STROKE_WIDTH_MM = 5;
/** Extra stroke width for selected cable halo (mm), so halo = CABLE_STROKE_WIDTH_MM + 2 * HALO_EXTRA_MM. */
const HALO_EXTRA_MM = 4;
const SELECTED_CABLE_HALO_COLOR = "rgba(10, 132, 255, 0.7)";
const ENDPOINT_DOT_RADIUS = 4;
/** Canvas-space SVG extent (covers -CANVAS_HALF..CANVAS_HALF) so cables stay visible when panning. */
const CANVAS_HALF = 2500;
const CANVAS_SIZE = CANVAS_HALF * 2;

/** Hit area stroke width (mm) – invisible path for easier clicking. */
const HIT_STROKE_MM = 16;
const HANDLE_REMOVE_PRESS_MS = 600;

type DragState = {
  cableId: string;
  pointerId: number;
  points: Point[];
  handleIndex: number;
};

type PressState = {
  cableId: string;
  handleIndex: number;
};

type FlashPoint = {
  cableId: string;
  point: Point;
};

type HandleType = "start" | "mid" | "end";

/** Distance from anchor to connector label (mm). */
const LABEL_OFFSET_MM = 10;

/** Connector label position and text for one cable endpoint. */
interface ConnectorLabel {
  position: Point;
  text: string;
}

/** Compute connector label positions: opposite to the cable direction at each anchor. */
function connectorLabelsForCable(cable: Cable): { a: ConnectorLabel; b: ConnectorLabel } | null {
  const points = cable.segments;
  if (points.length < 2) return null;
  const firstStart = points[0];
  const firstEnd = points[1];
  const lastStart = points[points.length - 2];
  const lastEnd = points[points.length - 1];
  const firstVector = vec2Sub(firstEnd, firstStart);
  const lastVector = vec2Sub(lastEnd, lastStart);
  if (vec2Length(firstVector) < 1e-6 || vec2Length(lastVector) < 1e-6) return null;
  const firstDir = vec2Normalize(firstVector);
  const lastDir = vec2Normalize(lastVector);
  const aOffset: Offset = vec2Scale(firstDir, -LABEL_OFFSET_MM);
  const bOffset: Offset = vec2Scale(lastDir, LABEL_OFFSET_MM);
  const aPos = vec2Add(firstStart, aOffset);
  const bPos = vec2Add(lastEnd, bOffset);
  const textA = (cable.connectorAName ?? "").trim();
  const textB = (cable.connectorBName ?? "").trim();
  return {
    a: {
      position: aPos,
      text: textA,
    },
    b: {
      position: bPos,
      text: textB,
    },
  };
}

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
  const { canvasRef, zoom, pan, pausePanZoom } = useCanvas();
  const { clientToCanvas } = useCanvasCoords(canvasRef, zoom, pan);

  const dragRef = useRef<DragState | null>(null);
  const pressTimerRef = useRef<number | null>(null);
  const [pressingHandle, setPressingHandle] = useState<PressState | null>(null);
  const [flashPoint, setFlashPoint] = useState<FlashPoint | null>(null);
  const flashTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (flashTimerRef.current) window.clearTimeout(flashTimerRef.current);
    };
  }, []);

  const dragState = dragRef.current;
  const dragCableId = dragState?.cableId ?? null;
  const dragHandleIndex = dragState?.handleIndex ?? null;
  const dragPoints = dragState?.points ?? null;

  const dragSegA =
    dragPoints && dragHandleIndex !== null && dragHandleIndex > 0
      ? { start: dragPoints[dragHandleIndex - 1], end: dragPoints[dragHandleIndex] }
      : null;
  const dragSegB =
    dragPoints && dragHandleIndex !== null && dragHandleIndex < dragPoints.length - 1
      ? { start: dragPoints[dragHandleIndex + 1], end: dragPoints[dragHandleIndex] }
      : null;
  const dragSegBForPath =
    dragPoints && dragHandleIndex !== null && dragHandleIndex < dragPoints.length - 1
      ? { start: dragPoints[dragHandleIndex], end: dragPoints[dragHandleIndex + 1] }
      : null;

  const physicsPointsA = useCablePhysics(dragSegA?.start ?? null, dragSegA?.end ?? null, !!dragSegA);
  const physicsPointsB = useCablePhysics(dragSegB?.start ?? null, dragSegB?.end ?? null, !!dragSegB);

  const { paths, endpointDots, connectorLabels } = useMemo(() => {
    const joinRadius = DEFAULT_JOIN_RADIUS;
    const paths: { id: string; hitD: string; strokeDs: string[]; color: string }[] = [];
    const endpointDots: EndpointDot[] = [];
    const connectorLabels: { id: string; a: ConnectorLabel; b: ConnectorLabel }[] = [];

    const segmentPathD = (segment: { start: Point; end: Point } | null, physicsPoints: Point[]) => {
      if (!segment) return "";
      if (physicsPoints.length >= 2) return buildSmoothPathD(physicsPoints);
      return `M ${segment.start.x} ${segment.start.y} L ${segment.end.x} ${segment.end.y}`;
    };

    for (const cable of cables) {
      const points: Point[] = cable.segments;
      if (points.length < 2) continue;
      const isDraggedCable = cable.id === dragCableId && dragHandleIndex !== null && !!dragPoints;
      const activePoints = isDraggedCable ? (dragPoints as Point[]) : points;
      const hitD = buildRoundedPathD(activePoints, joinRadius);

      let strokeDs: string[] = [];
      if (isDraggedCable && dragHandleIndex !== null) {
        const beforePoints = activePoints.slice(0, dragHandleIndex);
        const afterPoints = activePoints.slice(dragHandleIndex + 1);
        if (beforePoints.length >= 2) strokeDs.push(buildRoundedPathD(beforePoints, joinRadius));
        strokeDs.push(segmentPathD(dragSegA, physicsPointsA));
        const physicsPointsBForPath = physicsPointsB.length >= 2 ? [...physicsPointsB].reverse() : physicsPointsB;
        strokeDs.push(segmentPathD(dragSegBForPath, physicsPointsBForPath));
        if (afterPoints.length >= 2) strokeDs.push(buildRoundedPathD(afterPoints, joinRadius));
        strokeDs = strokeDs.filter((d) => d.length > 0);
      } else {
        strokeDs = hitD ? [hitD] : [];
      }

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

  const nearestSegmentIndex = (cable: Cable, canvasPoint: Point): number | null => {
    if (cable.segments.length < 2) return null;
    let bestIdx = 0;
    let bestDist2 = Infinity;
    const points = cable.segments;
    for (let idx = 0; idx < points.length - 1; idx += 1) {
      const ax = points[idx].x;
      const ay = points[idx].y;
      const bx = points[idx + 1].x;
      const by = points[idx + 1].y;
      const dx = bx - ax;
      const dy = by - ay;
      const len2 = dx * dx + dy * dy;
      const t =
        len2 === 0
          ? 0
          : Math.max(0, Math.min(1, ((canvasPoint.x - ax) * dx + (canvasPoint.y - ay) * dy) / len2));
      const px = ax + t * dx;
      const py = ay + t * dy;
      const dist2 = (canvasPoint.x - px) ** 2 + (canvasPoint.y - py) ** 2;
      if (dist2 < bestDist2) {
        bestDist2 = dist2;
        bestIdx = idx;
      }
    }
    return bestDist2 === Infinity ? null : bestIdx;
  };

  const resolveCableIdFromEvent = (e: React.SyntheticEvent<Element>) => {
    const target = e.target as Element | null;
    const hit = target?.closest?.(".cable-hit-area") as SVGPathElement | null;
    return hit?.getAttribute("data-cable-id") ?? null;
  };

  const handleSegmentDoubleClick = (cableId: string, e: React.MouseEvent | React.PointerEvent) => {
    e.stopPropagation();
    if (!selectedCableId || selectedCableId !== cableId) return;
    const cable = cables.find((c) => c.id === cableId);
    if (!cable) return;
    const canvasPoint = clientToCanvas(e.clientX, e.clientY);
    const segIndex = nearestSegmentIndex(cable, canvasPoint);
    if (segIndex == null) return;
    const points: Point[] = cable.segments;
    const snapped =
      e.shiftKey || e.metaKey
        ? canvasPoint
        : snapToObjects(canvasPoint.x, canvasPoint.y, objects as CanvasObjectType[], getObjectDimensions);
    setFlashPoint({ cableId, point: snapped });
    if (flashTimerRef.current) window.clearTimeout(flashTimerRef.current);
    flashTimerRef.current = window.setTimeout(() => setFlashPoint(null), 300);
    const nextPoints = [...points.slice(0, segIndex + 1), snapped, ...points.slice(segIndex + 1)];
    setCables((prev) => prev.map((c) => (c.id === cableId ? { ...c, segments: normalizePoints(nextPoints) } : c)), true);
  };

  const handleSvgDoubleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const cableId = resolveCableIdFromEvent(e);
    if (cableId) handleSegmentDoubleClick(cableId, e);
  };


  const handleHandlePointerDown = (cableId: string, handleIndex: number, e: React.PointerEvent) => {
    e.stopPropagation();
    setSelectedCableId(cableId);
    const cable = cables.find((c) => c.id === cableId);
    if (!cable || cable.segments.length < 2) return;
    const points: Point[] = cable.segments;
    const isExtremity = handleIndex === 0 || handleIndex === points.length - 1;

    // Long-press removal
    if (pressTimerRef.current) {
      window.clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
    if (!isExtremity) {
      setPressingHandle({ cableId, handleIndex });
      pressTimerRef.current = window.setTimeout(() => {
        const nextPoints = points.filter((_, idx) => idx !== handleIndex);
        if (nextPoints.length < 2) return;
        dragRef.current = null;
        setPressingHandle(null);
        setCables((prev) => prev.map((c) => (c.id === cableId ? { ...c, segments: normalizePoints(nextPoints) } : c)), true);
        try {
          (e.target as Element).releasePointerCapture(e.pointerId);
        } catch {
          /* ignore */
        }
        pressTimerRef.current = null;
      }, HANDLE_REMOVE_PRESS_MS);
    }

    dragRef.current = { cableId, pointerId: e.pointerId, points, handleIndex };
    (e.target as Element).setPointerCapture(e.pointerId);

    const handlePointerMove = (ev: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || ev.pointerId !== drag.pointerId) return;
      if (pressTimerRef.current) {
        window.clearTimeout(pressTimerRef.current);
        pressTimerRef.current = null;
      }
      if (pressingHandle) setPressingHandle(null);
      pausePanZoom?.(true);
      const canvasPoint = clientToCanvas(ev.clientX, ev.clientY);
      const snapped =
        ev.shiftKey || ev.metaKey
          ? canvasPoint
          : snapToObjects(canvasPoint.x, canvasPoint.y, objects as CanvasObjectType[], getObjectDimensions);
      const nextPoints = drag.points.slice();
      nextPoints[drag.handleIndex] = snapped;
      dragRef.current = { ...drag, points: nextPoints };
      setCables((prev) => prev.map((c) => (c.id === drag.cableId ? { ...c, segments: normalizePoints(nextPoints) } : c)), false);
    };

    const handlePointerUp = (ev: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || ev.pointerId !== drag.pointerId) return;
      if (pressTimerRef.current) {
        window.clearTimeout(pressTimerRef.current);
        pressTimerRef.current = null;
      }
      if (pressingHandle) setPressingHandle(null);
      pausePanZoom?.(false);
      const finalPoints = drag.points;
      dragRef.current = null;
      setCables((prev) => prev.map((c) => (c.id === drag.cableId ? { ...c, segments: normalizePoints(finalPoints) } : c)), true);
      window.removeEventListener("pointermove", handlePointerMove, { capture: true });
      window.removeEventListener("pointerup", handlePointerUp, { capture: true });
      window.removeEventListener("pointercancel", handlePointerUp, { capture: true });
    };

    window.addEventListener("pointermove", handlePointerMove, { capture: true });
    window.addEventListener("pointerup", handlePointerUp, { capture: true });
    window.addEventListener("pointercancel", handlePointerUp, { capture: true });
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
      viewBox={`${-CANVAS_HALF} ${-CANVAS_HALF} ${CANVAS_SIZE} ${CANVAS_SIZE}`}
      preserveAspectRatio="none"
      style={{
        position: "absolute",
        left: -CANVAS_HALF,
        top: -CANVAS_HALF,
        width: CANVAS_SIZE,
        height: CANVAS_SIZE,
        pointerEvents: "none",
        zIndex: 1000,
        colorScheme: "normal",
        opacity,
      }}
      onDoubleClickCapture={handleSvgDoubleClick}
    >
      {flashPoint && (
        <circle
          cx={flashPoint.point.x}
          cy={flashPoint.point.y}
          r={6}
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
            strokeWidth={HIT_STROKE_MM}
            strokeLinejoin="round"
            strokeLinecap="round"
            className="cable-hit-area"
            data-cable-id={p.id}
            style={{ cursor: "pointer", pointerEvents: "stroke" }}
            onPointerDown={(e) => {
              // Skip drag/select when this is part of a double-click; let capture handler insert.
              if (e.detail >= 2) {
                e.stopPropagation();
                return;
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
                  stroke={SELECTED_CABLE_HALO_COLOR}
                  strokeWidth={CABLE_STROKE_WIDTH_MM + 2 * HALO_EXTRA_MM}
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
              strokeWidth={CABLE_STROKE_WIDTH_MM}
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
          r={ENDPOINT_DOT_RADIUS}
          className="cable-endpoint-dot"
          fill={dot.type === "start" ? CABLE_TERMINAL_START_COLOR : CABLE_TERMINAL_END_COLOR}
          stroke="rgba(0, 0, 0, 0.25)"
          strokeWidth="1"
        />
      ))}
      {handles.map(({ point, idx, type }) => {
        const handleFill =
          type === "start"
            ? CABLE_TERMINAL_START_COLOR
            : type === "end"
              ? CABLE_TERMINAL_END_COLOR
              : "rgba(255, 255, 255, 0.9)";
        return (
          <g key={`handle-${idx}`}>
            <circle
              cx={point.x}
              cy={point.y}
              r={7}
              className="cable-handle-halo"
              onPointerDown={(e) => handleHandlePointerDown(selectedCableId!, idx, e)}
              fill={handleFill}
            />
            <circle
              cx={point.x}
              cy={point.y}
              r={4}
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
              fill={handleFill}
            />
          </g>
        );
      })}
      {connectorLabels.map(({ id, a, b }) => (
        <g key={`labels-${id}`} className="cable-connector-labels" style={{ pointerEvents: "none" }}>
          {a.text ? (
            <text
              x={a.position.x}
              y={a.position.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="cable-connector-label"
            >
              {a.text}
            </text>
          ) : null}
          {b.text ? (
            <text
              x={b.position.x}
              y={b.position.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="cable-connector-label"
            >
              {b.text}
            </text>
          ) : null}
        </g>
      ))}
    </svg>
  );
}
