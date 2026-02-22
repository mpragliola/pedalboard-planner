import type { ConnectorKind } from "../../../types";
import {
  CABLE_CONNECTOR_TEMPLATES,
  CABLE_TERMINAL_END_COLOR,
  CABLE_TERMINAL_START_COLOR,
} from "../../../constants/cables";
import { CableEndpointField } from "./CableEndpointField";

interface CableEndpointsSectionProps {
  selectedTemplateName: string;
  onTemplateChange: (templateName: string) => void;
  onSwapConnectors: () => void;
  connectorA: ConnectorKind;
  onConnectorAChange: (nextConnector: ConnectorKind) => void;
  connectorAName: string;
  onConnectorANameChange: (nextName: string) => void;
  connectorB: ConnectorKind;
  onConnectorBChange: (nextConnector: ConnectorKind) => void;
  connectorBName: string;
  onConnectorBNameChange: (nextName: string) => void;
}

/** Full endpoint section (template selector, swap action, and A/B endpoint inputs). */
export function CableEndpointsSection({
  selectedTemplateName,
  onTemplateChange,
  onSwapConnectors,
  connectorA,
  onConnectorAChange,
  connectorAName,
  onConnectorANameChange,
  connectorB,
  onConnectorBChange,
  connectorBName,
  onConnectorBNameChange,
}: CableEndpointsSectionProps) {
  return (
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
            onChange={(e) => onTemplateChange(e.target.value)}
            aria-label="Connector template"
          >
            <option value="" aria-label="No template">
              {" "}
            </option>
            {CABLE_CONNECTOR_TEMPLATES.map((template) => (
              <option key={template.name} value={template.name}>
                {template.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="add-cable-swap-btn"
            onClick={onSwapConnectors}
            title="Swap connector A and B"
            aria-label="Swap connector A and B"
          >
            Swap A/B
          </button>
        </div>
      </div>

      <div className="add-cable-endpoints-grid">
        <CableEndpointField
          terminal="A"
          badgeClassName="add-cable-endpoint-badge-a"
          badgeBackgroundColor={CABLE_TERMINAL_START_COLOR}
          badgeTextColor="#1a4d1a"
          connectorId="add-cable-connector-a"
          connectorValue={connectorA}
          onConnectorChange={onConnectorAChange}
          connectorNameId="add-cable-connector-a-name"
          connectorName={connectorAName}
          onConnectorNameChange={onConnectorANameChange}
        />
        <CableEndpointField
          terminal="B"
          badgeClassName="add-cable-endpoint-badge-b"
          badgeBackgroundColor={CABLE_TERMINAL_END_COLOR}
          badgeTextColor="#b35c00"
          connectorId="add-cable-connector-b"
          connectorValue={connectorB}
          onConnectorChange={onConnectorBChange}
          connectorNameId="add-cable-connector-b-name"
          connectorName={connectorBName}
          onConnectorNameChange={onConnectorBNameChange}
        />
      </div>
    </div>
  );
}
