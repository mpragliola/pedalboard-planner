import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { ZoomButton } from './ZoomButton'
import { ComponentListModal } from '../componentlist/ComponentListModal'
import './ZoomControls.css'

export function ZoomControls() {
  const { zoomIn, zoomOut, showGrid, setShowGrid, xray, setXray, ruler, setRuler, lineRuler, setLineRuler, centerView } = useApp()
  const [componentListOpen, setComponentListOpen] = useState(false)
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
        label="Center view"
        title="Center view on all objects"
        icon="⊕"
        onClick={centerView}
        className="center-view"
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
      <ZoomButton
        label="Ruler"
        title="Measure distances (drag rectangle, then click to fix, click again to exit)"
        icon="▭"
        onClick={() => {
          setLineRuler(() => false)
          setRuler((v) => !v)
        }}
        active={ruler}
        className="ruler-toggle"
      />
      <ZoomButton
        label="Line ruler"
        title="Measure polyline length (click to add points, double-click or ESC to exit)"
        icon="∿"
        onClick={() => {
          setRuler(() => false)
          setLineRuler((v) => !v)
        }}
        active={lineRuler}
        className="line-ruler-toggle"
      />
      <ZoomButton
        label="Component list"
        title="Components and connectors (materials)"
        icon="≡"
        onClick={() => setComponentListOpen(true)}
        className="component-list-toggle"
      />
      <ComponentListModal
        open={componentListOpen}
        onClose={() => setComponentListOpen(false)}
      />
    </div>
  )
}
