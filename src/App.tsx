import { Canvas } from './components/Canvas'
import { BoardMenu } from './components/boardmenu/BoardMenu'
import { DropdownsPanel } from './components/catalog/DropdownsPanel'
import { GptButton } from './components/gpt/GptButton'
import { InfoButton } from './components/info/InfoButton'
import { ZoomControls } from './components/zoom/ZoomControls'
import { SelectionInfoPopup } from './components/selection/SelectionInfoPopup'
import { HistoryControls } from './components/history/HistoryControls'
import { AppProvider, useApp } from './context/AppContext'
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
            {floatingUiVisible ? '▲' : '▼'} Catalog
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
      <footer className="copyright">
        Pedalboard Planner — by{' '}
        <a href="mailto:marcopragliola@gmail.com">Marco Pragliola</a>
      </footer>
    </>
  )
}


function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}

export default App
