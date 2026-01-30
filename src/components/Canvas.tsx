import { CanvasObject } from './CanvasObject'
import { Grid } from './zoom/Grid'
import { SelectionToolbar } from './selection/SelectionToolbar'
import { useApp } from '../context/AppContext'
import './Canvas.css'

export function Canvas() {
  const {
    canvasRef,
    zoom,
    pan,
    tileSize,
    showGrid,
    unit,
    isPanning,
    spaceDown,
    handleCanvasPointerDown,
    objects,
    selectedObjectIds,
    imageFailedIds,
    draggingObjectId,
    onImageError,
    onObjectPointerDown,
    onDragEnd,
    onDeleteObject,
    onRotateObject,
    onSendToBack,
  } = useApp()

  const selectedObject =
    selectedObjectIds.length === 1 ? objects.find((o) => o.id === selectedObjectIds[0]) : null

  const gridTransform = `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`
  const gridSizeCss = unit === 'mm' ? '1cm' : '1in'

  return (
    <div
      className={`canvas ${isPanning ? 'canvas-grabbing' : spaceDown ? 'canvas-grab' : ''}`}
      ref={canvasRef}
      onPointerDown={handleCanvasPointerDown}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div
        className="canvas-bg"
        style={{
          backgroundSize: `${tileSize}px auto`,
          backgroundPosition: `${pan.x}px ${pan.y}px`,
        }}
      />
      <Grid
        visible={showGrid}
        gridSizeCss={gridSizeCss}
        transform={gridTransform}
      />
      <div
        className="canvas-viewport"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
        }}
      >
        {selectedObject && (
          <SelectionToolbar
            obj={selectedObject}
            onDelete={onDeleteObject}
            onRotate={onRotateObject}
            onSendToBack={onSendToBack}
          />
        )}
        {objects.map((obj, index) => (
          <CanvasObject
            key={obj.id}
            obj={obj}
            stackIndex={index}
            useImage={obj.image !== null && !imageFailedIds.has(obj.id)}
            isDragging={draggingObjectId === obj.id}
            isSelected={selectedObjectIds.includes(obj.id)}
            canvasRef={canvasRef}
            onImageError={() => onImageError(obj.id)}
            onPointerDown={(e) => onObjectPointerDown(obj.id, e)}
            onDragEnd={onDragEnd}
          />
        ))}
      </div>
    </div>
  )
}
