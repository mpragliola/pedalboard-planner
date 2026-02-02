import type { DeviceTemplate } from "../devices";

export const JOYO_DEVICE_TEMPLATES: DeviceTemplate[] = [
  {
    id: "device-joyo-ironman-mini",
    type: "pedal",
    brand: "Joyo",
    model: "Ironman Mini",
    name: "Joyo Ironman Mini",
    wdh: [50, 75, 45],
    image: null,
  },
  {
    id: "device-joyo-standard",
    type: "pedal",
    brand: "Joyo",
    model: "Standard Pedal",
    name: "Joyo Standard Pedal",
    wdh: [70, 120, 50],
    image: null,
  },
  {
    id: "device-joyo-jp05",
    type: "power unit",
    brand: "Joyo",
    model: "JP-05 Power Bank Supply 5",
    name: "Joyo JP-05 Power Bank Supply 5",
    wdh: [150, 85, 40],
    image: null,
  },
];
