import type { DeviceTemplate } from "../devices";
import { deviceTemplate, deviceImage } from "../deviceHelpers";

const WDH_HK_COMPACT: [number, number, number] = [73, 129, 59];
const WDH_HK_AMP: [number, number, number] = [300, 200, 80];

type HughesKettnerRow = {
  type: "pedal" | "controller" | "multifx";
  model: string;
  wdh: [number, number, number];
  image: string;
};
const hughesKettnerRows: HughesKettnerRow[] = [
  { type: "pedal", model: "Ampman Classic", wdh: WDH_HK_AMP, image: "hughes-and-kettner-ampman-classic.png" },
  { type: "pedal", model: "Ampman Modern", wdh: WDH_HK_AMP, image: "hughes-and-kettner-ampman-modern.png" },
  { type: "pedal", model: "Black Spirit 200", wdh: WDH_HK_AMP, image: "hughes-and-kettner-black-spirit-200.png" },
  { type: "controller", model: "FSM-432 MK IV", wdh: WDH_HK_COMPACT, image: "hughes-and-kettner-fsm-432-mk-iv.png" },
  { type: "multifx", model: "StompMan", wdh: [400, 250, 70], image: "hughesandketnerstompman.png" },
];

export const HUGHES_KETTNER_DEVICE_TEMPLATES: DeviceTemplate[] = hughesKettnerRows.map((d) =>
  deviceTemplate("hughes-kettner", "Hughes & Kettner", {
    type: d.type,
    model: d.model,
    wdh: d.wdh,
    image: deviceImage("hughes-kettner", d.image),
  })
);
