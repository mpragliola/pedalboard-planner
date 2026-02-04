import type { DeviceTemplate } from "../devices";
import { createBrandHelpers } from "../deviceHelpers";

const { pedal, img } = createBrandHelpers("ibanez", "Ibanez");

export const IBANEZ_DEVICE_TEMPLATES: DeviceTemplate[] = [
  pedal("TS808", [70, 125, 52], img("ts808.png"), "TS808"),
  pedal("Tube Screamer", [70, 124, 53], img("ts808.png")),
];
