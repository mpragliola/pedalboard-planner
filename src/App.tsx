import { Canvas } from './components/Canvas'
import { DropdownsPanel } from './components/DropdownsPanel'
import { ZoomControls } from './components/ZoomControls'
import { SelectionInfoPopup } from './components/SelectionInfoPopup'
import { HistoryControls } from './components/HistoryControls'
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
        </div>
        <div className={`catalog-panel-body ${floatingUiVisible ? '' : 'minimized'}`}>
          <DropdownsPanel ref={dropdownPanelRef} />
        </div>
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
