import type { DeviceTemplate } from "../devices";

export const HEADRUSH_DEVICE_TEMPLATES: DeviceTemplate[] = [
  {
    id: "device-headrush-pedalboard",
    type: "multifx",
    brand: "Headrush",
    model: "Pedalboard",
    name: "Headrush Pedalboard",
    wdh: [667, 356, 87],
    image: "headrush/headrush-pedalboard.png",
  },
  {
    id: "device-headrush-gigboard",
    type: "multifx",
    brand: "Headrush",
    model: "Gigboard",
    name: "Headrush Gigboard",
    wdh: [457, 318, 76],
    image: null,
  },
  {
    id: "device-headrush-mx5",
    type: "multifx",
    brand: "Headrush",
    model: "MX5",
    name: "Headrush MX5",
    wdh: [295, 150, 65],
    image: null,
  },
];
