import type { DeviceTemplate } from "../devices";
import { createBrandHelpers } from "../deviceHelpers";

const { pedal } = createBrandHelpers("tc-electronic", "TC Electronic");

export const TC_ELECTRONIC_DEVICE_TEMPLATES: DeviceTemplate[] = [
  pedal("Compact Pedal", [74, 122, 50], null),
  pedal("Flashback X4", [235, 145, 57], null),
  pedal("Mini Pedal", [48, 93, 50], null),
];
