import type { DeviceTemplate } from "../devices";
import { createBrandHelpers } from "../deviceHelpers";

const { pedal, img } = createBrandHelpers("sonicake", "Sonicake");

export const SONICAKE_DEVICE_TEMPLATES: DeviceTemplate[] = [
  pedal("Pocket Master", [103, 85, 28], img("sonicake-pocket-master.png")),
];
