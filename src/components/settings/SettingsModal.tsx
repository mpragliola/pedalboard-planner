import { createPortal } from "react-dom";
import { useApp } from "../../context/AppContext";
import "./SettingsModal.css";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const { unit, setUnit } = useApp();

  if (!open) return null;

  const modal = (
    <div className="settings-modal-backdrop" aria-hidden onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div
        className="settings-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Settings"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="settings-modal-header">
          <h2 className="settings-modal-title">Settings</h2>
          <button type="button" className="settings-modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>
        <div className="settings-modal-body">
          <div className="settings-param">
            <label htmlFor="settings-unit" className="settings-param-label">
              Units
            </label>
            <select
              id="settings-unit"
              className="settings-param-select"
              value={unit}
              onChange={(e) => setUnit(e.target.value as "mm" | "in")}
              aria-describedby="settings-unit-desc"
            >
              <option value="mm">Millimeters (mm)</option>
              <option value="in">Inches (in)</option>
            </select>
            <p id="settings-unit-desc" className="settings-param-desc">
              Grid and dimensions use this unit. Grid step: 1 cm for mm, 1 in for in.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
  return createPortal(modal, document.body);
}
