import { CABLE_TERMINAL_END_COLOR, CABLE_TERMINAL_START_COLOR } from "../../constants/cables";
import { formatLength } from "../../lib/rulerFormat";
import type { Vec2 } from "../../lib/vector";
import * as CLO from "../../constants/cableLayerOverlay";

interface CableLayerSurfaceProps {
  committedPathD: string;
  previewPathD: string;
  strokeWidthPx: number;
  currentCableStrokeDasharray: string;
  firstPoint?: Vec2;
  lastPoint: Vec2 | null;
  hasSegments: boolean;
  hasPreview: boolean;
  popupCenter: Vec2 | null;
  totalLength: number;
  committedLength: number;
  showBothLengths: boolean;
  onCancelDrawing: () => void;
  onAddCableModal: () => void;
}

/**
 * Pure visual layer for cable draw mode.
 *
 * `CableLayerOverlay` keeps gesture/event orchestration; this component owns
 * only the SVG and UI rendering for current path, length popup, and actions.
 */
export function CableLayerSurface({
  committedPathD,
  previewPathD,
  strokeWidthPx,
  currentCableStrokeDasharray,
  firstPoint,
  lastPoint,
  hasSegments,
  hasPreview,
  popupCenter,
  totalLength,
  committedLength,
  showBothLengths,
  onCancelDrawing,
  onAddCableModal,
}: CableLayerSurfaceProps) {
  return (
    <>
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
              onClick={onCancelDrawing}
              title="Cancel current cable (Esc or right-click). Start drawing again."
            >
              Cancel
            </button>
            <button
              type="button"
              className="cable-layer-add-btn"
              onClick={onAddCableModal}
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
    </>
  );
}

