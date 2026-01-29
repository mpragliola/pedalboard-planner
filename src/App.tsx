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
  const { dropdownPanelRef } = useApp()
  return (
    <>
      <Canvas />
      <DropdownsPanel ref={dropdownPanelRef} />
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
