import type { DeviceTemplate } from "../devices";
import { deviceId } from "../../lib/slug";

export const SHURE_DEVICE_TEMPLATES: DeviceTemplate[] = [
  {
    id: deviceId("shure", "GLXD6 Plus"),
    type: "wireless",
    brand: "Shure",
    model: "GLXD6 Plus",
    name: "Shure GLXD6 Plus",
    wdh: [120, 80, 40],
    image: "shure/shure-gldx-6-plus.png",
  },
  {
    id: deviceId("shure", "GLXD16 Plus Z4"),
    type: "wireless",
    brand: "Shure",
    model: "GLXD16 Plus Z4",
    name: "Shure GLXD16 Plus Z4",
    wdh: [120, 80, 40],
    image: "shure/shure-gldx16plus-z4.png",
  },
];
