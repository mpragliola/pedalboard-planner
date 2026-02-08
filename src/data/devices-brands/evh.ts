import type { DeviceTemplate } from "../devices";
import { createBrandHelpers } from "../deviceHelpers";
import type { Wdh } from "../../wdh";

const { pedal, img } = createBrandHelpers("evh", "EVH");
/** MXR bass / double (e.g. Bass D.I.+, Dime Distortion). */
const WDH_MXR_BASS: Wdh = [124, 92, 55];

export const EVH_DEVICE_TEMPLATES: DeviceTemplate[] = [
  pedal("EVH 5150 Overdrive", WDH_MXR_BASS, img("EVHMHG.MAIN__65502.png")),
];
