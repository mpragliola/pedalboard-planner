import { useApp } from "../../context/AppContext";
import { getObjectDimensions } from "../../lib/stateManager";
import { InfoLine } from "./InfoLine";
import "./SelectionInfoPopup.css";

function formatDimension(mm: number, unit: "mm" | "in"): string {
  if (unit === "in") {
    const inches = mm / 25.4;
    return `${inches.toFixed(2)} in`;
  }
  const cm = mm / 10;
  return `${mm} mm (${cm.toFixed(1)} cm)`;
}

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
