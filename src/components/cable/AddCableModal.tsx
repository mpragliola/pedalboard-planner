import { useState, useEffect } from "react";
import { Modal } from "../common/Modal";
import { CONNECTOR_KIND_OPTIONS, CONNECTOR_NAME_OPTIONS } from "../../constants";
import type { Cable, CableSegment, ConnectorKind } from "../../types";
import "./AddCableModal.css";

const DEFAULT_COLOR = "#333";

function nextCableId(): string {
  return `cable-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
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
        <div className="add-cable-field">
          <label htmlFor="add-cable-color">Color</label>
          <div className="add-cable-color-row">
            <input
              id="add-cable-color"
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="add-cable-color-input"
            />
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="add-cable-color-hex"
              placeholder="#333"
            />
          </div>
        </div>
        <div className="add-cable-field">
          <label htmlFor="add-cable-connector-a">Connector A</label>
          <select
            id="add-cable-connector-a"
            value={connectorA}
            onChange={(e) => setConnectorA(e.target.value as ConnectorKind)}
            className="add-cable-select"
          >
            {CONNECTOR_KIND_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <label htmlFor="add-cable-connector-a-name" className="add-cable-sublabel">
            Name (optional)
          </label>
          <input
            id="add-cable-connector-a-name"
            type="text"
            list="connector-name-list"
            value={connectorAName}
            onChange={(e) => setConnectorAName(e.target.value)}
            className="add-cable-combo"
            placeholder="e.g. Input, Output"
          />
        </div>
        <div className="add-cable-field">
          <label htmlFor="add-cable-connector-b">Connector B</label>
          <select
            id="add-cable-connector-b"
            value={connectorB}
            onChange={(e) => setConnectorB(e.target.value as ConnectorKind)}
            className="add-cable-select"
          >
            {CONNECTOR_KIND_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <label htmlFor="add-cable-connector-b-name" className="add-cable-sublabel">
            Name (optional)
          </label>
          <input
            id="add-cable-connector-b-name"
            type="text"
            list="connector-name-list"
            value={connectorBName}
            onChange={(e) => setConnectorBName(e.target.value)}
            className="add-cable-combo"
            placeholder="e.g. Input, Output"
          />
        </div>
        <datalist id="connector-name-list">
          {CONNECTOR_NAME_OPTIONS.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
        <div className="add-cable-actions">
          <button type="button" className="add-cable-btn add-cable-confirm" onClick={handleConfirm}>
            Add cable
          </button>
          <button type="button" className="add-cable-btn add-cable-cancel" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
}
