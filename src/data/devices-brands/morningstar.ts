import type { DeviceTemplate } from "../devices";
import { deviceId } from "../../lib/slug";

// MIDI controllers — approximate dimensions [width, depth, height] mm
const WDH_MC4: [number, number, number] = [120, 80, 40];
const WDH_MC6: [number, number, number] = [180, 95, 45];
const WDH_MC8: [number, number, number] = [240, 95, 45];

const morningstarDevices: Omit<DeviceTemplate, "id" | "name" | "brand">[] = [
  { type: "controller", model: "MC4 Pro", wdh: WDH_MC4, image: "morningstar-mc4-pro.png" },
  { type: "controller", model: "MC6", wdh: WDH_MC6, image: "morningstar-mc6.png" },
  { type: "controller", model: "MC6 MkII", wdh: WDH_MC6, image: "morningstar-mc6-mkii.png" },
  { type: "controller", model: "MC8", wdh: WDH_MC8, image: "morninstar-mc8.png" },
];

export const MORNINGSTAR_DEVICE_TEMPLATES: DeviceTemplate[] = morningstarDevices.map((d) => ({
  ...d,
  name: `Morningstar ${d.model}`,
  id: deviceId("morningstar", d.model),
  brand: "Morningstar",
  image: d.image ? "morningstar/" + d.image : null,
}));
