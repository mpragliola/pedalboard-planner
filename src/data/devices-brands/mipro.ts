import type { DeviceTemplate } from "../devices";
import { createBrandHelpers } from "../deviceHelpers";

const { wireless, img } = createBrandHelpers("mipro", "Mipro");

export const MIPRO_DEVICE_TEMPLATES: DeviceTemplate[] = [
  wireless("ACT-5800 MR-58 Wireless", [120, 80, 40], img("mipro-act-5800-mr-58-wireless.png")),
];
