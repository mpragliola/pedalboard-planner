import { useState, useEffect, useRef, useContext } from "react";
import { createPortal } from "react-dom";
import { Modal } from "../common/Modal";
import { ModalContext } from "../../context/ModalContext";
import { CONNECTOR_KIND_OPTIONS, CONNECTOR_NAME_OPTIONS } from "../../constants";
import {
  CABLE_COLORS,
  CABLE_CONNECTOR_TEMPLATES,
  CABLE_COLOR_OPTIONS,
  CABLE_TERMINAL_START_COLOR,
  CABLE_TERMINAL_END_COLOR,
} from "../../constants/cables";
import type { Cable, ConnectorKind } from "../../types";
import type { Point } from "../../lib/vector";
import { ConnectorIcon } from "../common/ConnectorIcon";
import "./AddCableModal.scss";

const DEFAULT_COLOR = CABLE_COLORS[0].hex;
const DEFAULT_CONNECTOR: ConnectorKind = "mono jack (TS)";

function nextCableId(): string {
  return `cable-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function findTemplateName(connectorA: ConnectorKind, connectorB: ConnectorKind): string {
  return (
    CABLE_CONNECTOR_TEMPLATES.find(
      (template) => connectorA === template.connectorA && connectorB === template.connectorB
    )?.name ?? ""
  );
}

/** Connector type: button opens full-screen overlay picker (reliable on mobile). */
function ConnectorPicker({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: ConnectorKind;
  onChange: (kind: ConnectorKind) => void;
}) {
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
            {CONNECTOR_KIND_OPTIONS.map((opt) => (
              <li key={opt.value} role="option" aria-selected={opt.value === value}>
                <button
                  type="button"
                  className="add-cable-picker-overlay-option"
                  onClick={() => {
                    onChange(opt.value);
                    setOverlayOpen(false);
                  }}
                >
                  <ConnectorIcon kind={opt.value} width={24} height={24} style={{ flexShrink: 0 }} />
                  <span>{opt.label}</span>
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
        <span id={`${id}-label`} className="add-cable-sr-only">Connector type</span>
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
          <ConnectorIcon kind={value} className="add-cable-connector-trigger-icon" width={24} height={24} />
          <span className="add-cable-connector-trigger-label">{currentOption?.label ?? value}</span>
        </span>
        <span className="add-cable-connector-chevron" aria-hidden>▾</span>
      </button>
      {overlay}
    </div>
  );
}

/** Combobox: text input + full-screen overlay for suggestions (reliable on mobile). */
function LabelCombo({
  id,
  value,
  onChange,
  ariaLabel,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  ariaLabel: string;
}) {
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
            {CONNECTOR_NAME_OPTIONS.map((s) => (
              <li key={s} role="option" aria-selected={value === s}>
                <button
                  type="button"
                  className="add-cable-picker-overlay-option"
                  onClick={() => {
                    onChange(s);
                    setOpen(false);
                    inputRef.current?.focus();
                  }}
                >
                  {s}
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

export interface AddCableModalProps {
  open: boolean;
  segments: Point[];
  onConfirm: (cable: Cable) => void;
  onCancel: () => void;
  /** When set, modal is in edit mode: pre-fill from cable, keep id and segments, title "Edit cable". */
  initialCable?: Cable | null;
}

export function AddCableModal({ open, segments, onConfirm, onCancel, initialCable }: AddCableModalProps) {
  const isEdit = Boolean(initialCable);
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [connectorA, setConnectorA] = useState<ConnectorKind>(DEFAULT_CONNECTOR);
  const [connectorB, setConnectorB] = useState<ConnectorKind>(DEFAULT_CONNECTOR);
  const [selectedTemplateName, setSelectedTemplateName] = useState("");
  const [connectorAName, setConnectorAName] = useState("");
  const [connectorBName, setConnectorBName] = useState("");
  const prevOpenRef = useRef(false);

  useEffect(() => {
    if (open && !prevOpenRef.current) {
      prevOpenRef.current = true;
      if (initialCable) {
        setColor(
          CABLE_COLOR_OPTIONS.includes(initialCable.color) ? initialCable.color : CABLE_COLOR_OPTIONS[0]
        );
        setConnectorA(initialCable.connectorA);
        setConnectorB(initialCable.connectorB);
        setSelectedTemplateName(findTemplateName(initialCable.connectorA, initialCable.connectorB));
        setConnectorAName(initialCable.connectorAName ?? "");
        setConnectorBName(initialCable.connectorBName ?? "");
      } else {
        setColor(DEFAULT_COLOR);
        setConnectorA(DEFAULT_CONNECTOR);
        setConnectorB(DEFAULT_CONNECTOR);
        setSelectedTemplateName("");
        setConnectorAName("");
        setConnectorBName("");
      }
    }
    if (!open) prevOpenRef.current = false;
  }, [open, initialCable]);

  const handleConfirm = () => {
    const segs = isEdit && initialCable ? initialCable.segments : segments;
    if (segs.length < 2) return;
    const cable: Cable = {
      id: isEdit && initialCable ? initialCable.id : nextCableId(),
      segments: segs,
      color,
      connectorA,
      connectorB,
      ...(connectorAName.trim() && { connectorAName: connectorAName.trim() }),
      ...(connectorBName.trim() && { connectorBName: connectorBName.trim() }),
    };
    onConfirm(cable);
  };

  const handleSwapConnectors = () => {
    const nextConnectorA = connectorB;
    const nextConnectorB = connectorA;
    const nextConnectorAName = connectorBName;
    const nextConnectorBName = connectorAName;
    setConnectorA(nextConnectorA);
    setConnectorB(nextConnectorB);
    setSelectedTemplateName(findTemplateName(nextConnectorA, nextConnectorB));
    setConnectorAName(nextConnectorAName);
    setConnectorBName(nextConnectorBName);
  };

  const handleConnectorAChange = (nextConnector: ConnectorKind) => {
    setConnectorA(nextConnector);
    setSelectedTemplateName("");
  };

  const handleConnectorBChange = (nextConnector: ConnectorKind) => {
    setConnectorB(nextConnector);
    setSelectedTemplateName("");
  };

  const handleTemplateChange = (templateName: string) => {
    setSelectedTemplateName(templateName);
    if (!templateName) return;
    const template = CABLE_CONNECTOR_TEMPLATES.find((item) => item.name === templateName);
    if (!template) return;
    setConnectorA(template.connectorA);
    setConnectorB(template.connectorB);
  };

  if (!open) return null;

  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={isEdit ? "Edit cable" : "Add cable"}
      className="add-cable-modal"
      ariaLabel={isEdit ? "Edit cable – color and connectors" : "Add cable – choose color and connectors"}
      ignoreBackdropClickForMs={200}
    >
      <div className="add-cable-form">
        <div className="add-cable-row add-cable-color-row">
          <span className="add-cable-label">Color</span>
          <div className="add-cable-color-swatches" role="group" aria-label="Cable color">
            {CABLE_COLORS.map((cableColor) => (
              <button
                key={cableColor.hex}
                type="button"
                className={`add-cable-color-swatch-btn${color === cableColor.hex ? " add-cable-color-swatch-btn-selected" : ""}`}
                style={{ backgroundColor: cableColor.hex }}
                onClick={() => setColor(cableColor.hex)}
                title={cableColor.label}
                aria-label={cableColor.label}
                aria-pressed={color === cableColor.hex}
              />
            ))}
          </div>
        </div>

        <div className="add-cable-endpoints">
          <div className="add-cable-endpoints-head">
            <span className="add-cable-label">Endpoints</span>
            <div className="add-cable-endpoints-actions">
              <label htmlFor="add-cable-template-select" className="add-cable-sr-only">
                Connector template
              </label>
              <select
                id="add-cable-template-select"
                className="add-cable-template-select"
                value={selectedTemplateName}
                onChange={(e) => handleTemplateChange(e.target.value)}
                aria-label="Connector template"
              >
                <option value="" aria-label="No template"> </option>
                {CABLE_CONNECTOR_TEMPLATES.map((template) => (
                  <option key={template.name} value={template.name}>
                    {template.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="add-cable-swap-btn"
                onClick={handleSwapConnectors}
                title="Swap connector A and B"
                aria-label="Swap connector A and B"
              >
                Swap A/B
              </button>
            </div>
          </div>
          <div className="add-cable-endpoints-grid">
            <div className="add-cable-endpoint">
              <div className="add-cable-endpoint-head-row">
                <span
                  className="add-cable-endpoint-badge add-cable-endpoint-badge-a"
                  style={{ backgroundColor: CABLE_TERMINAL_START_COLOR, color: "#1a4d1a" }}
                  aria-hidden
                >
                  A
                </span>
                <ConnectorPicker
                  id="add-cable-connector-a"
                  label=""
                  value={connectorA}
                  onChange={handleConnectorAChange}
                />
              </div>
              <LabelCombo
                id="add-cable-connector-a-name"
                value={connectorAName}
                onChange={setConnectorAName}
                ariaLabel="Connector A label"
              />
            </div>
            <div className="add-cable-endpoint">
              <div className="add-cable-endpoint-head-row">
                <span
                  className="add-cable-endpoint-badge add-cable-endpoint-badge-b"
                  style={{ backgroundColor: CABLE_TERMINAL_END_COLOR, color: "#b35c00" }}
                  aria-hidden
                >
                  B
                </span>
                <ConnectorPicker
                  id="add-cable-connector-b"
                  label=""
                  value={connectorB}
                  onChange={handleConnectorBChange}
                />
              </div>
              <LabelCombo
                id="add-cable-connector-b-name"
                value={connectorBName}
                onChange={setConnectorBName}
                ariaLabel="Connector B label"
              />
            </div>
          </div>
        </div>

        <div className="add-cable-actions">
          <button type="button" className="add-cable-btn add-cable-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="add-cable-btn add-cable-confirm" onClick={handleConfirm}>
            {isEdit ? "Save" : "Add cable"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
