import type { DeviceTemplate } from "../devices";
import { createBrandHelpers } from "../deviceHelpers";

const { pedal, power, img } = createBrandHelpers("ehx", "Electro-Harmonix");

export const EHX_DEVICE_TEMPLATES: DeviceTemplate[] = [
  pedal("Nano Pedal", [70, 114, 54], null),
  pedal("XO Pedal", [91, 118, 57], null),
  power("44 Magnum", [70, 114, 53], img("ehx-magnum-44.png")),
  pedal("Pico Pedal", [50, 90, 50], null),
  pedal("Memory Man Deluxe", [146, 121, 64], null),
];
