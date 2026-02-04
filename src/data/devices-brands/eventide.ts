import type { DeviceTemplate } from "../devices";
import { deviceTemplate, deviceImage } from "../deviceHelpers";

const WDH_H9: [number, number, number] = [170, 136, 68];
const WDH_PEDAL: [number, number, number] = [102, 108, 43];
const WDH_FACTOR: [number, number, number] = [190, 122, 54];
const WDH_H9_MAX: [number, number, number] = [118, 133, 50];

const eventideRows: { model: string; wdh: [number, number, number]; image: string }[] = [
  { model: "H9 / H90", wdh: WDH_H9, image: "h90-harmonizer.png" },
  { model: "H9 Max", wdh: WDH_H9_MAX, image: "h9-MAX-harmonizer.png" },
  { model: "Micropitch", wdh: WDH_PEDAL, image: "eventide-micropitch.png" },
  { model: "UltraTap", wdh: WDH_PEDAL, image: "eventide-ultratap.png" },
  { model: "TriceraChorus", wdh: WDH_PEDAL, image: "eventide-tricerachorus.png" },
  { model: "Riptide", wdh: WDH_PEDAL, image: "eventide-riptide.png" },
  { model: "Knife Drop", wdh: WDH_PEDAL, image: "eventide-knifedrop.png" },
  { model: "Mixing Link", wdh: WDH_PEDAL, image: "eventide-mixiniglink.png" },
  { model: "Rose", wdh: WDH_PEDAL, image: "eventide.rose.png" },
  { model: "Blackhole", wdh: WDH_PEDAL, image: "eventide-blackhole.png" },
  { model: "Space", wdh: WDH_FACTOR, image: "eventide-space.png" },
  { model: "TimeFactor", wdh: WDH_FACTOR, image: "eventide-timefactor.png" },
  { model: "ModFactor", wdh: WDH_FACTOR, image: "eventide-modfactor.png" },
  { model: "PitchFactor", wdh: WDH_FACTOR, image: "eventide-pitchfactor harmonizer.png" },
];

export const EVENTIDE_DEVICE_TEMPLATES: DeviceTemplate[] = eventideRows.map((d) =>
  deviceTemplate("eventide", "Eventide", {
    type: "pedal",
    model: d.model,
    wdh: d.wdh,
    image: deviceImage("eventide", d.image),
  })
);
