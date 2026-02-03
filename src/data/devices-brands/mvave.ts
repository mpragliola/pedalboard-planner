import type { DeviceTemplate } from "../devices";
import { deviceId } from "../../lib/slug";
import { Wdh } from "../../wdh";

// Compact pedal size [width, depth, height] mm
const WDH_CUVAVE: Wdh = [162, 61, 23];
const WDH_CHOCOLATE: Wdh = [212, 36, 17];
const WDH_TANKG: Wdh = [230, 100, 35];
const WHD_BLACKBOX: Wdh = [110, 110, 35];

const mvaveDevices: Omit<DeviceTemplate, "id" | "name" | "brand">[] = [
  { type: "multifx", model: "Blackbox", wdh: WHD_BLACKBOX, image: "mvave-blackbox.png" },
  { type: "controller", model: "Chocolate", wdh: WDH_CHOCOLATE, image: "mvave-chocolate.png" },
  { type: "controller", model: "Chocolate Plus", wdh: WDH_CHOCOLATE, image: "mvave-chocolate-plus.png" },
  { type: "multifx", model: "Cuvave Acoustic", wdh: WDH_CUVAVE, image: "mvave-cucave-acoustic.png" },
  { type: "multifx", model: "Cuvave (Cube Baby)", wdh: WDH_CUVAVE, image: "mvave-cuvave.png" },
  { type: "multifx", model: "Tank G", wdh: WDH_TANKG, image: "mvave-gtank.png" },
];

export const MVAVE_DEVICE_TEMPLATES: DeviceTemplate[] = mvaveDevices.map((d) => ({
  ...d,
  name: `Mvave ${d.model}`,
  id: deviceId("mvave", d.model),
  brand: "Mvave",
  image: d.image ? "mvave/" + d.image : null,
}));
