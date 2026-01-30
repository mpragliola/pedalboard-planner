import { useApp } from '../../context/AppContext'
import { HistoryButton } from './HistoryButton'
import './HistoryControls.css'

export function HistoryControls() {
  const { undo, redo, canUndo, canRedo } = useApp()

  return (
    <div className="floating-controls history-controls">
      <HistoryButton
        icon="↶"
        title="Undo (Ctrl+Z)"
        ariaLabel="Undo"
        onClick={undo}
        disabled={!canUndo}
      />
      <HistoryButton
        icon="↷"
        title="Redo (Ctrl+Y or Ctrl+Shift+Z)"
        ariaLabel="Redo"
        onClick={redo}
        disabled={!canRedo}
      />
    </div>
  )
}
