import type { DeviceTemplate } from "../devices";
import { createBrandHelpers } from "../deviceHelpers";

const { wireless, img } = createBrandHelpers("shure", "Shure");

export const SHURE_DEVICE_TEMPLATES: DeviceTemplate[] = [
  wireless("GLXD6 Plus", [120, 80, 40], img("shure-gldx-6-plus.png")),
  wireless("GLXD16 Plus Z4", [120, 80, 40], img("shure-gldx16plus-z4.png")),
];
