import { useRef, useEffect, useCallback, useMemo, useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { CanvasObject } from "./CanvasObject";
import { Grid } from "./zoom/Grid";
import { RulerOverlay } from "./ruler/RulerOverlay";
import { LineRulerOverlay } from "./ruler/LineRulerOverlay";
import { CableLayerOverlay } from "./cable/CableLayerOverlay";
import { CablePaths } from "./cable/CablePaths";
import { AddCableModal } from "./cable/AddCableModal";
import { SelectionToolbar } from "./selection/SelectionToolbar";
import { CableToolbar } from "./selection/CableToolbar";
import { useBoard } from "../context/BoardContext";
import { useCable } from "../context/CableContext";
import { useCanvas } from "../context/CanvasContext";
import { useCatalog } from "../context/CatalogContext";
import { useUi } from "../context/UiContext";
import { useSelection } from "../context/SelectionContext";
import { CANVAS_BACKGROUNDS } from "../constants/backgrounds";
import { CANVAS_DROP_ID } from "./catalog/CatalogDndProvider";
import "./Canvas.scss";

export function Canvas() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const { setNodeRef: setDroppableRef } = useDroppable({ id: CANVAS_DROP_ID });
  const mergeViewportRef = useCallback(
    (el: HTMLDivElement | null) => {
      (viewportRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
      setDroppableRef(el);
    },
    [setDroppableRef]
  );
  const {
    canvasRef,
    zoom,
    pan,
    tileSize,
    isPanning,
    spaceDown,
    canvasAnimating,
    setCanvasAnimating,
    handleCanvasPointerDown,
  } = useCanvas();
  const {
    objects,
    imageFailedIds,
    draggingObjectId,
    onImageError,
    onObjectPointerDown,
    onDragEnd,
    onDeleteObject,
    onRotateObject,
    onSendToBack,
    onBringToFront,
  } = useBoard();
  const { cables, onCablePointerDown, setCables } = useCable();
  const { selectedObjectIds, selectedCableId, setSelectedCableId } = useSelection();
  const { shouldIgnoreCatalogClick } = useCatalog();
  const { showGrid, xray, ruler, lineRuler, cableLayer, cablesVisibility, setFloatingUiVisible, unit, background } =
    useUi();

  const [editingCableId, setEditingCableId] = useState<string | null>(null);
  const selectedCable = selectedCableId ? cables.find((c) => c.id === selectedCableId) : null;
  const editingCable = editingCableId ? cables.find((c) => c.id === editingCableId) : null;
  const canvasBackground = CANVAS_BACKGROUNDS.find((bg) => bg.id === background) ?? CANVAS_BACKGROUNDS[0];

  useEffect(() => {
    if (!canvasAnimating || !viewportRef.current) return;
    const el = viewportRef.current;
    const onEnd = () => setCanvasAnimating(false);
    el.addEventListener("transitionend", onEnd);
    return () => el.removeEventListener("transitionend", onEnd);
  }, [canvasAnimating, setCanvasAnimating]);

  const selectedIdSet = useMemo(() => new Set(selectedObjectIds), [selectedObjectIds]);
  const selectedObject = selectedObjectIds.length === 1 ? objects.find((o) => o.id === selectedObjectIds[0]) : null;

  // Application units: 1 mm = 1 px; 1 cm = 10 px, 1 in = 25.4 px (match board dimensions)
  const gridSizePx = unit === "mm" ? 10 : 25.4;
  const gridSizeCss = `${gridSizePx}px`;
  const backgroundTileSize = tileSize * 0.5;

  return (
    <div
      className={`canvas ${isPanning ? "canvas-grabbing" : spaceDown ? "canvas-grab" : ""} ${
        canvasAnimating ? "canvas-animating" : ""
      }`}
      ref={canvasRef}
      onPointerDown={handleCanvasPointerDown}
      onClick={() => {
        if (shouldIgnoreCatalogClick()) return;
        setFloatingUiVisible(false);
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div
        className="canvas-bg"
        style={{
          backgroundImage: `url("${canvasBackground.imageUrl}")`,
          backgroundSize: `${backgroundTileSize}px auto`,
          backgroundPosition: `${pan.x}px ${pan.y}px`,
        }}
      />
      <div
        ref={mergeViewportRef}
        className="canvas-viewport"
        style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
      >
        <div className="canvas-viewport-zoom">
          <Grid visible={showGrid} gridSizeCss={gridSizeCss} />
          {selectedObject && (
            <SelectionToolbar
              obj={selectedObject}
              onDelete={onDeleteObject}
              onRotate={onRotateObject}
              onSendToBack={onSendToBack}
              onBringToFront={onBringToFront}
            />
          )}
          {selectedCable && (
            <CableToolbar
              cable={selectedCable}
              onEdit={() => setEditingCableId(selectedCable.id)}
              onDelete={(id) => {
                setCables((prev) => prev.filter((c) => c.id !== id));
                setSelectedCableId(null);
              }}
              onSendToBack={(id) =>
                setCables((prev) => {
                  const idx = prev.findIndex((c) => c.id === id);
                  if (idx <= 0) return prev;
                  const cable = prev[idx];
                  const rest = prev.slice(0, idx).concat(prev.slice(idx + 1));
                  return [cable, ...rest];
                })
              }
              onBringToFront={(id) =>
                setCables((prev) => {
                  const idx = prev.findIndex((c) => c.id === id);
                  if (idx === -1 || idx === prev.length - 1) return prev;
                  const cable = prev[idx];
                  const rest = prev.slice(0, idx).concat(prev.slice(idx + 1));
                  return [...rest, cable];
                })
              }
            />
          )}
          {objects.map((obj, index) => (
            <CanvasObject
              key={obj.id}
              obj={obj}
              stackIndex={index}
              useImage={obj.image !== null && !imageFailedIds.has(obj.id)}
              isDragging={draggingObjectId === obj.id}
              isSelected={selectedIdSet.has(obj.id)}
              opacity={xray ? 0.5 : 1}
              canvasRef={canvasRef}
              onImageError={() => onImageError(obj.id)}
              onPointerDown={(e) => onObjectPointerDown(obj.id, e)}
              onDragEnd={onDragEnd}
            />
          ))}
        </div>
        <CablePaths
          cables={cables}
          visible={cablesVisibility !== "hidden"}
          opacity={cablesVisibility === "dim" ? 0.5 : 1}
          selectedCableId={selectedCableId}
          onCablePointerDown={onCablePointerDown}
        />
      </div>
      {editingCable && (
        <AddCableModal
          open={true}
          segments={editingCable.segments}
          initialCable={editingCable}
          onConfirm={(updated) => {
            setCables((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
            setEditingCableId(null);
            setSelectedCableId(null);
          }}
          onCancel={() => setEditingCableId(null)}
        />
      )}
      {ruler && <RulerOverlay />}
      {lineRuler && <LineRulerOverlay />}
      {cableLayer && <CableLayerOverlay />}
    </div>
  );
}
