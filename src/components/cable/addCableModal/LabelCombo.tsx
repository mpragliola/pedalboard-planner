import { useContext, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CONNECTOR_NAME_OPTIONS } from "../../../constants";
import { ModalContext } from "../../../context/ModalContext";

interface LabelComboProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
}

/**
 * Text input with optional suggestion overlay.
 * Overlay lives in modal portal target so touch interactions are reliable on mobile.
 */
export function LabelCombo({ id, value, onChange, ariaLabel }: LabelComboProps) {
  const modalDialogRef = useContext(ModalContext);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const portalTarget = (modalDialogRef?.current ?? null) || document.body;

  const overlay =
    open &&
    createPortal(
      <div
        className="add-cable-picker-overlay"
        role="dialog"
        aria-label={ariaLabel}
        onClick={() => setOpen(false)}
        onTouchEnd={(e) => e.target === e.currentTarget && setOpen(false)}
      >
        <div
          className="add-cable-picker-overlay-panel"
          onClick={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
        >
          <div className="add-cable-picker-overlay-head">
            <span className="add-cable-picker-overlay-title">Label</span>
            <button
              type="button"
              className="add-cable-picker-overlay-close"
              onClick={() => setOpen(false)}
              aria-label="Close"
            >
              ×
            </button>
          </div>
          <ul id={`${id}-list`} className="add-cable-picker-overlay-list" role="listbox">
            {CONNECTOR_NAME_OPTIONS.map((suggestion) => (
              <li key={suggestion} role="option" aria-selected={value === suggestion}>
                <button
                  type="button"
                  className="add-cable-picker-overlay-option"
                  onClick={() => {
                    onChange(suggestion);
                    setOpen(false);
                    inputRef.current?.focus();
                  }}
                >
                  {suggestion}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>,
      portalTarget
    );

  return (
    <div
      className="add-cable-label-combo"
      onClick={(e) => {
        if ((e.target as HTMLElement).closest(".add-cable-label-combo-btn")) return;
        inputRef.current?.focus();
      }}
    >
      <input
        ref={inputRef}
        id={id}
        type="text"
        className="add-cable-name add-cable-label-combo-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Label (optional)"
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={open ? `${id}-list` : undefined}
        autoComplete="off"
        inputMode="text"
        readOnly={false}
      />
      <button
        type="button"
        className="add-cable-label-combo-btn"
        aria-label="Choose suggestion"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        ▾
      </button>
      {overlay}
    </div>
  );
}
