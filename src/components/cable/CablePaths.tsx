import { useMemo } from "react";
import { CABLE_TERMINAL_START_COLOR, CABLE_TERMINAL_END_COLOR } from "../../constants/cables";
import { buildRoundedPathD, DEFAULT_JOIN_RADIUS } from "../../lib/polylinePath";
import { vec2Add, vec2Length, vec2Normalize, vec2Scale, vec2Sub, type Offset, type Point } from "../../lib/vector";
import type { Cable } from "../../types";
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

/** Distance from anchor to connector label (mm). */
const LABEL_OFFSET_MM = 10;

/** Connector label position and text for one cable endpoint. */
interface ConnectorLabel {
  position: Point;
  text: string;
}

/** Compute connector label positions: opposite to the cable direction at each anchor. */
function connectorLabelsForCable(cable: Cable): { a: ConnectorLabel; b: ConnectorLabel } | null {
  const segs = cable.segments;
  if (segs.length === 0) return null;
  const first = segs[0];
  const last = segs[segs.length - 1];
  const firstStart: Point = { x: first.x1, y: first.y1 };
  const firstEnd: Point = { x: first.x2, y: first.y2 };
  const lastStart: Point = { x: last.x1, y: last.y1 };
  const lastEnd: Point = { x: last.x2, y: last.y2 };
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
  selectedCableId: string | null;
  onCablePointerDown: (id: string, e: React.PointerEvent) => void;
}

/**
 * Renders cables in canvas (world) coordinates inside the viewport so they
 * pan and zoom smoothly with the same CSS transform as the rest of the canvas.
 */
export function CablePaths({ cables, visible, selectedCableId, onCablePointerDown }: CablePathsProps) {
  const { paths, endpointDots, connectorLabels } = useMemo(() => {
    const joinRadius = DEFAULT_JOIN_RADIUS;
    const paths: { id: string; d: string; color: string }[] = [];
    const endpointDots: EndpointDot[] = [];
    const connectorLabels: { id: string; a: ConnectorLabel; b: ConnectorLabel }[] = [];

    for (const cable of cables) {
      if (cable.segments.length === 0) continue;
      const points: Point[] = [
        { x: cable.segments[0].x1, y: cable.segments[0].y1 },
        ...cable.segments.map((segment) => ({ x: segment.x2, y: segment.y2 })),
      ];
      const d = buildRoundedPathD(points, joinRadius);
      paths.push({ id: cable.id, d, color: cable.color });
      const labels = connectorLabelsForCable(cable);
      if (labels) connectorLabels.push({ id: cable.id, ...labels });
      const first = points[0];
      const last = points[points.length - 1];
      endpointDots.push({ point: first, type: "start" });
      endpointDots.push({ point: last, type: "end" });
    }

    return { paths, endpointDots, connectorLabels };
  }, [cables]);

  if (!visible || cables.length === 0) return null;

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
        pointerEvents: visible ? "stroke" : "none",
        zIndex: 1000,
        colorScheme: "normal",
      }}
    >
      {paths.map((p) => (
        <g key={p.id}>
          {/* Invisible wide stroke for hit area */}
          <path
            d={p.d}
            fill="none"
            stroke="transparent"
            strokeWidth={HIT_STROKE_MM}
            strokeLinejoin="round"
            strokeLinecap="round"
            style={{ cursor: "pointer" }}
            onPointerDown={(e) => onCablePointerDown(p.id, e)}
          />
          {/* Thicker stroke behind cable when selected – always visible, no filter */}
          {selectedCableId === p.id && (
            <path
              d={p.d}
              fill="none"
              stroke={SELECTED_CABLE_HALO_COLOR}
              strokeWidth={CABLE_STROKE_WIDTH_MM + 2 * HALO_EXTRA_MM}
              strokeLinejoin="round"
              strokeLinecap="round"
              style={{ pointerEvents: "none" }}
            />
          )}
          <path
            d={p.d}
            fill="none"
            stroke={p.color}
            strokeWidth={CABLE_STROKE_WIDTH_MM}
            strokeLinejoin="round"
            strokeLinecap="round"
            style={{ pointerEvents: "none" }}
          />
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
