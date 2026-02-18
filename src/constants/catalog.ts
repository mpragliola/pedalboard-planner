import type { DeviceType } from "../data/devices";

/** Global ordering used for device sorting/grouping in catalog UIs. */
export const DEVICE_TYPE_ORDER: DeviceType[] = [
  "pedal",
  "multifx",
  "expression",
  "volume",
  "power",
  "controller",
  "wireless",
  "loopswitcher",
];

/** UI labels for catalog-facing device type groups. */
export const DEVICE_TYPE_LABEL: Record<DeviceType, string> = {
  pedal: "Pedals",
  multifx: "Multifx",
  expression: "Expression pedal",
  volume: "Volume pedal",
  power: "Power units",
  controller: "Controllers",
  wireless: "Wireless systems",
  loopswitcher: "Loop switchers",
};
