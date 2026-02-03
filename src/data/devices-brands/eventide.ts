import type { DeviceTemplate } from "../devices";
import { deviceId } from "../../lib/slug";

const WDH_H9: [number, number, number] = [170, 136, 68];
const WDH_PEDAL: [number, number, number] = [102, 108, 43];
const WDH_FACTOR: [number, number, number] = [190, 122, 54];
const WDH_PEDAL_WIDE: [number, number, number] = [178, 71, 121];
const WDH_H9_MAX: [number, number, number] = [118, 133, 50];

const eventideDevices: Omit<DeviceTemplate, "type" | "brand" | "id" | "name">[] = [
  { model: "H9 / H90", wdh: WDH_H9, image: "h90-harmonizer.png" }, // verified
  { model: "H9 Max", wdh: WDH_H9_MAX, image: "h9-MAX-harmonizer.png" }, // verified
  { model: "Micropitch", wdh: WDH_PEDAL, image: "eventide-micropitch.png" }, // verified
  { model: "UltraTap", wdh: WDH_PEDAL, image: "eventide-ultratap.png" }, // verified
  { model: "TriceraChorus", wdh: WDH_PEDAL, image: "eventide-tricerachorus.png" }, // verified
  { model: "Riptide", wdh: WDH_PEDAL, image: "eventide-riptide.png" }, // verified
  { model: "Knife Drop", wdh: WDH_PEDAL, image: "eventide-knifedrop.png" }, // verified
  { model: "Mixing Link", wdh: WDH_PEDAL, image: "eventide-mixiniglink.png" }, // verified
  { model: "Rose", wdh: WDH_PEDAL, image: "eventide.rose.png" }, // verified
  { model: "Blackhole", wdh: WDH_PEDAL, image: "eventide-blackhole.png" }, // verified
  // Factor series
  { model: "Space", wdh: WDH_FACTOR, image: "eventide-space.png" }, // verified
  { model: "TimeFactor", wdh: WDH_FACTOR, image: "eventide-timefactor.png" }, // verified
  { model: "ModFactor", wdh: WDH_FACTOR, image: "eventide-modfactor.png" }, // verified
  { model: "PitchFactor", wdh: WDH_FACTOR, image: "eventide-pitchfactor harmonizer.png" }, // verified
];

export const EVENTIDE_DEVICE_TEMPLATES: DeviceTemplate[] = eventideDevices.map((d) => ({
  ...d,
  name: `Eventide ${d.model}`,
  id: deviceId("eventide", d.model),
  type: "pedal",
  brand: "Eventide",
  image: "eventide/" + d.image,
}));
