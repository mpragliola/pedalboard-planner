import { useEffect, useState } from 'react'
import type { CanvasObjectType } from '../../types'
import { SelectionToolbarButton } from './SelectionToolbarButton'
import './SelectionToolbar.css'

const TABLET_MEDIA = '(max-width: 768px)'
const TOOLBAR_GAP = 8
const TOOLBAR_HEIGHT = 36

const ICONS = {
  rotate: '↻',
  sendToBack: '⬇',
  delete: '✕',
} as const

interface SelectionToolbarProps {
  obj: CanvasObjectType
  onDelete: (id: string) => void
  onRotate: (id: string) => void
  onSendToBack: (id: string) => void
}

export function SelectionToolbar({ obj, onDelete, onRotate, onSendToBack }: SelectionToolbarProps) {
  const [scaleUp, setScaleUp] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(TABLET_MEDIA).matches
  )
  useEffect(() => {
    const m = window.matchMedia(TABLET_MEDIA)
    const onChange = () => setScaleUp(m.matches)
    m.addEventListener('change', onChange)
    return () => m.removeEventListener('change', onChange)
  }, [])

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
        transform: scaleUp ? 'translate(-50%, 0) scale(1.5)' : 'translate(-50%, 0)',
        transformOrigin: 'center center',
      }}
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <SelectionToolbarButton
        icon={ICONS.rotate}
        title="Rotate 90°"
        ariaLabel="Rotate 90°"
        onClick={handleRotate}
      />
      <SelectionToolbarButton
        icon={ICONS.sendToBack}
        title="Send to back"
        ariaLabel="Send to back"
        onClick={handleSendToBack}
      />
      <SelectionToolbarButton
        icon={ICONS.delete}
        title="Delete"
        ariaLabel="Delete"
        onClick={handleDelete}
        danger
      />
    </div>
  )
}
