import { useCallback } from "react";
import { createPortal } from "react-dom";
import { useApp } from "../../context/AppContext";
import { useConfirmation } from "../../context/ConfirmationContext";
import { CONNECTOR_ICON_MAP } from "../../constants";
import type { Cable, ConnectorKind } from "../../types";
import "./ComponentListModal.css";

function ConnectorIcon({ kind, title }: { kind: ConnectorKind; title: string }) {
  const src = CONNECTOR_ICON_MAP[kind];
  if (!src) return <span title={title}>{title}</span>;
  return (
    <img
      src={src}
      alt=""
      className="connector-icon"
      title={title}
      width={24}
      height={24}
    />
  );
}

interface ComponentListModalProps {
  open: boolean;
  onClose: () => void;
}

function escapeCsvField(value: string): string {
  const s = String(value ?? "");
  if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function buildComponentListCsv(
  objects: { brand?: string; model?: string; type?: string; name?: string; id: string; templateId?: string }[],
  cables: Cable[],
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
  rows.push("Cables");
  rows.push(
    ["ID", "Connector A", "Connector A name", "Connector B", "Connector B name", "Segments"]
      .map(escapeCsvField)
      .join(",")
  );
  for (const cable of cables) {
    rows.push(
      [
        cable.id,
        cable.connectorA,
        cable.connectorAName ?? "",
        cable.connectorB,
        cable.connectorBName ?? "",
        String(cable.segments.length),
      ]
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
  const { objects, cables, setCables, onDeleteObject } = useApp();
  const { requestConfirmation } = useConfirmation();

  const getObjectName = useCallback((id: string) => objects.find((o) => o.id === id)?.name ?? id, [objects]);

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

  const handleExportCsv = useCallback(() => {
    const csv = buildComponentListCsv(objects, cables, getObjectName);
    const filename = `pedalboard-components-${new Date().toISOString().slice(0, 10)}.csv`;
    downloadCsv(csv, filename);
  }, [objects, cables, getObjectName]);

  const removeCable = useCallback(
    (id: string) => {
      setCables((prev) => prev.filter((c) => c.id !== id));
    },
    [setCables]
  );

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
              title="Export components and cables to CSV"
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

          <section className="connectors-section cables-section">
            <h3 className="connectors-section-title">Cables</h3>
            {cables.length === 0 ? (
              <p className="connectors-empty">No cables. Use Cable layer to draw cables on the canvas.</p>
            ) : (
              <table className="connectors-table cables-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Color</th>
                    <th>Connector A</th>
                    <th>Connector B</th>
                    <th aria-label="Actions" />
                  </tr>
                </thead>
                <tbody>
                  {cables.map((cable, index) => (
                    <tr key={cable.id}>
                      <td>Cable {index + 1}</td>
                      <td>
                        <span
                          className="cable-color-swatch"
                          style={{ backgroundColor: cable.color }}
                          title={cable.color}
                        />
                      </td>
                      <td className="connectors-icons-cell">
                        <span className="connectors-icons connectors-icons-with-name">
                          <ConnectorIcon kind={cable.connectorA} title={cable.connectorA} />
                          {cable.connectorAName ? (
                            <span className="connector-name" title={cable.connectorAName}>
                              {cable.connectorAName}
                            </span>
                          ) : null}
                        </span>
                      </td>
                      <td className="connectors-icons-cell">
                        <span className="connectors-icons connectors-icons-with-name">
                          <ConnectorIcon kind={cable.connectorB} title={cable.connectorB} />
                          {cable.connectorBName ? (
                            <span className="connector-name" title={cable.connectorBName}>
                              {cable.connectorBName}
                            </span>
                          ) : null}
                        </span>
                      </td>
                      <td className="connectors-actions">
                        <button
                          type="button"
                          className="connectors-btn connectors-btn-icon connectors-btn-remove"
                          onClick={() => removeCable(cable.id)}
                          title="Remove cable"
                          aria-label="Remove cable"
                        >
                          <span aria-hidden>×</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </div>
      </div>
    </div>
  );
  return createPortal(modal, document.body);
}
