import type { DeviceTemplate } from "../devices";
import { createBrandHelpers } from "../deviceHelpers";
import { WDH_MXR_BASS } from "../../wdh";

const { pedal, img } = createBrandHelpers("evh", "EVH");

export const EVH_DEVICE_TEMPLATES: DeviceTemplate[] = [
  pedal("EVH 5150 Overdrive", WDH_MXR_BASS, img("EVHMHG.MAIN__65502.png")),
];
