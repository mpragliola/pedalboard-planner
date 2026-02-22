import type { ConnectorKind } from "../../../types";
import { ConnectorPicker } from "./ConnectorPicker";
import { LabelCombo } from "./LabelCombo";

interface CableEndpointFieldProps {
  terminal: "A" | "B";
  badgeClassName: string;
  badgeBackgroundColor: string;
  badgeTextColor: string;
  connectorId: string;
  connectorValue: ConnectorKind;
  onConnectorChange: (nextConnector: ConnectorKind) => void;
  connectorNameId: string;
  connectorName: string;
  onConnectorNameChange: (nextName: string) => void;
}

/** One endpoint block (terminal badge + connector picker + optional label). */
export function CableEndpointField({
  terminal,
  badgeClassName,
  badgeBackgroundColor,
  badgeTextColor,
  connectorId,
  connectorValue,
  onConnectorChange,
  connectorNameId,
  connectorName,
  onConnectorNameChange,
}: CableEndpointFieldProps) {
  return (
    <div className="add-cable-endpoint">
      <div className="add-cable-endpoint-head-row">
        <span
          className={`add-cable-endpoint-badge ${badgeClassName}`}
          style={{ backgroundColor: badgeBackgroundColor, color: badgeTextColor }}
          aria-hidden
        >
          {terminal}
        </span>
        <ConnectorPicker id={connectorId} label="" value={connectorValue} onChange={onConnectorChange} />
      </div>
      <LabelCombo
        id={connectorNameId}
        value={connectorName}
        onChange={onConnectorNameChange}
        ariaLabel={`Connector ${terminal} label`}
      />
    </div>
  );
}
