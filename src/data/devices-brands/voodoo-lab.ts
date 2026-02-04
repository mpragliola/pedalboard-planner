import type { DeviceTemplate } from "../devices";
import { createBrandHelpers } from "../deviceHelpers";

const { power } = createBrandHelpers("voodoo-lab", "Voodoo Lab");

export const VOODOO_LAB_DEVICE_TEMPLATES: DeviceTemplate[] = [
  power("Pedal Power 2 Plus", [152, 86, 45], null),
  power("Pedal Power Iso 5", [110, 80, 35], null),
];
