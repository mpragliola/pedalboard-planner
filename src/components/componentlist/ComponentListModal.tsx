import { useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileCsv } from "@fortawesome/free-solid-svg-icons";
import { useBoard } from "../../context/BoardContext";
import { useCable } from "../../context/CableContext";
import { useConfirmation } from "../../context/ConfirmationContext";
import { BASE_URL, DEFAULT_OBJECT_COLOR } from "../../constants";
import { formatLengthCm } from "../../lib/rulerFormat";
import { vec2Length, vec2Sub } from "../../lib/vector";
import type { Cable, CanvasObjectType } from "../../types";
import { ConnectorIcon } from "../common/ConnectorIcon";
import "./ComponentListModal.scss";

function imageSrc(path: string | null | undefined): string {
  if (!path) return "";
  if (path.startsWith("/") || path.startsWith("http")) return path;
  const base = BASE_URL.endsWith("/") ? BASE_URL : `${BASE_URL}/`;
  return `${base}${path}`;
}

function ComponentThumbnail({ obj }: { obj: CanvasObjectType }) {
  const hasImage = obj.image != null && obj.image !== "";
  return (
    <div className="component-list-thumbnail" title={obj.name}>
      {hasImage ? (
        <img src={imageSrc(obj.image)} alt="" className="component-list-thumbnail-img" />
      ) : (
        <span
          className="component-list-thumbnail-color"
          style={{ backgroundColor: obj.color ?? DEFAULT_OBJECT_COLOR }}
        />
      )}
    </div>
  );
}

function cableLengthMm(points: Cable["segments"]): number {
  if (points.length < 2) return 0;
  let sum = 0;
  for (let i = 1; i < points.length; i += 1) {
    sum += vec2Length(vec2Sub(points[i], points[i - 1]));
  }
  return sum;
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
  cables: Cable[]
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
    ["ID", "Connector A", "Connector A name", "Connector B", "Connector B name", "Length (mm)", "Segments"]
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
        String(cableLengthMm(cable.segments).toFixed(1)),
        String(Math.max(0, cable.segments.length - 1)),
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
  const { objects, onDeleteObject, setSelectedObjectIds } = useBoard();
  const { cables, setCables, setSelectedCableId } = useCable();
  const { requestConfirmation } = useConfirmation();

  const handleComponentRowDoubleClick = useCallback(
    (obj: { id: string }) => (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest("button")) return;
      setSelectedObjectIds([obj.id]);
      onClose();
    },
    [setSelectedObjectIds, onClose]
  );

  const handleCableRowDoubleClick = useCallback(
    (cableId: string) => (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest("button")) return;
      setSelectedCableId(cableId);
      onClose();
    },
    [setSelectedCableId, onClose]
  );

  const cableLengthsMm = useMemo(
    () => cables.map((c) => cableLengthMm(c.segments)),
    [cables]
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

  const handleExportCsv = useCallback(() => {
    const csv = buildComponentListCsv(objects, cables);
    const filename = `pedalboard-components-${new Date().toISOString().slice(0, 10)}.csv`;
    downloadCsv(csv, filename);
  }, [objects, cables]);

  const removeCable = useCallback(
    (id: string) => {
      setCables((prev) => prev.filter((c) => c.id !== id));
    },
    [setCables]
  );

  if (!open) return null;

  const modal = (
    <div
      className="component-list-modal-backdrop modal-overlay"
      aria-hidden
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="component-list-modal modal-content"
        role="dialog"
        aria-modal="true"
        aria-label="Component list"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="component-list-modal-header modal-header">
          <h2 className="component-list-modal-title modal-title">Component list</h2>
          <div className="component-list-modal-header-actions">
            <button
              type="button"
              className="component-list-modal-export-btn"
              onClick={handleExportCsv}
              aria-label="Export to CSV"
              title="Export components and cables to CSV"
            >
              <FontAwesomeIcon icon={faFileCsv} className="component-list-modal-export-btn-icon" />
              Export to CSV
            </button>
            <button type="button" className="component-list-modal-close modal-close modal-close--compact" onClick={onClose} aria-label="Close">
              ×
            </button>
          </div>
        </header>
        <div className="component-list-modal-body modal-body">
          {objects.length === 0 ? (
            <p className="component-list-modal-empty">No components on the canvas.</p>
          ) : (
            <table className="component-list-table">
              <thead>
                <tr>
                  <th className="component-list-thumbnail-col" aria-label="Thumbnail" />
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
                    <tr
                      key={obj.id}
                      onDoubleClick={handleComponentRowDoubleClick(obj)}
                      className="component-list-row-clickable"
                    >
                      <td className="component-list-thumbnail-cell">
                        <ComponentThumbnail obj={obj} />
                      </td>
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
              <p className="connectors-empty">No cables. Use Add cable to draw cables on the canvas.</p>
            ) : (
              <table className="connectors-table cables-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Color</th>
                    <th>Connector A</th>
                    <th>Connector B</th>
                    <th>Length</th>
                    <th aria-label="Actions" />
                  </tr>
                </thead>
                <tbody>
                  {cables.map((cable, index) => (
                    <tr
                      key={cable.id}
                      onDoubleClick={handleCableRowDoubleClick(cable.id)}
                      className="component-list-row-clickable"
                    >
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
                          <ConnectorIcon
                            kind={cable.connectorA}
                            title={cable.connectorA}
                            className="connector-icon"
                            width={24}
                            height={24}
                            fallbackLabel={cable.connectorA}
                          />
                          {cable.connectorAName ? (
                            <span className="connector-name" title={cable.connectorAName}>
                              {cable.connectorAName}
                            </span>
                          ) : null}
                        </span>
                      </td>
                      <td className="connectors-icons-cell">
                        <span className="connectors-icons connectors-icons-with-name">
                          <ConnectorIcon
                            kind={cable.connectorB}
                            title={cable.connectorB}
                            className="connector-icon"
                            width={24}
                            height={24}
                            fallbackLabel={cable.connectorB}
                          />
                          {cable.connectorBName ? (
                            <span className="connector-name" title={cable.connectorBName}>
                              {cable.connectorBName}
                            </span>
                          ) : null}
                        </span>
                      </td>
                      <td>{formatLengthCm(cableLengthsMm[index])}</td>
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

