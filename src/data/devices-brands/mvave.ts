import type { DeviceTemplate } from "../devices";
import { deviceId } from "../../lib/slug";

// Compact pedal size [width, depth, height] mm
const WDH_COMPACT: [number, number, number] = [73, 129, 59];

const mvaveDevices: Omit<DeviceTemplate, "id" | "name" | "brand">[] = [
  { type: "pedal", model: "Blackbox", wdh: WDH_COMPACT, image: "mvave-blackbox.png" },
  { type: "pedal", model: "Chocolate", wdh: WDH_COMPACT, image: "mvave-chocolate.png" },
  { type: "pedal", model: "Chocolate Plus", wdh: WDH_COMPACT, image: "mvave-chocolate-plus.png" },
  { type: "pedal", model: "Cucave Acoustic", wdh: WDH_COMPACT, image: "mvave-cucave-acoustic.png" },
  { type: "pedal", model: "Cuvave", wdh: WDH_COMPACT, image: "mvave-cuvave.png" },
  { type: "pedal", model: "GTank", wdh: WDH_COMPACT, image: "mvave-gtank.png" },
];

export const MVAVE_DEVICE_TEMPLATES: DeviceTemplate[] = mvaveDevices.map((d) => ({
  ...d,
  name: `Mvave ${d.model}`,
  id: deviceId("mvave", d.model),
  brand: "Mvave",
  image: d.image ? "mvave/" + d.image : null,
}));
