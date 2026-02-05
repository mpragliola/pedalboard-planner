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
import { useApp } from "../context/AppContext";
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
    showGrid,
    xray,
    ruler,
    lineRuler,
    cableLayer,
    cablesVisible,
    cables,
    unit,
    isPanning,
    spaceDown,
    canvasAnimating,
    setCanvasAnimating,
    handleCanvasPointerDown,
    setFloatingUiVisible,
    shouldIgnoreCatalogClick,
    objects,
    selectedObjectIds,
    selectedCableId,
    imageFailedIds,
    draggingObjectId,
    onImageError,
    onObjectPointerDown,
    onCablePointerDown,
    onDragEnd,
    onDeleteObject,
    onRotateObject,
    onSendToBack,
    onBringToFront,
    setCables,
    setSelectedCableId,
  } = useApp();

  const [editingCableId, setEditingCableId] = useState<string | null>(null);
  const selectedCable = selectedCableId ? cables.find((c) => c.id === selectedCableId) : null;
  const editingCable = editingCableId ? cables.find((c) => c.id === editingCableId) : null;

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
          backgroundSize: `${tileSize}px auto`,
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
          visible={cablesVisible}
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
