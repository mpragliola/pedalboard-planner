import { faChevronDown, faChevronUp, faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Canvas } from "./components/Canvas";
import { BoardMenu } from "./components/boardmenu/BoardMenu";
import { DropdownsPanel } from "./components/catalog/DropdownsPanel";
import { CatalogDragGhost } from "./components/catalog/CatalogDragGhost";
import { ZoomControls } from "./components/zoom/ZoomControls";
import { SelectionInfoPopup } from "./components/selection/SelectionInfoPopup";
import { HistoryControls } from "./components/history/HistoryControls";
import { AppProvider, useApp } from "./context/AppContext";
import { ConfirmationProvider } from "./context/ConfirmationContext";
import "./App.css";

export type { BoardType } from "./data/boards";
export type { DeviceType } from "./data/devices";
export type { CanvasObjectType, ObjectSubtype } from "./types";

function AppContent() {
  const { dropdownPanelRef, floatingUiVisible, setFloatingUiVisible, panelExpanded, setPanelExpanded } = useApp();
  return (
    <div
      className="app-content"
      onContextMenu={(e) => e.preventDefault()}
      role="application"
      aria-label="Pedalboard editor"
    >
      <CatalogDragGhost />
      <Canvas />
      <div className={`catalog-panel${panelExpanded ? " panel-expanded" : ""}`}>
        <div className="catalog-panel-head">
          <button
            type="button"
            className="catalog-panel-toggle"
            onClick={() => setFloatingUiVisible((v) => !v)}
            title={floatingUiVisible ? "Minimize panel" : "Expand panel"}
            aria-label={floatingUiVisible ? "Minimize panel" : "Expand panel"}
          >
            <FontAwesomeIcon
              icon={floatingUiVisible ? faChevronUp : faChevronDown}
              className="catalog-panel-toggle-icon"
            />
          </button>
          <BoardMenu />
          <button
            type="button"
            className="panel-expand-btn"
            onClick={() => setPanelExpanded((e) => !e)}
            title={panelExpanded ? "Collapse panel" : "Expand panel"}
            aria-pressed={panelExpanded}
          >
            <FontAwesomeIcon icon={panelExpanded ? faChevronLeft : faChevronRight} />
          </button>
        </div>
        <div className={`catalog-panel-body ${floatingUiVisible ? "" : "minimized"}`}>
          <DropdownsPanel ref={dropdownPanelRef} />
        </div>
      </div>
      <ZoomControls />
      <HistoryControls />
      <SelectionInfoPopup />
      <p className="disclaimer" aria-live="polite">
        Prototype — may contain bugs; catalog is incomplete and may have errors.
      </p>
      <footer className="copyright">
        PedalboardFactory — by <a href="mailto:marcopragliola@gmail.com">Marco Pragliola</a>
      </footer>
    </div>
  );
}

function App() {
  return (
    <ConfirmationProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ConfirmationProvider>
  );
}

export default App;
