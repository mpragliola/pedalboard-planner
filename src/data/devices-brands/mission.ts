import type { DeviceTemplate } from "../devices";
import { createBrandHelpers } from "../deviceHelpers";

const { expression, img } = createBrandHelpers("mission", "Mission Engineering");

export const MISSION_DEVICE_TEMPLATES: DeviceTemplate[] = [
  expression("SP-1 Expression Pedal", [99, 251, 76], img("mission--sp1-nd-gy.png")),
];
