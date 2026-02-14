import type { Shape3D } from "../../shape3d";
import type { DeviceTemplate } from "../devices";
import { createBrandHelpers } from "../deviceHelpers";

const { multifx, img } = createBrandHelpers("headrush", "Headrush");

const WEDGE_FLOOR: Shape3D = { type: "wedge", ratio: 0.7 };

export const HEADRUSH_DEVICE_TEMPLATES: DeviceTemplate[] = [
  { ...multifx("Pedalboard", [667, 356, 87], img("headrush-pedalboard.png")), shape: WEDGE_FLOOR },
  { ...multifx("Gigboard", [457, 318, 76], null), shape: WEDGE_FLOOR },
  { ...multifx("MX5", [295, 150, 65], null), shape: WEDGE_FLOOR },
];
