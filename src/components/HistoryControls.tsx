import { useApp } from '../context/AppContext'

export function HistoryControls() {
  const { undo, redo, canUndo, canRedo } = useApp()

  return (
    <div className="floating-controls history-controls">
      <button
        type="button"
        className="history-btn"
        onClick={undo}
        disabled={!canUndo}
        title="Undo (Ctrl+Z)"
        aria-label="Undo"
      >
        ↶
      </button>
      <button
        type="button"
        className="history-btn"
        onClick={redo}
        disabled={!canRedo}
        title="Redo (Ctrl+Y or Ctrl+Shift+Z)"
        aria-label="Redo"
      >
        ↷
      </button>
    </div>
  )
}
