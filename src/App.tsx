import { faChevronDown, faChevronUp, faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Canvas } from "./components/Canvas";
import { BoardMenu } from "./components/boardmenu/BoardMenu";
import { DropdownsPanel } from "./components/catalog/DropdownsPanel";
import { CatalogDndProvider } from "./components/catalog/CatalogDndProvider";
import { ZoomControls } from "./components/zoom/ZoomControls";
import { SelectionInfoPopup } from "./components/selection/SelectionInfoPopup";
import { HistoryControls } from "./components/history/HistoryControls";
import { Mini3DOverlay } from "./components/mini3d/Mini3DOverlay";
import { AppProvider, useApp } from "./context/AppContext";
import { ConfirmationProvider } from "./context/ConfirmationContext";
import { SettingsModalProvider, useSettingsModal } from "./context/SettingsModalContext";
import { SettingsModal } from "./components/settings/SettingsModal";
import { useUi } from "./context/UiContext";
import "./App.scss";

function AppContent() {
  const { dropdownPanelRef } = useApp();
  const { floatingUiVisible, setFloatingUiVisible, panelExpanded, setPanelExpanded } = useUi();
  const { open: settingsOpen, setOpen: setSettingsOpen } = useSettingsModal();
  return (
    <div
      className="app-content"
      onContextMenu={(e) => e.preventDefault()}
      role="application"
      aria-label="Pedalboard editor"
    >
      <Canvas />
      <Mini3DOverlay />
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
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
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
        <SettingsModalProvider>
          <CatalogDndProvider>
            <AppContent />
          </CatalogDndProvider>
        </SettingsModalProvider>
      </AppProvider>
    </ConfirmationProvider>
  );
}

export default App;
