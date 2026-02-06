import {
  faCrosshairs,
  faCube,
  faEye,
  faLayerGroup,
  faList,
  faPlug,
  faRuler,
  faSlash,
  faSquare,
  faTh,
  faXRay,
} from '@fortawesome/free-solid-svg-icons'
import { useState } from 'react'
import { useCanvas } from '../../context/CanvasContext'
import { useUi } from '../../context/UiContext'
import { SideControl } from './SideControl'
import { ComponentListModal } from '../componentlist/ComponentListModal'
import './SideControls.scss'

export function SideControls() {
  const { centerView } = useCanvas()
  const { showGrid, setShowGrid, xray, setXray, showMini3d, setShowMini3d, ruler, setRuler, lineRuler, setLineRuler, cableLayer, setCableLayer, cablesVisible, setCablesVisible } = useUi()
  const [componentListOpen, setComponentListOpen] = useState(false)
  const [measurementExpanded, setMeasurementExpanded] = useState(false)
  const [viewExpanded, setViewExpanded] = useState(false)
  return (
    <div className="floating-controls side-controls">
      <SideControl
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
        <SideControl
          label="View options"
          title={viewExpanded ? 'Hide view options' : 'View options'}
          icon={faEye}
          onClick={() => setViewExpanded((v) => !v)}
          active={showGrid || xray || !cablesVisible || showMini3d}
          className={`view-group-toggle ${viewExpanded ? 'open' : ''}`}
        />
        <div className="view-tools-secondary">
          <SideControl
            label="Center view"
            title="Center view on all objects"
            icon={faCrosshairs}
            onClick={centerView}
            className="center-view"
          />
          <SideControl
            label="Toggle grid"
            title="Toggle grid"
            icon={faTh}
            onClick={() => setShowGrid((v) => !v)}
            active={showGrid}
            className="grid-toggle"
          />
          <SideControl
            label="X-ray"
            title="Make all objects 50% transparent"
            icon={faXRay}
            onClick={() => setXray((v) => !v)}
            active={xray}
            className="xray-toggle"
          />
          <SideControl
            label="Show cables"
            title="Show or hide cables on the canvas"
            icon={faLayerGroup}
            onClick={() => setCablesVisible((v) => !v)}
            active={cablesVisible}
            className="cables-visible-toggle"
          />
          <SideControl
            label="3D view"
            title="Toggle 3D miniature overlay"
            icon={faCube}
            onClick={() => setShowMini3d((v) => !v)}
            active={showMini3d}
            className="mini3d-toggle"
          />
        </div>
      </div>
      <div className={`measurement-tools-group ${measurementExpanded ? 'expanded' : ''}`}>
        <SideControl
          label="Measurement tools"
          title={measurementExpanded ? 'Hide measurement tools' : 'Measurement tools'}
          icon={faRuler}
          onClick={() => setMeasurementExpanded((v) => !v)}
          active={ruler || lineRuler}
          className={`measurement-group-toggle ${measurementExpanded ? 'open' : ''}`}
        />
        <div className="measurement-tools-secondary">
          <SideControl
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
          <SideControl
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
      <SideControl
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
