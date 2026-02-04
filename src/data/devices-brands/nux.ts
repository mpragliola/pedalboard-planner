import type { DeviceTemplate } from "../devices";
import { createBrandHelpers } from "../deviceHelpers";

const { multifx, wireless, img } = createBrandHelpers("nux", "NUX");

export const NUX_DEVICE_TEMPLATES: DeviceTemplate[] = [
  multifx("MG-30", [315, 187, 58], null),
  multifx("MG-400", [290, 220, 60], img("nux-mg400.png")),
  wireless("B-8 Wireless", [73, 129, 59], img("nux-b8-wireless.png")),
];
