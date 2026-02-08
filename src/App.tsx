import { useEffect, useState } from "react";
import { faChevronDown, faChevronUp, faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Canvas } from "./components/Canvas";
import { BoardMenu } from "./components/boardmenu/BoardMenu";
import { DropdownsPanel } from "./components/catalog/DropdownsPanel";
import { SideControls } from "./components/zoom/SideControls";
import { SelectionInfoPopup } from "./components/selection/SelectionInfoPopup";
import { BottomControls } from "./components/history/BottomControls";
import { Mini3DOverlay } from "./components/mini3d/Mini3DOverlay";
import { OverlayMessage } from "./components/common/OverlayMessage";
import { AppProviders } from "./context/AppProviders";
import { useSettingsModal } from "./context/SettingsModalContext";
import { SettingsModal } from "./components/settings/SettingsModal";
import { useCatalog } from "./context/CatalogContext";
import { useCable } from "./context/CableContext";
import { useUi } from "./context/UiContext";
import "./App.scss";

function AppContent() {
  const { dropdownPanelRef } = useCatalog();
  const { showMini3d, floatingUiVisible, setFloatingUiVisible, panelExpanded, setPanelExpanded } = useUi();
  const { selectedCableId } = useCable();
  const { open: settingsOpen, setOpen: setSettingsOpen } = useSettingsModal();
  const [mini3dMounted, setMini3dMounted] = useState(showMini3d);

  useEffect(() => {
    if (showMini3d) {
      setFloatingUiVisible(false);
      setPanelExpanded(false);
    }
  }, [showMini3d, setFloatingUiVisible, setPanelExpanded]);

  useEffect(() => {
    if (showMini3d) {
      setMini3dMounted(true);
    }
  }, [showMini3d]);

  return (
    <div
      className="app-content"
      onContextMenu={(e) => e.preventDefault()}
      role="application"
      aria-label="Pedalboard editor"
    >
      <Canvas />
      {mini3dMounted ? <Mini3DOverlay onCloseComplete={() => setMini3dMounted(false)} /> : null}
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
      <SideControls />
      <BottomControls />
      <SelectionInfoPopup />
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <OverlayMessage
        message={
          selectedCableId
            ? "Click and drag to move. Double click to add point. Long click to remove point"
            : "Prototype — may contain bugs; catalog is incomplete and may have errors."
        }
      />
      <footer className="copyright">
        PedalboardFactory — by <a href="mailto:marcopragliola@gmail.com">Marco Pragliola</a>
      </footer>
    </div>
  );
}

function App() {
  return (
    <AppProviders>
      <AppContent />
    </AppProviders>
  );
}

export default App;
