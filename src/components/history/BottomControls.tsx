import { faMinus, faPlus, faRedo, faUndo } from '@fortawesome/free-solid-svg-icons'
import { useCanvas } from '../../context/CanvasContext'
import { useHistoryContext } from '../../context/HistoryContext'
import { BottomControl } from './BottomControl'
import './BottomControls.scss'

export function BottomControls() {
  const { undo, redo, canUndo, canRedo } = useHistoryContext()
  const { zoomIn, zoomOut } = useCanvas()

  return (
    <div className="floating-controls bottom-controls">
      <BottomControl
        icon={faUndo}
        title="Undo (Ctrl+Z)"
        ariaLabel="Undo"
        onClick={undo}
        disabled={!canUndo}
      />
      <BottomControl
        icon={faRedo}
        title="Redo (Ctrl+Y or Ctrl+Shift+Z)"
        ariaLabel="Redo"
        onClick={redo}
        disabled={!canRedo}
      />
      <BottomControl
        icon={faPlus}
        title="Zoom in"
        ariaLabel="Zoom in"
        onClick={zoomIn}
        disabled={false}
      />
      <BottomControl
        icon={faMinus}
        title="Zoom out"
        ariaLabel="Zoom out"
        onClick={zoomOut}
        disabled={false}
      />
    </div>
  )
}
