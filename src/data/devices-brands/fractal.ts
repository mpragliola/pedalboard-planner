import type { DeviceTemplate } from "../devices";
import { createBrandHelpers } from "../deviceHelpers";

const { multifx, img } = createBrandHelpers("fractal", "Fractal Audio");

export const FRACTAL_DEVICE_TEMPLATES: DeviceTemplate[] = [
  multifx("Axe-Fx III", [483, 279, 89], null),
  multifx("FM3", [297, 229, 89], img("fractal-fm3.png")),
  multifx("FM9", [394, 279, 89], img("fractal-fm9.png")),
];
