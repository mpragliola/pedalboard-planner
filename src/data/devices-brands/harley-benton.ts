import type { DeviceTemplate } from "../devices";
import { createBrandHelpers } from "../deviceHelpers";

const { power, multifx, wireless, img } = createBrandHelpers("harley-benton", "Harley Benton");

export const HARLEY_BENTON_DEVICE_TEMPLATES: DeviceTemplate[] = [
  power("PowerPlant ISO-5 Pro", [140, 90, 35], null),
  multifx("DNAfx GiT", [430, 250, 75], null),
  multifx("DNAfx GiT Pro", [560, 350, 90], null),
  wireless("Airborne Pro 5.8GHz Wireless", [73, 129, 59], img("harley-benton-airborne-pro-5.8ghz-wireless.png")),
];
