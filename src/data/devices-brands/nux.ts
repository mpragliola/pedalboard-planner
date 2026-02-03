import type { DeviceTemplate } from "../devices";

export const NUX_DEVICE_TEMPLATES: DeviceTemplate[] = [
  {
    id: "device-nux-mg30",
    type: "multifx",
    brand: "NUX",
    model: "MG-30",
    name: "NUX MG-30",
    wdh: [315, 187, 58],
    image: null,
  },
  {
    id: "device-nux-mg400",
    type: "multifx",
    brand: "NUX",
    model: "MG-400",
    name: "NUX MG-400",
    wdh: [290, 220, 60],
    image: "nux/nux-mg400.png",
  },
  {
    id: "device-nux-b8-wireless",
    type: "wireless",
    brand: "NUX",
    model: "B-8 Wireless",
    name: "NUX B-8 Wireless",
    wdh: [73, 129, 59],
    image: "nux/nux-b8-wireless.png",
  },
];
