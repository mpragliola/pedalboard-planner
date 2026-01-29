import { useApp } from '../context/AppContext'

export function ZoomControls() {
  const { zoomIn, zoomOut, showGrid, setShowGrid } = useApp()
  return (
    <div className="floating-controls zoom-controls">
      <button type="button" className="zoom-btn zoom-in" onClick={zoomIn} aria-label="Zoom in">
        +
      </button>
      <button type="button" className="zoom-btn zoom-out" onClick={zoomOut} aria-label="Zoom out">
        −
      </button>
      <button
        type="button"
        className={`zoom-btn grid-toggle ${showGrid ? 'active' : ''}`}
        onClick={() => setShowGrid((v) => !v)}
        aria-label="Toggle grid"
        title="Toggle grid"
      >
        ⊞
      </button>
    </div>
  )
}
