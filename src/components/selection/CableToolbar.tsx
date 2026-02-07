import { faPen, faTrash } from "@fortawesome/free-solid-svg-icons";
import type { Cable } from "../../types";
import type { Point } from "../../lib/vector";
import { useConfirmation } from "../../context/ConfirmationContext";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { SelectionToolbarButton } from "./SelectionToolbarButton";
import "./SelectionToolbar.scss";

const TOOLBAR_GAP = 8;
const TOOLBAR_HEIGHT = 36;

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
}

export function CableToolbar({ cable, onEdit, onDelete }: CableToolbarProps) {
  const { requestConfirmation } = useConfirmation();
  const scaleUp = useMediaQuery("(max-width: 768px)");

  const { x: centerX, y: centerY } = cableCenter(cable);
  const left = centerX;
  const top = centerY - TOOLBAR_GAP - TOOLBAR_HEIGHT;

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

  return (
    <div
      className="selection-toolbar cable-toolbar"
      data-no-canvas-zoom
      style={{
        left: `${left}px`,
        top: `${top}px`,
        transform: scaleUp ? "translate(-50%, 0) scale(1.5)" : "translate(-50%, 0)",
        transformOrigin: "center center",
      }}
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <SelectionToolbarButton icon={faPen} title="Edit cable" ariaLabel="Edit cable" onClick={handleEdit} />
      <SelectionToolbarButton icon={faTrash} title="Delete" ariaLabel="Delete cable" onClick={handleDelete} danger />
    </div>
  );
}
