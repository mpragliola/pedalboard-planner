import type { DeviceTemplate } from "../devices";
import { createBrandHelpers } from "../deviceHelpers";

const { multifx, img } = createBrandHelpers("hotone", "Hotone");

export const HOTONE_DEVICE_TEMPLATES: DeviceTemplate[] = [
  multifx("Ampero", [320, 147, 46], img("hotone ampero.png")),
  multifx("Ampero One", [185, 145, 58], null),
  multifx("Ampero II Stomp", [185, 145, 68], null),
  multifx("Ampero II Stage", [320, 180, 60], img("ampero ii stage.png")),
  multifx("Ampero II", [185, 145, 68], img("hotone ampero ii.png")),
  multifx("Ampero Mini", [120, 90, 50], img("hotone ampero mini.png")),
];
