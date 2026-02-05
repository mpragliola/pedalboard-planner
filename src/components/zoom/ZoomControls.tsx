import {
  faCrosshairs,
  faEye,
  faLayerGroup,
  faList,
  faMinus,
  faPlus,
  faPlug,
  faRuler,
  faSlash,
  faSquare,
  faTh,
  faXRay,
} from '@fortawesome/free-solid-svg-icons'
import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { ZoomButton } from './ZoomButton'
import { ComponentListModal } from '../componentlist/ComponentListModal'
import './ZoomControls.css'

export function ZoomControls() {
  const { zoomIn, zoomOut, showGrid, setShowGrid, xray, setXray, ruler, setRuler, lineRuler, setLineRuler, cableLayer, setCableLayer, cablesVisible, setCablesVisible, centerView } = useApp()
  const [componentListOpen, setComponentListOpen] = useState(false)
  const [measurementExpanded, setMeasurementExpanded] = useState(false)
  const [viewExpanded, setViewExpanded] = useState(false)
  return (
    <div className="floating-controls zoom-controls">
      <ZoomButton
        label="Zoom in"
        title="Zoom in"
        icon={faPlus}
        onClick={zoomIn}
        className="zoom-in"
      />
      <ZoomButton
        label="Zoom out"
        title="Zoom out"
        icon={faMinus}
        onClick={zoomOut}
        className="zoom-out"
      />
      <ZoomButton
        label="Cable layer"
        title="Draw cables (click to add points, double-click to finish). SHIFT: disable snap. Ctrl: 45° lines (H/V/diagonals)."
        icon={faPlug}
        onClick={() => {
          setRuler(() => false)
          setLineRuler(() => false)
          setCableLayer((v) => !v)
        }}
        active={cableLayer}
        className="cable-layer-toggle"
      />
      <div className={`view-tools-group ${viewExpanded ? 'expanded' : ''}`}>
        <ZoomButton
          label="View options"
          title={viewExpanded ? 'Hide view options' : 'View options'}
          icon={faEye}
          onClick={() => setViewExpanded((v) => !v)}
          active={showGrid || xray || !cablesVisible}
          className={`view-group-toggle ${viewExpanded ? 'open' : ''}`}
        />
        <div className="view-tools-secondary">
          <ZoomButton
            label="Center view"
            title="Center view on all objects"
            icon={faCrosshairs}
            onClick={centerView}
            className="center-view"
          />
          <ZoomButton
            label="Toggle grid"
            title="Toggle grid"
            icon={faTh}
            onClick={() => setShowGrid((v) => !v)}
            active={showGrid}
            className="grid-toggle"
          />
          <ZoomButton
            label="X-ray"
            title="Make all objects 50% transparent"
            icon={faXRay}
            onClick={() => setXray((v) => !v)}
            active={xray}
            className="xray-toggle"
          />
          <ZoomButton
            label="Show cables"
            title="Show or hide cables on the canvas"
            icon={faLayerGroup}
            onClick={() => setCablesVisible((v) => !v)}
            active={cablesVisible}
            className="cables-visible-toggle"
          />
        </div>
      </div>
      <div className={`measurement-tools-group ${measurementExpanded ? 'expanded' : ''}`}>
        <ZoomButton
          label="Measurement tools"
          title={measurementExpanded ? 'Hide measurement tools' : 'Measurement tools'}
          icon={faRuler}
          onClick={() => setMeasurementExpanded((v) => !v)}
          active={ruler || lineRuler}
          className={`measurement-group-toggle ${measurementExpanded ? 'open' : ''}`}
        />
        <div className="measurement-tools-secondary">
          <ZoomButton
            label="Ruler"
            title="Measure distances (drag rectangle, then click to fix, click again to exit)"
            icon={faSquare}
            onClick={() => {
              setLineRuler(() => false)
              setCableLayer(() => false)
              setRuler((v) => !v)
            }}
            active={ruler}
            className="ruler-toggle"
          />
          <ZoomButton
            label="Line ruler"
            title="Measure polyline length (click to add points, double-click or ESC to exit)"
            icon={faSlash}
            onClick={() => {
              setRuler(() => false)
              setCableLayer(() => false)
              setLineRuler((v) => !v)
            }}
            active={lineRuler}
            className="line-ruler-toggle"
          />
        </div>
      </div>
      <ZoomButton
        label="Component list"
        title="Components and cables (materials)"
        icon={faList}
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
