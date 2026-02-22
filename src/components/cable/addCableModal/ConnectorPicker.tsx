import { useContext, useState } from "react";
import { createPortal } from "react-dom";
import { CONNECTOR_KIND_OPTIONS } from "../../../constants";
import type { ConnectorKind } from "../../../types";
import { ModalContext } from "../../../context/ModalContext";
import { ConnectorIcon } from "../../common/ConnectorIcon";

interface ConnectorPickerProps {
  id: string;
  label: string;
  value: ConnectorKind;
  onChange: (kind: ConnectorKind) => void;
}

/**
 * Connector selector rendered as a trigger button + full-screen overlay list.
 * Overlay uses portal target from ModalContext so stacking/focus stay inside modal tree.
 */
export function ConnectorPicker({ id, label, value, onChange }: ConnectorPickerProps) {
  const modalDialogRef = useContext(ModalContext);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const currentOption = CONNECTOR_KIND_OPTIONS.find((o) => o.value === value);
  const portalTarget = (modalDialogRef?.current ?? null) || document.body;

  const overlay =
    overlayOpen &&
    createPortal(
      <div
        className="add-cable-picker-overlay"
        role="dialog"
        aria-label="Choose connector type"
        onClick={() => setOverlayOpen(false)}
        onTouchEnd={(e) => e.target === e.currentTarget && setOverlayOpen(false)}
      >
        <div
          className="add-cable-picker-overlay-panel"
          onClick={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
        >
          <div className="add-cable-picker-overlay-head">
            <span className="add-cable-picker-overlay-title">Connector type</span>
            <button
              type="button"
              className="add-cable-picker-overlay-close"
              onClick={() => setOverlayOpen(false)}
              aria-label="Close"
            >
              ×
            </button>
          </div>
          <ul className="add-cable-picker-overlay-list" role="listbox">
            {CONNECTOR_KIND_OPTIONS.map((option) => (
              <li key={option.value} role="option" aria-selected={option.value === value}>
                <button
                  type="button"
                  className="add-cable-picker-overlay-option"
                  onClick={() => {
                    onChange(option.value);
                    setOverlayOpen(false);
                  }}
                >
                  <ConnectorIcon kind={option.value} size={24} className="add-cable-picker-overlay-icon" />
                  <span>{option.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>,
      portalTarget
    );

  return (
    <div className="add-cable-connector-picker">
      {label ? (
        <label id={`${id}-label`} htmlFor={id} className="add-cable-connector-picker-label">
          {label}
        </label>
      ) : (
        <span id={`${id}-label`} className="add-cable-sr-only">
          Connector type
        </span>
      )}

      <button
        type="button"
        id={id}
        className="add-cable-connector-trigger-btn"
        aria-labelledby={`${id}-label`}
        aria-haspopup="dialog"
        aria-expanded={overlayOpen}
        onClick={() => setOverlayOpen(true)}
      >
        <span className="add-cable-connector-trigger-content">
          <ConnectorIcon kind={value} className="add-cable-connector-trigger-icon" size={24} />
          <span className="add-cable-connector-trigger-label">{currentOption?.label ?? value}</span>
        </span>
        <span className="add-cable-connector-chevron" aria-hidden>
          ▾
        </span>
      </button>
      {overlay}
    </div>
  );
}
