import type { DeviceTemplate } from "../devices";
import { createBrandHelpers } from "../deviceHelpers";
import { Wdh } from "../../wdh";

const { pedal, multifx, img } = createBrandHelpers("digitech", "DigiTech");

// DigiTech Pedal Dimensions (Width × Depth × Height in mm)

// Whammy Series
const WDH_WHAMMY_DT: Wdh = [165, 197, 64];
const WDH_WHAMMY_RICOCHET: Wdh = [73, 120, 44];

// Pitch Shifters
const WDH_THE_DROP: Wdh = [73, 120, 44];
const WDH_THE_WEAPON: Wdh = [79, 125, 54];

// RP Series
const WDH_RP55: Wdh = [127, 164, 54];
const WDH_RP100: Wdh = [127, 152, 54]; // Estimated - exact specs not found
const WDH_RP150: Wdh = [222, 270, 67];
const WDH_RP255: Wdh = [222, 368, 64];
const WDH_RP350: Wdh = [152.4, 127, 53.9];
const WDH_RP355: Wdh = [222, 445, 64];
const WDH_RP360_XP: Wdh = [216, 292, 51];
const WDH_RP1000: Wdh = [495, 273, 95];

export const DIGITECH_DEVICE_TEMPLATES: DeviceTemplate[] = [
  pedal("Whammy DT", WDH_WHAMMY_DT, img("digitech-whammy.png")),
  pedal("Whammy Ricochet", WDH_WHAMMY_RICOCHET, img("digitech-whammy-ricochet.png")),
  pedal("The Drop", WDH_THE_DROP, img("digitech-the-drop-pitch-shifter.png")),
  pedal("The Weapon", WDH_THE_WEAPON, img("digitech-the-weapon.png")),
  multifx("RP55", WDH_RP55, img("digitech-rp55.png")),
  multifx("RP100", WDH_RP100, img("digitech-rp100.png")),
  multifx("RP150", WDH_RP150, img("digitech-rp150.png")),
  multifx("RP255", WDH_RP255, img("digitech-rp255.png")),
  multifx("RP350", WDH_RP350, null),
  multifx("RP355", WDH_RP355, img("digitech-rp355.png")),
  multifx("RP360 XP", WDH_RP360_XP, img("digitech-rp360-xp.png")),
  multifx("RP1000", WDH_RP1000, img("digitech-rp1000.png")),
];
