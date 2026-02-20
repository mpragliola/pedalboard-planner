import { BASE_URL } from "./runtime";
import type { ConnectorKind } from "./connector-kinds";

/** Connector kind to SVG image path. */
export const CONNECTOR_ICON_MAP: Record<ConnectorKind, string> = {
  "mono jack (TS)": `${BASE_URL}images/connectors/ts.svg`,
  "mono jack (TS mini)": `${BASE_URL}images/connectors/ts-mini.svg`,
  "stereo jack (TRS)": `${BASE_URL}images/connectors/trs.svg`,
  "stereo jack (TRS mini)": `${BASE_URL}images/connectors/trs-mini.svg`,
  "MIDI (DIN)": `${BASE_URL}images/connectors/MIDI-male.svg`,
  "MIDI (DIN female)": `${BASE_URL}images/connectors/MIDI-female.svg`,
  "MIDI (TRS)": `${BASE_URL}images/connectors/trs-mini.svg`,
  "two mono jacks (TSx2)": `${BASE_URL}images/connectors/2ts.svg`,
  "XLR male": `${BASE_URL}images/connectors/xlr_male.svg`,
  "XLR female": `${BASE_URL}images/connectors/xlr_female.svg`,
  Ethernet: `${BASE_URL}images/connectors/ethernet.svg`,
};
