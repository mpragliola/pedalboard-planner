import { faArrowDown, faArrowUp, faRotateRight, faTrash } from "@fortawesome/free-solid-svg-icons";
import type { CanvasObjectType } from "../../types";
import { getObjectDimensions } from "../../lib/stateManager";
import { useConfirmation } from "../../context/ConfirmationContext";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { SelectionToolbarButton } from "./SelectionToolbarButton";
import "./SelectionToolbar.css";

const TOOLBAR_GAP = 8;
const TOOLBAR_HEIGHT = 36;

const ICONS = {
  rotate: faRotateRight,
  sendToBack: faArrowDown,
  bringToFront: faArrowUp,
  delete: faTrash,
} as const;

interface SelectionToolbarProps {
  obj: CanvasObjectType;
  onDelete: (id: string) => void;
  onRotate: (id: string) => void;
  onSendToBack: (id: string) => void;
  onBringToFront: (id: string) => void;
}

export function SelectionToolbar({ obj, onDelete, onRotate, onSendToBack, onBringToFront }: SelectionToolbarProps) {
  const { requestConfirmation } = useConfirmation();
  const scaleUp = useMediaQuery("(max-width: 768px)");

  const [width, depth] = getObjectDimensions(obj);
  const centerX = obj.x + width / 2;
  const centerY = obj.y + depth / 2;
  const left = centerX;
  const top = centerY - TOOLBAR_GAP - TOOLBAR_HEIGHT;

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const confirmed = await requestConfirmation({
      title: "Delete item",
      message: `Delete "${obj.name}"? This cannot be undone.`,
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      danger: true,
    });
    if (confirmed) onDelete(obj.id);
  };
  const handleRotate = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onRotate(obj.id);
  };
  const handleSendToBack = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onSendToBack(obj.id);
  };
  const handleBringToFront = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onBringToFront(obj.id);
  };

  return (
    <div
      className="selection-toolbar"
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
      <SelectionToolbarButton icon={ICONS.rotate} title="Rotate 90°" ariaLabel="Rotate 90°" onClick={handleRotate} />
      <SelectionToolbarButton
        icon={ICONS.sendToBack}
        title="Send to back"
        ariaLabel="Send to back"
        onClick={handleSendToBack}
      />
      <SelectionToolbarButton
        icon={ICONS.bringToFront}
        title="Bring to front"
        ariaLabel="Bring to front"
        onClick={handleBringToFront}
      />
      <SelectionToolbarButton icon={ICONS.delete} title="Delete" ariaLabel="Delete" onClick={handleDelete} danger />
    </div>
  );
}
