import { useState, useEffect, useRef } from "react";
import { Modal } from "../common/Modal";
import { CONNECTOR_ICON_MAP, CONNECTOR_KIND_OPTIONS, CONNECTOR_NAME_OPTIONS } from "../../constants";
import type { Cable, CableSegment, ConnectorKind } from "../../types";
import "./AddCableModal.css";

const DEFAULT_COLOR = "#333";

function nextCableId(): string {
  return `cable-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

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
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const currentOption = CONNECTOR_KIND_OPTIONS.find((o) => o.value === value);
  const iconSrc = value ? CONNECTOR_ICON_MAP[value] : null;

  return (
    <div ref={containerRef} className="add-cable-connector-picker">
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
        className="add-cable-connector-trigger"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={`${id}-label`}
      >
        <span className="add-cable-connector-trigger-content">
          {iconSrc && (
            <img src={iconSrc} alt="" className="add-cable-connector-trigger-icon" width={20} height={20} />
          )}
          <span className="add-cable-connector-trigger-label">{currentOption?.label ?? value}</span>
        </span>
        <span className="add-cable-connector-chevron" aria-hidden>
          {open ? "▴" : "▾"}
        </span>
      </button>
      {open && (
        <ul
          className="add-cable-connector-dropdown"
          role="listbox"
          aria-labelledby={`${id}-label`}
        >
          {CONNECTOR_KIND_OPTIONS.map((opt) => (
            <li
              key={opt.value}
              role="option"
              aria-selected={opt.value === value}
              className={`add-cable-connector-option${opt.value === value ? " add-cable-connector-option-selected" : ""}`}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
            >
              {CONNECTOR_ICON_MAP[opt.value] && (
                <img
                  src={CONNECTOR_ICON_MAP[opt.value]}
                  alt=""
                  className="add-cable-connector-option-icon"
                  width={20}
                  height={20}
                />
              )}
              <span>{opt.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export interface AddCableModalProps {
  open: boolean;
  segments: CableSegment[];
  onConfirm: (cable: Cable) => void;
  onCancel: () => void;
}

export function AddCableModal({ open, segments, onConfirm, onCancel }: AddCableModalProps) {
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [connectorA, setConnectorA] = useState<ConnectorKind>("mono jack (TS)");
  const [connectorB, setConnectorB] = useState<ConnectorKind>("mono jack (TS)");
  const [connectorAName, setConnectorAName] = useState("");
  const [connectorBName, setConnectorBName] = useState("");

  useEffect(() => {
    if (open) {
      setColor(DEFAULT_COLOR);
      setConnectorA("mono jack (TS)");
      setConnectorB("mono jack (TS)");
      setConnectorAName("");
      setConnectorBName("");
    }
  }, [open]);

  const handleConfirm = () => {
    if (segments.length === 0) return;
    const cable: Cable = {
      id: nextCableId(),
      segments,
      color,
      connectorA,
      connectorB,
      ...(connectorAName.trim() && { connectorAName: connectorAName.trim() }),
      ...(connectorBName.trim() && { connectorBName: connectorBName.trim() }),
    };
    onConfirm(cable);
  };

  if (!open) return null;

  return (
    <Modal
      open={open}
      onClose={onCancel}
      title="Add cable"
      className="add-cable-modal"
      ariaLabel="Add cable – choose color and connectors"
    >
      <div className="add-cable-form">
        <div className="add-cable-row add-cable-color-row">
          <label htmlFor="add-cable-color" className="add-cable-label">Color</label>
          <div className="add-cable-color-inputs">
            <input
              id="add-cable-color"
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="add-cable-color-swatch"
              aria-label="Cable color"
            />
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="add-cable-color-hex"
              placeholder="#333"
              aria-label="Hex color"
            />
          </div>
        </div>

        <div className="add-cable-endpoints">
          <span className="add-cable-label">Endpoints</span>
          <div className="add-cable-endpoint">
            <span className="add-cable-endpoint-badge" aria-hidden>A</span>
            <ConnectorPicker
              id="add-cable-connector-a"
              label=""
              value={connectorA}
              onChange={setConnectorA}
            />
            <input
              id="add-cable-connector-a-name"
              type="text"
              list="connector-name-list"
              value={connectorAName}
              onChange={(e) => setConnectorAName(e.target.value)}
              className="add-cable-name"
              placeholder="Label"
              aria-label="Connector A label"
            />
          </div>
          <div className="add-cable-endpoint">
            <span className="add-cable-endpoint-badge" aria-hidden>B</span>
            <ConnectorPicker
              id="add-cable-connector-b"
              label=""
              value={connectorB}
              onChange={setConnectorB}
            />
            <input
              id="add-cable-connector-b-name"
              type="text"
              list="connector-name-list"
              value={connectorBName}
              onChange={(e) => setConnectorBName(e.target.value)}
              className="add-cable-name"
              placeholder="Label"
              aria-label="Connector B label"
            />
          </div>
        </div>

        <datalist id="connector-name-list">
          {CONNECTOR_NAME_OPTIONS.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>

        <div className="add-cable-actions">
          <button type="button" className="add-cable-btn add-cable-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="add-cable-btn add-cable-confirm" onClick={handleConfirm}>
            Add cable
          </button>
        </div>
      </div>
    </Modal>
  );
}
