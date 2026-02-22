import { CABLE_COLORS } from "../../../constants/cables";

interface CableColorSectionProps {
  selectedColor: string;
  onColorChange: (nextColor: string) => void;
}

/**
 * Color swatch row for cable color selection.
 * Stateless by design: parent owns draft and persistence rules.
 */
export function CableColorSection({ selectedColor, onColorChange }: CableColorSectionProps) {
  return (
    <div className="add-cable-row add-cable-color-row">
      <span className="add-cable-label">Color</span>
      <div className="add-cable-color-swatches" role="group" aria-label="Cable color">
        {CABLE_COLORS.map((cableColor) => {
          const isSelected = selectedColor === cableColor.hex;
          return (
            <button
              key={cableColor.hex}
              type="button"
              className={`add-cable-color-swatch-btn${isSelected ? " add-cable-color-swatch-btn-selected" : ""}`}
              style={{ backgroundColor: cableColor.hex }}
              onClick={() => onColorChange(cableColor.hex)}
              title={cableColor.label}
              aria-label={cableColor.label}
              aria-pressed={isSelected}
            />
          );
        })}
      </div>
    </div>
  );
}
