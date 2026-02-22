import { faArrowDown, faArrowUp, faRotateRight, faTrash } from "@fortawesome/free-solid-svg-icons";
import type { CanvasObjectType } from "../../types";
import { templateService } from "../../lib/templateService";
import { getObjectAabb } from "../../lib/snapToBoundingBox";
import { getBounds2DCenter } from "../../lib/bounds";
import { computeToolbarPosition } from "../../lib/toolbarPosition";
import { useConfirmation } from "../../context/ConfirmationContext";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { SelectionToolbarButton } from "./SelectionToolbarButton";
import { TOOLBAR_GAP_PX, TOOLBAR_HEIGHT_PX } from "../../constants/layout";
import { MEDIA_QUERY_MAX_MOBILE } from "../../constants/breakpoints";
import "./SelectionToolbar.scss";

const TOUCH_TOOLBAR_SCALE = 1.25;

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

function SelectionToolbar({ obj, onDelete, onRotate, onSendToBack, onBringToFront }: SelectionToolbarProps) {
  const { requestConfirmation } = useConfirmation();
  const scaleUp = useMediaQuery(MEDIA_QUERY_MAX_MOBILE);

  const objectBounds = getObjectAabb(obj, templateService.getObjectDimensions);
  const center = getBounds2DCenter({
    minX: objectBounds.left,
    maxX: objectBounds.left + objectBounds.width,
    minY: objectBounds.top,
    maxY: objectBounds.top + objectBounds.height,
  });
  // Shared toolbar placement utility keeps object/cable toolbars behavior consistent.
  const { left, top } = computeToolbarPosition(
    center,
    { minY: objectBounds.top, maxY: objectBounds.top + objectBounds.height },
    { gapPx: TOOLBAR_GAP_PX, toolbarHeightPx: TOOLBAR_HEIGHT_PX }
  );

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
        transform: scaleUp ? `translate(-50%, 0) scale(${TOUCH_TOOLBAR_SCALE})` : "translate(-50%, 0)",
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

export { SelectionToolbar };
