import type { DeviceTemplate } from "../devices";
import { deviceId } from "../../lib/slug";

export const MIPRO_DEVICE_TEMPLATES: DeviceTemplate[] = [
  {
    id: deviceId("mipro", "ACT-5800 MR-58 Wireless"),
    type: "wireless",
    brand: "Mipro",
    model: "ACT-5800 MR-58 Wireless",
    name: "Mipro ACT-5800 MR-58 Wireless",
    wdh: [120, 80, 40],
    image: "mipro/mipro-act-5800-mr-58-wireless.png",
  },
];
