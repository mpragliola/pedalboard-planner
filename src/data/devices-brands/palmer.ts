import type { DeviceTemplate } from "../devices";
import { createBrandHelpers } from "../deviceHelpers";

const { power } = createBrandHelpers("palmer", "Palmer");

export const PALMER_DEVICE_TEMPLATES: DeviceTemplate[] = [
  power("PWT 06 IEC", [130, 90, 40], null),
  power(
    "PWT 04 / Universal Pedalboard Power Supply",
    [100, 70, 35],
    null,
    "Palmer PWT 04 Universal Pedalboard Power Supply"
  ),
];
