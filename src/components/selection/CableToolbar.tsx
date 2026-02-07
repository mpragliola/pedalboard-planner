import { faArrowDown, faArrowUp, faPen, faTrash } from "@fortawesome/free-solid-svg-icons";
import type { Cable } from "../../types";
import type { Point } from "../../lib/vector";
import { getBoundingBoxOfSegments } from "../../lib/geometry";
import { useConfirmation } from "../../context/ConfirmationContext";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { SelectionToolbarButton } from "./SelectionToolbarButton";
import "./SelectionToolbar.scss";

const TOOLBAR_GAP = 12;
const TOOLBAR_HEIGHT = 40;

function cableCenter(cable: Cable): Point {
  if (cable.segments.length === 0) return { x: 0, y: 0 };
  let sumX = 0;
  let sumY = 0;
  let count = 0;
  const first = cable.segments[0];
  sumX += first.start.x;
  sumY += first.start.y;
  count += 1;
  for (const s of cable.segments) {
    sumX += s.end.x;
    sumY += s.end.y;
    count += 1;
  }
  return { x: sumX / count, y: sumY / count };
}

interface CableToolbarProps {
  cable: Cable;
  onEdit: (cable: Cable) => void;
  onDelete: (cableId: string) => void;
  onSendToBack: (cableId: string) => void;
  onBringToFront: (cableId: string) => void;
}

export function CableToolbar({ cable, onEdit, onDelete, onSendToBack, onBringToFront }: CableToolbarProps) {
  const { requestConfirmation } = useConfirmation();
  const scaleUp = useMediaQuery("(max-width: 768px)");

  const bounds = getBoundingBoxOfSegments(cable.segments);
  const { x: centerX, y: centerY } = bounds
    ? { x: (bounds.minX + bounds.maxX) / 2, y: (bounds.minY + bounds.maxY) / 2 }
    : cableCenter(cable);
  const left = centerX;
  // Prefer above the cable bounds to keep the path clear; flip below if near the top edge.
  let top = (bounds ? bounds.minY : centerY) - TOOLBAR_GAP - TOOLBAR_HEIGHT;
  let translateY = "translate(-50%, 0)";
  if (top < TOOLBAR_HEIGHT) {
    top = (bounds ? bounds.maxY : centerY) + TOOLBAR_GAP;
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onEdit(cable);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const confirmed = await requestConfirmation({
      title: "Delete cable",
      message: "Delete this cable? This cannot be undone.",
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      danger: true,
    });
    if (confirmed) onDelete(cable.id);
  };

  const handleSendToBack = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onSendToBack(cable.id);
  };

  const handleBringToFront = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onBringToFront(cable.id);
  };

  return (
    <div
      className="selection-toolbar cable-toolbar"
      data-no-canvas-zoom
      style={{
        left: `${left}px`,
        top: `${top}px`,
        transform: scaleUp ? `${translateY} scale(1.5)` : translateY,
        transformOrigin: "center center",
      }}
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <SelectionToolbarButton icon={faPen} title="Edit cable" ariaLabel="Edit cable" onClick={handleEdit} />
      <SelectionToolbarButton
        icon={faArrowDown}
        title="Send to back"
        ariaLabel="Send cable to back"
        onClick={handleSendToBack}
      />
      <SelectionToolbarButton
        icon={faArrowUp}
        title="Bring to front"
        ariaLabel="Bring cable to front"
        onClick={handleBringToFront}
      />
      <SelectionToolbarButton icon={faTrash} title="Delete" ariaLabel="Delete cable" onClick={handleDelete} danger />
    </div>
  );
}
