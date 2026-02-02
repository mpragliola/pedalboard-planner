import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Canvas } from './components/Canvas'
import { BoardMenu } from './components/boardmenu/BoardMenu'
import { DropdownsPanel } from './components/catalog/DropdownsPanel'
import { GptButton } from './components/gpt/GptButton'
import { InfoButton } from './components/info/InfoButton'
import { ZoomControls } from './components/zoom/ZoomControls'
import { SelectionInfoPopup } from './components/selection/SelectionInfoPopup'
import { HistoryControls } from './components/history/HistoryControls'
import { AppProvider, useApp } from './context/AppContext'
import { ConfirmationProvider } from './context/ConfirmationContext'
import './App.css'

export type { BoardType } from './data/boards'
export type { DeviceType } from './data/devices'
export type { CanvasObjectType, ObjectSubtype } from './types'

function AppContent() {
  const { dropdownPanelRef, floatingUiVisible, setFloatingUiVisible } = useApp()
  return (
    <>
      <Canvas />
      <div className="catalog-panel">
        <div className="catalog-panel-head">
          <button
            type="button"
            className="catalog-panel-toggle"
            onClick={() => setFloatingUiVisible((v) => !v)}
            title={floatingUiVisible ? 'Minimize catalog' : 'Expand catalog'}
            aria-label={floatingUiVisible ? 'Minimize catalog' : 'Expand catalog'}
          >
            <FontAwesomeIcon icon={floatingUiVisible ? faChevronUp : faChevronDown} className="catalog-panel-toggle-icon" />
            {' '}Catalog
          </button>
          <GptButton />
          <InfoButton />
        </div>
        <div className={`catalog-panel-body ${floatingUiVisible ? '' : 'minimized'}`}>
          <DropdownsPanel ref={dropdownPanelRef} />
        </div>
      </div>
      <div className="board-menu-wrap">
        <BoardMenu />
      </div>
      <ZoomControls />
      <HistoryControls />
      <SelectionInfoPopup />
      <p className="disclaimer" aria-live="polite">
        Prototype — may contain bugs; catalog is incomplete and may have errors.
      </p>
      <footer className="copyright">
        PedalboardFactory — by{' '}
        <a href="mailto:marcopragliola@gmail.com">Marco Pragliola</a>
      </footer>
    </>
  )
}


function App() {
  return (
    <ConfirmationProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ConfirmationProvider>
  )
}

export default App
