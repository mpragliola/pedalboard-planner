import type { DeviceTemplate } from "../devices";
import { deviceId } from "../../lib/slug";

export const SONICAKE_DEVICE_TEMPLATES: DeviceTemplate[] = [
  {
    id: deviceId("sonicake", "Pocket Master"),
    type: "pedal",
    brand: "Sonicake",
    model: "Pocket Master",
    name: "Sonicake Pocket Master",
    wdh: [103, 85, 28],
    image: "sonicake/sonicake-pocket-master.png",
  },
];
