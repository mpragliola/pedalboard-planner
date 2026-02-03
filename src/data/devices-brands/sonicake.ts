import type { DeviceTemplate } from "../devices";
import { deviceId } from "../../lib/slug";

export const SONICAKE_DEVICE_TEMPLATES: DeviceTemplate[] = [
  {
    id: deviceId("sonicake", "Pocket Master"),
    type: "pedal",
    brand: "Sonicake",
    model: "Pocket Master",
    name: "Sonicake Pocket Master",
    wdh: [73, 129, 59],
    image: "sonicake/sonicake-pocket-master.png",
  },
];
