import type { DeviceTemplate } from "../devices";
import { createBrandHelpers } from "../deviceHelpers";

const { power } = createBrandHelpers("truetone", "Truetone");

export const TRUETONE_DEVICE_TEMPLATES: DeviceTemplate[] = [
  power("1 SPOT Pro CS12", [206, 86, 50], null, "Truetone 1 SPOT Pro CS12 Power Supply"),
];
