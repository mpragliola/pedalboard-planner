import { useUi } from "../../context/UiContext";
import { Modal } from "../common/Modal";
import { CANVAS_BACKGROUNDS } from "../../constants/backgrounds";
import "./SettingsModal.scss";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const { unit, setUnit, background, setBackground } = useUi();

  return (
    <Modal open={open} onClose={onClose} title="Settings" className="settings-modal modal-dialog--compact-close">
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
      <div className="settings-param">
        <p className="settings-param-label" id="settings-background-label">
          Background
        </p>
        <div className="settings-bg-grid" role="radiogroup" aria-labelledby="settings-background-label">
          {CANVAS_BACKGROUNDS.map((option) => {
            const active = option.id === background;
            return (
              <button
                key={option.id}
                type="button"
                className={`settings-bg-option ${active ? "is-active" : ""}`}
                role="radio"
                aria-checked={active}
                aria-label={option.label}
                onClick={() => setBackground(option.id)}
              >
                <span
                  className="settings-bg-preview"
                  style={{
                    backgroundImage: `url("${option.imageUrl}")`,
                    backgroundSize: "120px auto",
                  }}
                />
                <span className="settings-bg-name">{option.label}</span>
              </button>
            );
          })}
        </div>
        <p id="settings-background-desc" className="settings-param-desc">
          Changes the board texture behind all pedals and cables.
        </p>
      </div>
    </Modal>
  );
}
