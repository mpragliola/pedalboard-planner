import type { CanvasObjectType } from '../types'

interface SelectionToolbarProps {
  obj: CanvasObjectType
  onDelete: (id: string) => void
  onRotate: (id: string) => void
  onSendToBack: (id: string) => void
}

const TOOLBAR_GAP = 8
const TOOLBAR_HEIGHT = 36

export function SelectionToolbar({ obj, onDelete, onRotate, onSendToBack }: SelectionToolbarProps) {
  const centerX = obj.x + obj.width / 2
  const centerY = obj.y + obj.depth / 2
  const left = centerX
  const top = centerY - TOOLBAR_GAP - TOOLBAR_HEIGHT

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    onDelete(obj.id)
  }
  const handleRotate = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    onRotate(obj.id)
  }
  const handleSendToBack = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    onSendToBack(obj.id)
  }

  return (
    <div
      className="selection-toolbar"
      style={{
        left: `${left}px`,
        top: `${top}px`,
        transform: 'translate(-50%, 0)',
      }}
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className="selection-toolbar-btn"
        title="Rotate 90°"
        onClick={handleRotate}
        aria-label="Rotate 90°"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M21 2v6h-6" />
          <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
          <path d="M3 22v-6h6" />
          <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
        </svg>
      </button>
      <button
        type="button"
        className="selection-toolbar-btn"
        title="Send to back"
        onClick={handleSendToBack}
        aria-label="Send to back"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M12 5v14" />
          <path d="M19 12l-7 7-7-7" />
        </svg>
      </button>
      <button
        type="button"
        className="selection-toolbar-btn selection-toolbar-btn-danger"
        title="Delete"
        onClick={handleDelete}
        aria-label="Delete"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M3 6h18" />
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
          <line x1="10" y1="11" x2="10" y2="17" />
          <line x1="14" y1="11" x2="14" y2="17" />
        </svg>
      </button>
    </div>
  )
}
