import type { DeviceTemplate } from "../devices";

export const HARLEY_BENTON_DEVICE_TEMPLATES: DeviceTemplate[] = [
  {
    id: "device-harleybenton-iso5pro",
    type: "power unit",
    brand: "Harley Benton",
    model: "PowerPlant ISO-5 Pro",
    name: "Harley Benton PowerPlant ISO-5 Pro",
    wdh: [140, 90, 35],
    image: null,
  },
  {
    id: "device-harleybenton-dnafx-git",
    type: "multifx",
    brand: "Harley Benton",
    model: "DNAfx GiT",
    name: "Harley Benton DNAfx GiT",
    wdh: [430, 250, 75],
    image: null,
  },
  {
    id: "device-harleybenton-dnafx-git-pro",
    type: "multifx",
    brand: "Harley Benton",
    model: "DNAfx GiT Pro",
    name: "Harley Benton DNAfx GiT Pro",
    wdh: [560, 350, 90],
    image: null,
  },
  {
    id: "device-harleybenton-airborne-pro-5-8ghz-wireless",
    type: "wireless",
    brand: "Harley Benton",
    model: "Airborne Pro 5.8GHz Wireless",
    name: "Harley Benton Airborne Pro 5.8GHz Wireless",
    wdh: [73, 129, 59],
    image: "harley-benton/harley-benton-airborne-pro-5.8ghz-wireless.png",
  },
];
