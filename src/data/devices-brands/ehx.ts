import type { DeviceTemplate } from "../devices";

export const EHX_DEVICE_TEMPLATES: DeviceTemplate[] = [
  {
    id: "device-ehx-nano",
    type: "pedal",
    brand: "Electro-Harmonix",
    model: "Nano Pedal",
    name: "Electro-Harmonix Nano Pedal",
    wdh: [70, 114, 54],
    image: null,
  },
  {
    id: "device-ehx-xo",
    type: "pedal",
    brand: "Electro-Harmonix",
    model: "XO Pedal",
    name: "Electro-Harmonix XO Pedal",
    wdh: [91, 118, 57],
    image: null,
  },
  {
    id: "device-ehx-magnum-44",
    type: "power",
    brand: "Electro-Harmonix",
    model: "44 Magnum",
    name: "Electro-Harmonix 44 Magnum",
    wdh: [70, 114, 53],
    image: "ehx/ehx-magnum-44.png",
  },
  {
    id: "device-ehx-pico",
    type: "pedal",
    brand: "Electro-Harmonix",
    model: "Pico Pedal",
    name: "Electro-Harmonix Pico Pedal",
    wdh: [50, 90, 50],
    image: null,
  },
  {
    id: "device-ehx-memoryman-deluxe",
    type: "pedal",
    brand: "Electro-Harmonix",
    model: "Memory Man Deluxe",
    name: "Electro-Harmonix Memory Man Deluxe",
    wdh: [146, 121, 64],
    image: null,
  },
];
