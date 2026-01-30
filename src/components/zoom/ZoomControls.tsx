import { useApp } from '../../context/AppContext'
import { ZoomButton } from './ZoomButton'
import './ZoomControls.css'

export function ZoomControls() {
  const { zoomIn, zoomOut, showGrid, setShowGrid, xray, setXray } = useApp()
  return (
    <div className="floating-controls zoom-controls">
      <ZoomButton
        label="Zoom in"
        title="Zoom in"
        icon="+"
        onClick={zoomIn}
        className="zoom-in"
      />
      <ZoomButton
        label="Zoom out"
        title="Zoom out"
        icon="−"
        onClick={zoomOut}
        className="zoom-out"
      />
      <ZoomButton
        label="Toggle grid"
        title="Toggle grid"
        icon="⊞"
        onClick={() => setShowGrid((v) => !v)}
        active={showGrid}
        className="grid-toggle"
      />
      <ZoomButton
        label="X-ray"
        title="Make all objects 50% transparent"
        icon="◎"
        onClick={() => setXray((v) => !v)}
        active={xray}
        className="xray-toggle"
      />
    </div>
  )
}
