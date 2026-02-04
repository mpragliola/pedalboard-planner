import type { DeviceTemplate } from "../devices";
import { createBrandHelpers } from "../deviceHelpers";

const { pedal, power } = createBrandHelpers("joyo", "Joyo");

export const JOYO_DEVICE_TEMPLATES: DeviceTemplate[] = [
  pedal("Ironman Mini", [50, 75, 45], null),
  pedal("Standard Pedal", [70, 120, 50], null),
  power("JP-05 Power Bank Supply 5", [150, 85, 40], null),
];
