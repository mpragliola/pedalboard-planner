import { useApp } from "../../context/AppContext";
import { Modal } from "../common/Modal";
import "./SettingsModal.css";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const { unit, setUnit } = useApp();

  return (
    <Modal open={open} onClose={onClose} title="Settings" className="settings-modal">
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
    </Modal>
  );
}
