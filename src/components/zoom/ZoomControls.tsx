import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { ComponentListModal } from '../componentlist/ComponentListModal'
import { ZoomButton } from './ZoomButton'
import './ZoomControls.css'

export function ZoomControls() {
  const { zoomIn, zoomOut, showGrid, setShowGrid, xray, setXray, centerView } = useApp()
  const [componentListOpen, setComponentListOpen] = useState(false)
  return (
    <>
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
          label="Center view"
          title="Center view on all objects"
          icon="⊕"
          onClick={centerView}
          className="center-view"
        />
        <ZoomButton
          label="Component list"
          title="List all components on the canvas"
          icon="≡"
          onClick={() => setComponentListOpen(true)}
          className="component-list-btn"
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
      <ComponentListModal
        open={componentListOpen}
        onClose={() => setComponentListOpen(false)}
      />
    </>
  )
}
