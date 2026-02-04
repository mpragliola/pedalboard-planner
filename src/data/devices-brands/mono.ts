import type { DeviceTemplate } from "../devices";
import { createBrandHelpers } from "../deviceHelpers";

const { power } = createBrandHelpers("mono", "Mono");

export const MONO_DEVICE_TEMPLATES: DeviceTemplate[] = [
  power("Power Supply Medium", [100, 80, 30], null),
];
