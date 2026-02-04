import type { DeviceTemplate } from "../devices";
import { createBrandHelpers } from "../deviceHelpers";

const { expression, img } = createBrandHelpers("amt", "AMT");

export const AMT_DEVICE_TEMPLATES: DeviceTemplate[] = [
  expression("EX-50 Expression Pedal", [62, 110, 58], img("amt-ex-50.png")),
];
