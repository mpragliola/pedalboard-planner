import type { DeviceTemplate } from "../devices";
import { createBrandHelpers } from "../deviceHelpers";

const { multifx, img } = createBrandHelpers("headrush", "Headrush");

export const HEADRUSH_DEVICE_TEMPLATES: DeviceTemplate[] = [
  multifx("Pedalboard", [667, 356, 87], img("headrush-pedalboard.png")),
  multifx("Gigboard", [457, 318, 76], null),
  multifx("MX5", [295, 150, 65], null),
];
