import type { DeviceTemplate } from "../devices";
import { deviceId } from "../../lib/slug";

const WDH_MOOER_GE100: [number, number, number] = [310, 165, 45];
const WDH_MOOER_GE150_PLUS_LI: [number, number, number] = [320, 170, 46];
const WDH_MOOER_GE200: [number, number, number] = [297, 174, 45.5];
const WDH_MOOER_GE200_PLUS: [number, number, number] = [297, 174, 45.5];
const WDH_MOOER_GE250: [number, number, number] = [324, 170, 60];
const WDH_MOOER_GE1000: [number, number, number] = [337, 170, 53];
const WDH_MOOER_EXPLINE: [number, number, number] = [55, 128, 58];
const WDH_OCEAN_MACHINE_II: [number, number, number] = [215, 110, 45];
const WDH_MACRO_POWER_S8: [number, number, number] = [165, 83, 52];
const WDH_MVP: [number, number, number] = [86.6, 125, 60];
const WDH_X2_V2: [number, number, number] = [75, 115, 60];
const WDH_MICRO_MINI: [number, number, number] = [93.5, 42, 52];

const mooerDevices: Omit<DeviceTemplate, "id" | "name" | "brand">[] = [
  { type: "power unit", model: "Macro Power S8", wdh: WDH_MACRO_POWER_S8, image: null },
  { type: "multifx", model: "GE100", wdh: WDH_MOOER_GE100, image: "ge-100.png" },
  { type: "multifx", model: "GE150 Plus Li", wdh: WDH_MOOER_GE150_PLUS_LI, image: "ge150plusli.png" },
  { type: "multifx", model: "GE200", wdh: WDH_MOOER_GE200, image: null },
  { type: "multifx", model: "GE200 Plus", wdh: WDH_MOOER_GE200_PLUS, image: "ge200plus.png" },
  { type: "multifx", model: "GE250", wdh: WDH_MOOER_GE250, image: "ge-250.png" },
  { type: "multifx", model: "GE1000", wdh: WDH_MOOER_GE1000, image: "ge1000.png" },
  { type: "pedal", model: "Expline", wdh: WDH_MOOER_EXPLINE, image: "mooer-expline.png" },
  { type: "pedal", model: "GL100", wdh: WDH_MICRO_MINI, image: "gl100.png" },
  { type: "pedal", model: "GL200", wdh: WDH_MICRO_MINI, image: "gl200.png" },
  { type: "pedal", model: "Mini Pedal", wdh: WDH_MICRO_MINI, image: null },
  { type: "pedal", model: "Micro Pedal", wdh: WDH_MICRO_MINI, image: null },
  { type: "pedal", model: "Harmony V2", wdh: WDH_X2_V2, image: "harmony-v2.png" },
  { type: "pedal", model: "Tender Octaver X2", wdh: WDH_X2_V2, image: "tender-octaver-x2.png" },
  { type: "pedal", model: "MVP1 Autuner", wdh: WDH_MVP, image: "mvp1-autuner.png" },
  { type: "pedal", model: "MVP2 Harmonier", wdh: WDH_MVP, image: "mvp2-harmonier.png" },
  { type: "pedal", model: "MVP3 Loopation", wdh: WDH_MVP, image: "mvp3-loopation.png" },
  { type: "pedal", model: "Ocean Machine II", wdh: WDH_OCEAN_MACHINE_II, image: "ocean-machine-ii.png" },
];

export const MOOER_DEVICE_TEMPLATES: DeviceTemplate[] = mooerDevices.map((d) => ({
  ...d,
  name: `Mooer ${d.model}`,
  id: deviceId("mooer", d.model),
  brand: "Mooer",
  image: d.image ? "mooer/" + d.image : null,
}));
