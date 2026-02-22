import {
  CABLE_COLORS,
  CABLE_CONNECTOR_TEMPLATES,
  CABLE_COLOR_OPTIONS,
} from "../../../constants/cables";
import type { Cable, ConnectorKind } from "../../../types";

/**
 * Draft object used by AddCableModal to keep all form fields synchronized.
 * A single draft object avoids multi-state initialization races.
 */
export interface CableFormDraft {
  color: string;
  connectorA: ConnectorKind;
  connectorB: ConnectorKind;
  selectedTemplateName: string;
  connectorAName: string;
  connectorBName: string;
}

const DEFAULT_COLOR = CABLE_COLORS[0].hex;
const DEFAULT_CONNECTOR: ConnectorKind = "mono jack (TS)";

/** Stable id generator used for newly created cables. */
export function nextCableId(): string {
  return `cable-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Resolves template name from explicit connector pair; empty when no template matches. */
export function findTemplateName(connectorA: ConnectorKind, connectorB: ConnectorKind): string {
  return (
    CABLE_CONNECTOR_TEMPLATES.find(
      (template) => connectorA === template.connectorA && connectorB === template.connectorB
    )?.name ?? ""
  );
}

/** Creates full form draft for either edit-mode (initial cable) or create-mode defaults. */
export function createInitialCableFormDraft(initialCable?: Cable | null): CableFormDraft {
  if (initialCable) {
    return {
      color: CABLE_COLOR_OPTIONS.includes(initialCable.color) ? initialCable.color : CABLE_COLOR_OPTIONS[0],
      connectorA: initialCable.connectorA,
      connectorB: initialCable.connectorB,
      selectedTemplateName: findTemplateName(initialCable.connectorA, initialCable.connectorB),
      connectorAName: initialCable.connectorAName ?? "",
      connectorBName: initialCable.connectorBName ?? "",
    };
  }

  return {
    color: DEFAULT_COLOR,
    connectorA: DEFAULT_CONNECTOR,
    connectorB: DEFAULT_CONNECTOR,
    selectedTemplateName: "",
    connectorAName: "",
    connectorBName: "",
  };
}
