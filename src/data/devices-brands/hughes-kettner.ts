import type { DeviceTemplate } from "../devices";
import { deviceId } from "../../lib/slug";

const WDH_HK_COMPACT: [number, number, number] = [73, 129, 59];
const WDH_HK_AMP: [number, number, number] = [300, 200, 80];

const hughesKettnerDevices: Omit<DeviceTemplate, "id" | "name" | "brand">[] = [
  { type: "pedal", model: "Ampman Classic", wdh: WDH_HK_AMP, image: "hughes-and-kettner-ampman-classic.png" },
  { type: "pedal", model: "Ampman Modern", wdh: WDH_HK_AMP, image: "hughes-and-kettner-ampman-modern.png" },
  { type: "pedal", model: "Black Spirit 200", wdh: WDH_HK_AMP, image: "hughes-and-kettner-black-spirit-200.png" },
  { type: "controller", model: "FSM-432 MK IV", wdh: WDH_HK_COMPACT, image: "hughes-and-kettner-fsm-432-mk-iv.png" },
  { type: "multifx", model: "StompMan", wdh: [400, 250, 70], image: "hughesandketnerstompman.png" },
];

export const HUGHES_KETTNER_DEVICE_TEMPLATES: DeviceTemplate[] = hughesKettnerDevices.map((d) => ({
  ...d,
  name: `Hughes & Kettner ${d.model}`,
  id: deviceId("hughes-kettner", d.model),
  brand: "Hughes & Kettner",
  image: d.image ? "hughes-kettner/" + d.image : null,
}));
