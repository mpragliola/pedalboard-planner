import type { RefObject } from 'react'
import type { CanvasObjectType } from '../types'

interface CanvasObjectProps {
  obj: CanvasObjectType
  stackIndex: number
  useImage: boolean
  isDragging: boolean
  isSelected: boolean
  canvasRef: RefObject<HTMLDivElement | null>
  onImageError: () => void
  onPointerDown: (e: React.PointerEvent) => void
  onDragEnd: () => void
}

function tooltipText(obj: CanvasObjectType): string {
  const parts = [
    obj.type && `Type: ${obj.type}`,
    obj.brand && `Brand: ${obj.brand}`,
    obj.model && `Model: ${obj.model}`,
  ].filter(Boolean)
  return parts.join(' · ') || obj.name
}

const normalizeRotation = (r: number) => ((r % 360) + 360) % 360

const STACK_BASE = 1
const STACK_DRAGGING = 10000

export function CanvasObject({ obj, stackIndex, useImage, isDragging, isSelected, canvasRef, onImageError, onPointerDown, onDragEnd }: CanvasObjectProps) {
  const rotation = normalizeRotation(obj.rotation ?? 0)
  const is90or270 = rotation === 90 || rotation === 270
  const bboxW = is90or270 ? obj.depth : obj.width
  const bboxH = is90or270 ? obj.width : obj.depth
  const wrapperLeft = obj.x + (obj.width - bboxW) / 2
  const wrapperTop = obj.y + (obj.depth - bboxH) / 2
  const boxLeft = (bboxW - obj.width) / 2
  const boxTop = (bboxH - obj.depth) / 2
  /* Stacking by array order only; drag boost so dragged item stays on top. */
  const zIndex = (isDragging ? STACK_DRAGGING : 0) + STACK_BASE + stackIndex

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return
    e.preventDefault() /* prevent scroll/zoom on touch so drag works */
    /* Capture on canvas container so it isn't lost when the object moves (fixes drag on real phones) */
    canvasRef.current?.setPointerCapture(e.pointerId)
    onPointerDown(e)
  }
  const handlePointerUp = (e: React.PointerEvent) => {
    if (e.button !== 0) return
    if (isDragging) onDragEnd()
  }
  return (
    <div
      className={`canvas-object-wrapper ${isDragging ? 'canvas-object-wrapper-dragging' : ''}`}
      style={{
        position: 'absolute',
        left: wrapperLeft,
        top: wrapperTop,
        width: bboxW,
        height: bboxH,
        zIndex,
      }}
      title={tooltipText(obj)}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      <div
        className={`canvas-object ${useImage ? 'has-image' : 'has-color'} ${isDragging ? 'canvas-object-dragging' : ''} ${isSelected ? 'canvas-object-selected' : ''}`}
        style={{
          position: 'absolute',
          left: boxLeft,
          top: boxTop,
          width: obj.width,
          height: obj.depth,
          transform: `rotate(${rotation}deg)`,
          transformOrigin: '50% 50%',
          backgroundColor: useImage ? 'transparent' : (obj.color ?? 'rgb(200, 200, 200)'),
        }}
      >
        {useImage && obj.image ? (
          <img
            src={obj.image}
            alt=""
            className="canvas-object-image"
            draggable={false}
            onError={onImageError}
          />
        ) : null}
      </div>
    </div>
  )
}
