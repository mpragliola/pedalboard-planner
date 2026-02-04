import { useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { useApp } from "../../context/AppContext";
import { useConfirmation } from "../../context/ConfirmationContext";
import { CONNECTOR_TYPE_OPTIONS, CONNECTOR_KIND_OPTIONS, CONNECTOR_ICON_MAP } from "../../constants";
import type { Connector, ConnectorKind, ConnectorLinkType } from "../../types";
import "./ComponentListModal.css";

function nextConnectorId(): string {
  return `connector-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

interface ComponentListModalProps {
  open: boolean;
  onClose: () => void;
}

const emptyForm = {
  deviceA: "",
  deviceB: "",
  type: "audio" as ConnectorLinkType,
  connectorA: "mono jack (TS)" as ConnectorKind,
  connectorB: "mono jack (TS)" as ConnectorKind,
};

function escapeCsvField(value: string): string {
  const s = String(value ?? "");
  if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function buildComponentListCsv(
  objects: { brand?: string; model?: string; type?: string; name?: string; id: string; templateId?: string }[],
  connectors: Connector[],
  getObjectName: (id: string) => string
): string {
  const rows: string[] = [];
  rows.push("Components");
  rows.push(["Brand", "Model", "Type"].map(escapeCsvField).join(","));
  for (const obj of objects) {
    const isCustom = obj.templateId === "board-custom" || obj.templateId === "device-custom";
    const model = isCustom ? obj.name ?? "" : obj.model ?? "";
    rows.push([obj.brand ?? "", model, obj.type ?? ""].map(escapeCsvField).join(","));
  }
  rows.push("");
  rows.push("Connectors");
  rows.push(["Device A", "Device B", "Type", "Connector A", "Connector B"].map(escapeCsvField).join(","));
  for (const c of connectors) {
    rows.push(
      [getObjectName(c.deviceA), getObjectName(c.deviceB), c.type, c.connectorA, c.connectorB]
        .map(escapeCsvField)
        .join(",")
    );
  }
  return rows.join("\r\n");
}

function downloadCsv(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ComponentListModal({ open, onClose }: ComponentListModalProps) {
  const { objects, connectors, setConnectors, onDeleteObject } = useApp();
  const { requestConfirmation } = useConfirmation();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const getObjectName = useCallback((id: string) => objects.find((o) => o.id === id)?.name ?? id, [objects]);

  const startAdd = useCallback(() => {
    setForm(emptyForm);
    setEditingId("");
  }, []);

  const startEdit = useCallback((c: Connector) => {
    setForm({
      deviceA: c.deviceA,
      deviceB: c.deviceB,
      type: c.type,
      connectorA: c.connectorA,
      connectorB: c.connectorB,
    });
    setEditingId(c.id);
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setForm(emptyForm);
  }, []);

  const saveConnector = useCallback(() => {
    if (!form.deviceA || !form.deviceB) return;
    if (editingId === "") {
      setConnectors((prev) => [
        ...prev,
        {
          id: nextConnectorId(),
          deviceA: form.deviceA,
          deviceB: form.deviceB,
          type: form.type,
          connectorA: form.connectorA,
          connectorB: form.connectorB,
        },
      ]);
    } else {
      setConnectors((prev) =>
        prev.map((c) =>
          c.id === editingId
            ? {
                ...c,
                deviceA: form.deviceA,
                deviceB: form.deviceB,
                type: form.type,
                connectorA: form.connectorA,
                connectorB: form.connectorB,
              }
            : c
        )
      );
    }
    startAdd();
  }, [editingId, form, setConnectors, startAdd]);

  const removeConnector = useCallback(
    (id: string) => {
      setConnectors((prev) => prev.filter((c) => c.id !== id));
      if (editingId === id) cancelEdit();
    },
    [setConnectors, editingId, cancelEdit]
  );

  const handleRemoveComponent = useCallback(
    async (obj: { id: string; name: string }) => {
      const confirmed = await requestConfirmation({
        title: "Remove from canvas",
        message: `Remove "${obj.name}"? This cannot be undone.`,
        confirmLabel: "Remove",
        cancelLabel: "Cancel",
        danger: true,
      });
      if (confirmed) onDeleteObject(obj.id);
    },
    [requestConfirmation, onDeleteObject]
  );

  const isFormOpen = editingId !== null;
  const canSave = form.deviceA && form.deviceB;

  const handleExportCsv = useCallback(() => {
    const csv = buildComponentListCsv(objects, connectors, getObjectName);
    const filename = `pedalboard-components-${new Date().toISOString().slice(0, 10)}.csv`;
    downloadCsv(csv, filename);
  }, [objects, connectors, getObjectName]);

  if (!open) return null;

  const modal = (
    <div
      className="component-list-modal-backdrop"
      aria-hidden
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="component-list-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Component list"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="component-list-modal-header">
          <h2 className="component-list-modal-title">Component list</h2>
          <div className="component-list-modal-header-actions">
            <button
              type="button"
              className="component-list-modal-export-btn"
              onClick={handleExportCsv}
              aria-label="Export to CSV"
              title="Export components and connectors to CSV"
            >
              Export to CSV
            </button>
            <button type="button" className="component-list-modal-close" onClick={onClose} aria-label="Close">
              ×
            </button>
          </div>
        </header>
        <div className="component-list-modal-body">
          {objects.length === 0 ? (
            <p className="component-list-modal-empty">No components on the canvas.</p>
          ) : (
            <table className="component-list-table">
              <thead>
                <tr>
                  <th>Brand</th>
                  <th>Model</th>
                  <th>Type</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {objects.map((obj) => {
                  const isCustom = obj.templateId === "board-custom" || obj.templateId === "device-custom";
                  return (
                    <tr key={obj.id}>
                      <td>{obj.brand || "—"}</td>
                      <td>{isCustom ? obj.name || "—" : obj.model || "—"}</td>
                      <td>{obj.type || "—"}</td>
                      <td className="component-list-actions">
                        <button
                          type="button"
                          className="component-list-remove-btn component-list-remove-btn-icon"
                          onClick={() => handleRemoveComponent(obj)}
                          aria-label={`Remove ${obj.name}`}
                          title="Remove from canvas"
                        >
                          <span aria-hidden>×</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          <section className="connectors-section">
            <h3 className="connectors-section-title">Connectors</h3>
            {connectors.length === 0 && !isFormOpen && (
              <p className="connectors-empty">No connectors. Add one below.</p>
            )}
            {connectors.length > 0 && (
              <table className="connectors-table">
                <thead>
                  <tr>
                    <th>Device A</th>
                    <th>Device B</th>
                    <th>Type</th>
                    <th>Connectors</th>
                    <th aria-label="Actions" />
                  </tr>
                </thead>
                <tbody>
                  {connectors.map((c) => (
                    <tr key={c.id}>
                      <td>{getObjectName(c.deviceA)}</td>
                      <td>{getObjectName(c.deviceB)}</td>
                      <td>{c.type}</td>
                      <td className="connectors-icons-cell">
                        <div className="connectors-icons">
                          <img
                            src={CONNECTOR_ICON_MAP[c.connectorA]}
                            alt={c.connectorA}
                            title={c.connectorA}
                            className="connector-icon"
                          />
                          <img
                            src={CONNECTOR_ICON_MAP[c.connectorB]}
                            alt={c.connectorB}
                            title={c.connectorB}
                            className="connector-icon"
                          />
                        </div>
                      </td>
                      <td className="connectors-actions">
                        <button
                          type="button"
                          className="connectors-btn connectors-btn-icon connectors-btn-edit"
                          onClick={() => startEdit(c)}
                          title="Edit connector"
                          aria-label="Edit connector"
                        >
                          <span aria-hidden>✎</span>
                        </button>
                        <button
                          type="button"
                          className="connectors-btn connectors-btn-icon connectors-btn-remove"
                          onClick={() => removeConnector(c.id)}
                          title="Remove connector"
                          aria-label="Remove connector"
                        >
                          <span aria-hidden>×</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {isFormOpen ? (
              <div className="connectors-form">
                <h4 className="connectors-form-title">{editingId === "" ? "Add connector" : "Edit connector"}</h4>
                <div className="connectors-form-grid">
                  <div className="connectors-form-row">
                    <label htmlFor="connector-device-a">Device A</label>
                    <select
                      id="connector-device-a"
                      value={form.deviceA}
                      onChange={(e) => setForm((f) => ({ ...f, deviceA: e.target.value }))}
                    >
                      <option value="">Select device</option>
                      {objects.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="connectors-form-row">
                    <label htmlFor="connector-device-b">Device B</label>
                    <select
                      id="connector-device-b"
                      value={form.deviceB}
                      onChange={(e) => setForm((f) => ({ ...f, deviceB: e.target.value }))}
                    >
                      <option value="">Select device</option>
                      {objects.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="connectors-form-row">
                    <label htmlFor="connector-type">Type</label>
                    <select
                      id="connector-type"
                      value={form.type}
                      onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as ConnectorLinkType }))}
                    >
                      {CONNECTOR_TYPE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="connectors-form-section-title">Connector A</div>
                <div className="connector-visual-picker">
                  {CONNECTOR_KIND_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`connector-visual-option ${form.connectorA === opt.value ? "selected" : ""}`}
                      onClick={() => setForm((f) => ({ ...f, connectorA: opt.value }))}
                      title={opt.label}
                    >
                      <div className="connector-visual-icon">
                        <img src={CONNECTOR_ICON_MAP[opt.value]} alt="" />
                      </div>
                      <div className="connector-visual-label">{opt.label}</div>
                    </button>
                  ))}
                </div>

                <div className="connectors-form-section-title">Connector B</div>
                <div className="connector-visual-picker">
                  {CONNECTOR_KIND_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`connector-visual-option ${form.connectorB === opt.value ? "selected" : ""}`}
                      onClick={() => setForm((f) => ({ ...f, connectorB: opt.value }))}
                      title={opt.label}
                    >
                      <div className="connector-visual-icon">
                        <img src={CONNECTOR_ICON_MAP[opt.value]} alt="" />
                      </div>
                      <div className="connector-visual-label">{opt.label}</div>
                    </button>
                  ))}
                </div>

                <div className="connectors-form-actions">
                  <button
                    type="button"
                    className="connectors-btn connectors-btn-primary"
                    onClick={saveConnector}
                    disabled={!canSave}
                  >
                    {editingId === "" ? "Add" : "Save"}
                  </button>
                  <button type="button" className="connectors-btn connectors-btn-secondary" onClick={cancelEdit}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                className="connectors-add-btn"
                onClick={startAdd}
                disabled={objects.length < 2}
                title={objects.length < 2 ? "Add at least 2 components to create connectors" : ""}
              >
                + Add connector
              </button>
            )}
          </section>
        </div>
      </div>
    </div>
  );
  return createPortal(modal, document.body);
}
