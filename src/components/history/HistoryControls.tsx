import { faRedo, faUndo } from '@fortawesome/free-solid-svg-icons'
import { useHistoryContext } from '../../context/HistoryContext'
import { HistoryButton } from './HistoryButton'
import './HistoryControls.scss'

export function HistoryControls() {
  const { undo, redo, canUndo, canRedo } = useHistoryContext()

  return (
    <div className="floating-controls history-controls">
      <HistoryButton
        icon={faUndo}
        title="Undo (Ctrl+Z)"
        ariaLabel="Undo"
        onClick={undo}
        disabled={!canUndo}
      />
      <HistoryButton
        icon={faRedo}
        title="Redo (Ctrl+Y or Ctrl+Shift+Z)"
        ariaLabel="Redo"
        onClick={redo}
        disabled={!canRedo}
      />
    </div>
  )
}
