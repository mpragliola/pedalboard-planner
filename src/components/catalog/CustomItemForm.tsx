import { useState } from "react";

interface CustomItemFormProps {
  idPrefix: string;
  itemType: "board" | "device";
  unitLabel: string;
  unit: "mm" | "in";
  defaultWidth: number;
  defaultDepth: number;
  onCreate: (params: { widthMm: number; depthMm: number; color: string; name: string }) => void;
}

export function CustomItemForm({
  idPrefix,
  itemType,
  unitLabel,
  unit,
  defaultWidth,
  defaultDepth,
  onCreate,
}: CustomItemFormProps) {
  const [form, setForm] = useState({
    widthMm: defaultWidth,
    depthMm: defaultDepth,
    color: "#484852",
    name: "",
  });

  const formatValue = (mm: number) => (unit === "in" ? (mm / 25.4).toFixed(2) : String(mm));
  const parseValue = (v: string) => (unit === "in" ? Math.round(parseFloat(v || "0") * 25.4) : parseInt(v || "0", 10));

  const handleDimensionChange = (field: "widthMm" | "depthMm") => (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = parseValue(e.target.value);
    if (!Number.isNaN(num)) setForm((f) => ({ ...f, [field]: Math.max(1, num) }));
  };

  const placeholder = `Custom ${itemType}`;

  return (
    <div className="collapsible-inner">
      <div className="custom-form-row">
        <label htmlFor={`${idPrefix}-width`} className="dropdown-label">
          Width ({unitLabel})
        </label>
        <input
          id={`${idPrefix}-width`}
          type="number"
          min={1}
          max={2000}
          className="custom-input"
          value={formatValue(form.widthMm)}
          onChange={handleDimensionChange("widthMm")}
        />
      </div>
      <div className="custom-form-row">
        <label htmlFor={`${idPrefix}-depth`} className="dropdown-label">
          Depth ({unitLabel})
        </label>
        <input
          id={`${idPrefix}-depth`}
          type="number"
          min={1}
          max={2000}
          className="custom-input"
          value={formatValue(form.depthMm)}
          onChange={handleDimensionChange("depthMm")}
        />
      </div>
      <div className="custom-form-row">
        <label htmlFor={`${idPrefix}-color`} className="dropdown-label">
          Color
        </label>
        <input
          id={`${idPrefix}-color`}
          type="color"
          className="custom-color-input"
          value={form.color}
          onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
        />
      </div>
      <div className="custom-form-row">
        <label htmlFor={`${idPrefix}-name`} className="dropdown-label">
          Name
        </label>
        <input
          id={`${idPrefix}-name`}
          type="text"
          className="custom-input"
          placeholder={placeholder}
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />
      </div>
      <button type="button" className="custom-create-btn" onClick={() => onCreate(form)}>
        Create
      </button>
    </div>
  );
}
