import type { DeviceTemplate } from "../devices";
import { createBrandHelpers } from "../deviceHelpers";

const { pedal, img } = createBrandHelpers("morpheus", "Morpheus");

export const MORPHEUS_DEVICE_TEMPLATES: DeviceTemplate[] = [
  pedal("Drop Tune Pitch Shifter", [120, 95, 57], img("morpheus-droptune-pitch-shifter.png")),
];
