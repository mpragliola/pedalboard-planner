import { useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { getObjectDimensions } from "../../lib/stateManager";
import { formatDimension, formatLengthCm } from "../../lib/rulerFormat";
import { InfoLine } from "./InfoLine";
import "./SelectionInfoPopup.scss";

function cableLengthMm(segments: { x1: number; y1: number; x2: number; y2: number }[]): number {
  return segments.reduce((sum, s) => sum + Math.hypot(s.x2 - s.x1, s.y2 - s.y1), 0);
}

export function SelectionInfoPopup() {
  const { objects, cables, selectedObjectIds, selectedCableId, setSelectedCableId, unit } = useApp();

  const selectedObject = selectedObjectIds.length === 1 ? objects.find((o) => o.id === selectedObjectIds[0]) : null;
  const selectedCable = selectedCableId ? cables.find((c) => c.id === selectedCableId) : null;

  useEffect(() => {
    if (selectedCableId && !selectedCable) setSelectedCableId(null);
  }, [selectedCableId, selectedCable, setSelectedCableId]);

  if (selectedCable) {
    const lengthMm = cableLengthMm(selectedCable.segments);
    const connectorALabel = selectedCable.connectorAName
      ? `${selectedCable.connectorA} (${selectedCable.connectorAName})`
      : selectedCable.connectorA;
    const connectorBLabel = selectedCable.connectorBName
      ? `${selectedCable.connectorB} (${selectedCable.connectorBName})`
      : selectedCable.connectorB;
    return (
      <div className="selection-info-popup">
        <div className="info-title">Cable</div>
        <InfoLine label="Connector A" value={connectorALabel} />
        <InfoLine label="Connector B" value={connectorBLabel} />
        <InfoLine label="Length" value={formatLengthCm(lengthMm)} />
      </div>
    );
  }

  if (!selectedObject) return null;

  const [width, depth, height] = getObjectDimensions(selectedObject);

  return (
    <div className="selection-info-popup">
      <div className="info-title">{selectedObject.name}</div>
      <InfoLine label="Width" value={formatDimension(width, unit)} />
      <InfoLine label="Depth" value={formatDimension(depth, unit)} />
      <InfoLine label="Height" value={formatDimension(height, unit)} />
    </div>
  );
}
