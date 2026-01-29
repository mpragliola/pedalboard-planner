import { CanvasObject } from './CanvasObject'
import { SelectionToolbar } from './SelectionToolbar'
import type { CanvasObjectType } from '../types'

interface CanvasProps {
  zoom: number
  pan: { x: number; y: number }
  tileSize: number
  showGrid: boolean
  unit: 'mm' | 'in'
  isPanning: boolean
  spaceDown: boolean
  canvasRef: React.RefObject<HTMLDivElement>
  onCanvasMouseDown: (e: React.MouseEvent) => void
  objects: CanvasObjectType[]
  selectedObjectIds: string[]
  imageFailedIds: Set<string>
  draggingObjectId: string | null
  onImageError: (id: string) => void
  onObjectPointerDown: (id: string, e: React.PointerEvent) => void
  onDragEnd: () => void
  onDeleteObject: (id: string) => void
  onRotateObject: (id: string) => void
  onSendToBack: (id: string) => void
}

export function Canvas({
  zoom,
  pan,
  tileSize,
  showGrid,
  unit,
  isPanning,
  spaceDown,
  canvasRef,
  onCanvasMouseDown,
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
}: CanvasProps) {
  const selectedObject = selectedObjectIds.length === 1 ? objects.find((o) => o.id === selectedObjectIds[0]) : null

  return (
    <div
      className={`canvas ${isPanning ? 'canvas-grabbing' : spaceDown ? 'canvas-grab' : ''}`}
      ref={canvasRef}
      onMouseDown={onCanvasMouseDown}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div
        className="canvas-bg"
        style={{
          backgroundSize: `${tileSize}px auto`,
          backgroundPosition: `${pan.x}px ${pan.y}px`,
        }}
      />
      {showGrid && (
        <div
          className="canvas-grid"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            ['--grid-size' as string]: unit === 'mm' ? '1cm' : '1in',
          }}
          aria-hidden
        />
      )}
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
            onImageError={() => onImageError(obj.id)}
            onPointerDown={(e) => onObjectPointerDown(obj.id, e)}
            onDragEnd={onDragEnd}
          />
        ))}
      </div>
    </div>
  )
}
