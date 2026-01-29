interface ZoomControlsProps {
  onZoomIn: () => void
  onZoomOut: () => void
  showGrid: boolean
  onToggleGrid: () => void
}

export function ZoomControls({ onZoomIn, onZoomOut, showGrid, onToggleGrid }: ZoomControlsProps) {
  return (
    <div className="floating-controls zoom-controls">
      <button type="button" className="zoom-btn zoom-in" onClick={onZoomIn} aria-label="Zoom in">
        +
      </button>
      <button type="button" className="zoom-btn zoom-out" onClick={onZoomOut} aria-label="Zoom out">
        −
      </button>
      <button
        type="button"
        className={`zoom-btn grid-toggle ${showGrid ? 'active' : ''}`}
        onClick={onToggleGrid}
        aria-label="Toggle grid"
        title="Toggle grid"
      >
        ⊞
      </button>
    </div>
  )
}
