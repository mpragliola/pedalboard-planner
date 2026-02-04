import type { DeviceTemplate } from "../devices";
import { deviceTemplate } from "../deviceHelpers";

export const DONNER_DEVICE_TEMPLATES: DeviceTemplate[] = [
  deviceTemplate("donner", "Donner", { type: "multifx", model: "Arena 2000", wdh: [330, 190, 60], image: null }),
];
