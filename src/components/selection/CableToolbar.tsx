import { faArrowDown, faArrowUp, faPen, faTrash } from "@fortawesome/free-solid-svg-icons";
import type { Cable } from "../../types";
import { getBoundingBoxOfPoints } from "../../lib/geometry";
import { getBounds2DCenter } from "../../lib/bounds";
import { vec2Average } from "../../lib/vector";
import { computeToolbarPosition } from "../../lib/toolbarPosition";
import { useConfirmation } from "../../context/ConfirmationContext";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { SelectionToolbarButton } from "./SelectionToolbarButton";
import { TOOLBAR_GAP_PX, TOOLBAR_HEIGHT_PX } from "../../constants/layout";
import "./SelectionToolbar.scss";
const TOUCH_TOOLBAR_SCALE = 1.25;

interface CableToolbarProps {
  cable: Cable;
  onEdit: (cable: Cable) => void;
  onDelete: (cableId: string) => void;
  onSendToBack: (cableId: string) => void;
  onBringToFront: (cableId: string) => void;
}

export function CableToolbar({ cable, onEdit, onDelete, onSendToBack, onBringToFront }: CableToolbarProps) {
  const { requestConfirmation } = useConfirmation();
  const scaleUp = useMediaQuery("(max-width: 600px)");

  const bounds = getBoundingBoxOfPoints(cable.segments);
  const center = bounds ? getBounds2DCenter(bounds) : vec2Average(cable.segments);
  const { left, top } = computeToolbarPosition(
    center,
    bounds ? { minY: bounds.minY, maxY: bounds.maxY } : null,
    { gapPx: TOOLBAR_GAP_PX, toolbarHeightPx: TOOLBAR_HEIGHT_PX }
  );

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
        transform: scaleUp ? `translate(-50%, 0) scale(${TOUCH_TOOLBAR_SCALE})` : "translate(-50%, 0)",
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

