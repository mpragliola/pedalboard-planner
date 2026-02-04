import type { DeviceTemplate } from "../devices";
import { createBrandHelpers } from "../deviceHelpers";

const { wireless, img } = createBrandHelpers("sennheiser", "Sennheiser");

export const SENNHEISER_DEVICE_TEMPLATES: DeviceTemplate[] = [
  wireless("XSW D", [100, 60, 30], img("sennheiser-xsw-d-wiereless.png"), "Sennheiser XSW D Wireless"),
];
