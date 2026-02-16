import {
  faCompress,
  faCrosshairs,
  faCube,
  faEye,
  faExpand,
  faLayerGroup,
  faList,
  faPlug,
  faRuler,
  faSlash,
  faStar,
  faSquare,
  faTh,
  faXRay,
} from '@fortawesome/free-solid-svg-icons'
import { useCallback, useEffect, useState } from 'react'
import { useCanvas } from '../../context/CanvasContext'
import { useUi } from '../../context/UiContext'
import { SideControl } from './SideControl'
import { ComponentListModal } from '../componentlist/ComponentListModal'
import './SideControls.scss'

type FullscreenDocument = Document & {
  webkitFullscreenElement?: Element | null
  webkitExitFullscreen?: () => Promise<void> | void
}

type FullscreenElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void
}

function getFullscreenElement() {
  const fullscreenDoc = document as FullscreenDocument
  return document.fullscreenElement ?? fullscreenDoc.webkitFullscreenElement ?? null
}

async function requestElementFullscreen(el: HTMLElement) {
  const fullscreenEl = el as FullscreenElement
  if (fullscreenEl.requestFullscreen) {
    await fullscreenEl.requestFullscreen()
    return
  }
  if (fullscreenEl.webkitRequestFullscreen) {
    await fullscreenEl.webkitRequestFullscreen()
  }
}

async function exitDocumentFullscreen() {
  const fullscreenDoc = document as FullscreenDocument
  if (document.exitFullscreen) {
    await document.exitFullscreen()
    return
  }
  if (fullscreenDoc.webkitExitFullscreen) {
    await fullscreenDoc.webkitExitFullscreen()
  }
}

export function SideControls() {
  const { centerView } = useCanvas()
  const {
    showGrid,
    setShowGrid,
    xray,
    setXray,
    showMini3d,
    setShowMini3d,
    showMini3dFloor,
    setShowMini3dFloor,
    showMini3dShadows,
    setShowMini3dShadows,
    showMini3dSurfaceDetail,
    setShowMini3dSurfaceDetail,
    showMini3dSpecular,
    setShowMini3dSpecular,
    ruler,
    setRuler,
    lineRuler,
    setLineRuler,
    cableLayer,
    setCableLayer,
    cablesVisibility,
    setCablesVisibility,
  } = useUi()
  const [componentListOpen, setComponentListOpen] = useState(false)
  const [measurementExpanded, setMeasurementExpanded] = useState(false)
  const [viewExpanded, setViewExpanded] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const collapseOnOutsideClick = (event: MouseEvent) => {
      const target = event.target as Element | null
      if (!target) return
      if (target.closest('.side-controls')) return
      setViewExpanded(false)
      setMeasurementExpanded(false)
    }

    document.addEventListener('click', collapseOnOutsideClick)
    return () => document.removeEventListener('click', collapseOnOutsideClick)
  }, [])

  useEffect(() => {
    const syncFullscreen = () => setIsFullscreen(Boolean(getFullscreenElement()))
    syncFullscreen()
    document.addEventListener('fullscreenchange', syncFullscreen)
    document.addEventListener('webkitfullscreenchange', syncFullscreen as EventListener)
    return () => {
      document.removeEventListener('fullscreenchange', syncFullscreen)
      document.removeEventListener('webkitfullscreenchange', syncFullscreen as EventListener)
    }
  }, [])

  const toggleFullscreen = useCallback(async () => {
    try {
      if (getFullscreenElement()) {
        await exitDocumentFullscreen()
        return
      }
      const target = document.querySelector<HTMLElement>('.app-content') ?? document.documentElement
      await requestElementFullscreen(target)
    } catch {
      // Fullscreen requests can fail when blocked by the browser.
    }
  }, [])

  return (
    <div className="floating-controls side-controls">
      <SideControl
        label="Add cable"
        title="Draw a cable (click to add points, double-click to finish). SHIFT: disable snap. Ctrl: 45° lines (H/V/diagonals)."
        icon={faPlug}
        onClick={() => {
          if (!cableLayer) {
            setRuler(() => false)
            setLineRuler(() => false)
          }
          setCableLayer((v) => !v)
        }}
        active={cableLayer}
        className="cable-layer-toggle"
      />
      <SideControl
        label={`Cables: ${cablesVisibility === "shown" ? "On" : cablesVisibility === "dim" ? "Dim" : "Off"}`}
        title="Cycle cable visibility (on / dim / off)"
        icon={faLayerGroup}
        onClick={() =>
          setCablesVisibility((v) => (v === "shown" ? "dim" : v === "dim" ? "hidden" : "shown"))
        }
        active={cablesVisibility !== "hidden"}
        className={`cables-visible-toggle${
          cablesVisibility === "dim" ? " cables-visible-toggle--dim" : ""
        }`}
      />
      <div className={`mini3d-tools-group ${showMini3d ? 'expanded' : ''}`}>
        <SideControl
          label="3D view"
          title="Toggle 3D miniature overlay"
          icon={faCube}
          onClick={() => setShowMini3d((v) => !v)}
          active={showMini3d}
          className="mini3d-toggle"
        />
        <div className="mini3d-tools-secondary">
          <SideControl
            label="3D floor"
            title="Show or hide the floor in 3D view"
            icon={faSquare}
            onClick={() => setShowMini3dFloor((v) => !v)}
            active={showMini3dFloor}
            className="mini3d-floor-toggle"
          />
          <SideControl
            label="3D shadows"
            title="Show or hide shadows in 3D view"
            icon={faLayerGroup}
            onClick={() => setShowMini3dShadows((v) => !v)}
            active={showMini3dShadows}
            className="mini3d-shadow-toggle"
          />
          <SideControl
            label="3D bump detail"
            title="Toggle floor bump detail in 3D view"
            icon={faLayerGroup}
            onClick={() => setShowMini3dSurfaceDetail((v) => !v)}
            active={showMini3dSurfaceDetail}
            className="mini3d-material-toggle"
          />
          <SideControl
            label="3D specular"
            title="Toggle floor specular highlights in 3D view"
            icon={faStar}
            onClick={() => setShowMini3dSpecular((v) => !v)}
            active={showMini3dSpecular}
            className="mini3d-specular-toggle"
          />
        </div>
      </div>
      <div className={`view-tools-group ${viewExpanded ? 'expanded' : ''}`}>
        <SideControl
          label="View options"
          title={viewExpanded ? 'Hide view options' : 'View options'}
          icon={faEye}
          onClick={() => setViewExpanded((v) => !v)}
          active={showGrid || xray || isFullscreen}
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
            label="Fullscreen"
            title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            icon={isFullscreen ? faCompress : faExpand}
            onClick={toggleFullscreen}
            active={isFullscreen}
            className="fullscreen-toggle"
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
