import { useEffect } from "react";
import { useBoard } from "../../context/BoardContext";
import { useCable } from "../../context/CableContext";
import { useSelection } from "../../context/SelectionContext";
import { useUi } from "../../context/UiContext";
import { templateService } from "../../lib/templateService";
import { formatDimension, formatLengthCm } from "../../lib/rulerFormat";
import type { Point } from "../../lib/vector";
import { InfoLine } from "./InfoLine";
import "./SelectionInfoPopup.scss";

function cableLengthMm(points: Point[]): number {
  if (points.length < 2) return 0;
  let sum = 0;
  for (let i = 1; i < points.length; i += 1) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    sum += Math.hypot(dx, dy);
  }
  return sum;
}

export function SelectionInfoPopup() {
  const { objects } = useBoard();
  const { cables } = useCable();
  const { selectedObjectIds, selectedCableId, setSelectedCableId } = useSelection();
  const { unit } = useUi();

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

  const [width, depth, height] = templateService.getObjectDimensions(selectedObject);

  return (
    <div className="selection-info-popup">
      <div className="info-title">{selectedObject.name}</div>
      <InfoLine label="Width" value={formatDimension(width, unit)} />
      <InfoLine label="Depth" value={formatDimension(depth, unit)} />
      <InfoLine label="Height" value={formatDimension(height, unit)} />
    </div>
  );
}
