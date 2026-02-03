import type { DeviceTemplate } from "../devices";
import { deviceId } from "../../lib/slug";

export const SENNHEISER_DEVICE_TEMPLATES: DeviceTemplate[] = [
  {
    id: deviceId("sennheiser", "XSW D"),
    type: "wireless",
    brand: "Sennheiser",
    model: "XSW D",
    name: "Sennheiser XSW D Wireless",
    wdh: [100, 60, 30],
    image: "sennheiser/sennheiser-xsw-d-wiereless.png",
  },
];
