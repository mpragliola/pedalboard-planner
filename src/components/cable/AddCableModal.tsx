import { useState, useEffect, useRef } from "react";
import { Modal } from "../common/Modal";
import { CONNECTOR_ICON_MAP, CONNECTOR_KIND_OPTIONS, CONNECTOR_NAME_OPTIONS } from "../../constants";
import type { Cable, CableSegment, ConnectorKind } from "../../types";
import "./AddCableModal.css";

const DEFAULT_COLOR = "#333";

const CABLE_COLOR_OPTIONS: string[] = [
  "#333",
  "#000",
  "#fff",
  "#c00",
  "#06c",
  "#080",
  "#c90",
  "#609",
  "#f80",
  "#0aa",
  "#666",
  "#a52a2a",
  "#ff69b4",
  "#2e8b57",
  "#ffd700",
  "#4a4a4a",
];

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
  /** When set, modal is in edit mode: pre-fill from cable, keep id and segments, title "Edit cable". */
  initialCable?: Cable | null;
}

export function AddCableModal({ open, segments, onConfirm, onCancel, initialCable }: AddCableModalProps) {
  const isEdit = Boolean(initialCable);
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [connectorA, setConnectorA] = useState<ConnectorKind>("mono jack (TS)");
  const [connectorB, setConnectorB] = useState<ConnectorKind>("mono jack (TS)");
  const [connectorAName, setConnectorAName] = useState("");
  const [connectorBName, setConnectorBName] = useState("");

  useEffect(() => {
    if (open) {
      if (initialCable) {
        setColor(
          CABLE_COLOR_OPTIONS.includes(initialCable.color) ? initialCable.color : CABLE_COLOR_OPTIONS[0]
        );
        setConnectorA(initialCable.connectorA);
        setConnectorB(initialCable.connectorB);
        setConnectorAName(initialCable.connectorAName ?? "");
        setConnectorBName(initialCable.connectorBName ?? "");
      } else {
        setColor(DEFAULT_COLOR);
        setConnectorA("mono jack (TS)");
        setConnectorB("mono jack (TS)");
        setConnectorAName("");
        setConnectorBName("");
      }
    }
  }, [open, initialCable]);

  const handleConfirm = () => {
    const segs = isEdit && initialCable ? initialCable.segments : segments;
    if (segs.length === 0) return;
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
            {CABLE_COLOR_OPTIONS.map((hex) => (
              <button
                key={hex}
                type="button"
                className={`add-cable-color-swatch-btn${color === hex ? " add-cable-color-swatch-btn-selected" : ""}`}
                style={{ backgroundColor: hex }}
                onClick={() => setColor(hex)}
                title={hex}
                aria-label={`Color ${hex}`}
                aria-pressed={color === hex}
              />
            ))}
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
            {isEdit ? "Save" : "Add cable"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
