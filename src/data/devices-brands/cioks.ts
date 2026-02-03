import type { DeviceTemplate } from "../devices";
import { deviceId } from "../../lib/slug";

const cioksDevices: Omit<DeviceTemplate, "type" | "brand" | "id" | "name">[] = [
  { model: "DC7", wdh: [160, 88, 25.4], image: "cioks-dc7.png" },
  { model: "DC10", wdh: [158, 98, 35], image: "cioks-dc10.png" },
  { model: "4", wdh: [74, 88, 25.4], image: "cioks-4.png" },
  { model: "8", wdh: [120, 88, 25.4], image: "cioks-8.png" },
  { model: "Sol", wdh: [130, 88, 25.4], image: "cioks-sol.png" },
  { model: "AC10", wdh: [158, 98, 35], image: "cioks-ac10.png" },
  { model: "Ciokolate", wdh: [292, 98, 35], image: "cioks-ciokolate.png" },
  { model: "Crux", wdh: [40, 88, 25.4], image: "cioks-crux.png" },
];

export const CIOKS_DEVICE_TEMPLATES: DeviceTemplate[] = cioksDevices.map((d) => ({
  ...d,
  name: `Cioks ${d.model}`,
  id: deviceId("cioks", d.model),
  type: "power",
  brand: "Cioks",
  image: "cioks/" + d.image,
}));
