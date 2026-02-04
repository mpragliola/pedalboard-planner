import { useApp } from "../../context/AppContext";
import { getObjectDimensions } from "../../lib/stateManager";
import { formatDimension } from "../../lib/rulerFormat";
import { InfoLine } from "./InfoLine";
import "./SelectionInfoPopup.css";

export function SelectionInfoPopup() {
  const { objects, selectedObjectIds, unit } = useApp();

  const selectedObject = selectedObjectIds.length === 1 ? objects.find((o) => o.id === selectedObjectIds[0]) : null;

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
