import type { DeviceTemplate } from "../devices";
import { deviceId } from "../../lib/slug";

const cioksDevices: Omit<DeviceTemplate, "type" | "brand" | "id" | "name">[] = [
  { model: "DC7", wdh: [160, 87, 26], image: "cioks-dc7.png" },
  { model: "DC10", wdh: [160, 87, 26], image: "cioks-dc10.png" },
  { model: "4", wdh: [120, 70, 26], image: "cioks-4.png" },
  { model: "8", wdh: [160, 87, 26], image: "cioks-8.png" },
  { model: "Sol", wdh: [103, 89, 38], image: "cioks-sol.png" },
  { model: "AC10", wdh: [160, 87, 26], image: "cioks-ac10.png" },
  { model: "Ciokolate", wdh: [160, 87, 26], image: "cioks-ciokolate.png" },
  { model: "Crux", wdh: [103, 89, 38], image: "cioks-crux.png" },
];

export const CIOKS_DEVICE_TEMPLATES: DeviceTemplate[] = cioksDevices.map(
  (d) => ({
    ...d,
    name: `Cioks ${d.model}`,
    id: deviceId("cioks", d.model),
    type: "power unit",
    brand: "Cioks",
    image: "cioks/" + d.image,
  })
);
