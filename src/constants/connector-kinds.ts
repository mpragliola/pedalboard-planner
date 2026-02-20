import type { ConnectorKind } from "../types";

export type { ConnectorKind } from "../types";

/** Predefined connector name options (endpoint labels: Input, Output, etc.). */
export const CONNECTOR_NAME_OPTIONS: string[] = [
  "Input",
  "In L",
  "In R",
  "MIDI In",
  "MIDI Out",
  "MIDI Thru",
  "MIDI Out/thru",
  "Exp In",
  "Output",
  "Out L",
  "Out R",
  "Send",
  "Send 1",
  "Send 2",
  "Return",
  "Return 1",
  "Return 2",
];

/** Physical connector kind options. */
export const CONNECTOR_KIND_OPTIONS: { value: ConnectorKind; label: string }[] = [
  { value: "mono jack (TS)", label: "Mono jack (TS)" },
  { value: "mono jack (TS mini)", label: "Mono jack (TS mini)" },
  { value: "stereo jack (TRS)", label: "Stereo jack (TRS)" },
  { value: "stereo jack (TRS mini)", label: "Stereo jack (TRS mini)" },
  { value: "MIDI (DIN)", label: "MIDI (DIN)" },
  { value: "MIDI (DIN female)", label: "MIDI (DIN female)" },
  { value: "MIDI (TRS)", label: "MIDI (TRS)" },
  { value: "two mono jacks (TSx2)", label: "Two mono jacks (TSx2)" },
  { value: "XLR male", label: "XLR male" },
  { value: "XLR female", label: "XLR female" },
  { value: "Ethernet", label: "Ethernet" },
];
