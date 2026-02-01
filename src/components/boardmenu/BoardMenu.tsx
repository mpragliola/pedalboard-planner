import { faFloppyDisk, faFolderOpen, faPlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useRef } from 'react'
import { useApp } from '../../context/AppContext'
import { useConfirmation } from '../../context/ConfirmationContext'
import './BoardMenu.css'

export function BoardMenu() {
  const { newBoard, loadBoardFromFile, saveBoardToFile } = useApp()
  const { requestConfirmation } = useConfirmation()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleNewBoard = async () => {
    const confirmed = await requestConfirmation({
      title: 'New pedalboard',
      message: 'Clear the current pedalboard and start fresh? Unsaved changes will be lost.',
      confirmLabel: 'New',
      cancelLabel: 'Cancel',
      danger: true,
    })
    if (confirmed) newBoard()
  }

  const handleLoadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      loadBoardFromFile(file)
      e.target.value = ''
    }
  }

  return (
    <div className="board-menu">
      <button
        type="button"
        className="board-menu-btn"
        onClick={handleNewBoard}
        title="New pedalboard (clear current)"
        aria-label="New pedalboard"
      >
        <FontAwesomeIcon icon={faPlus} />
      </button>
      <button
        type="button"
        className="board-menu-btn"
        onClick={handleLoadClick}
        title="Load pedalboard from JSON file"
        aria-label="Load pedalboard"
      >
        <FontAwesomeIcon icon={faFolderOpen} />
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        className="board-menu-file-input"
        aria-hidden="true"
        tabIndex={-1}
        onChange={handleFileChange}
      />
      <button
        type="button"
        className="board-menu-btn"
        onClick={saveBoardToFile}
        title="Save pedalboard to JSON file"
        aria-label="Save pedalboard"
      >
        <FontAwesomeIcon icon={faFloppyDisk} />
      </button>
    </div>
  )
}
