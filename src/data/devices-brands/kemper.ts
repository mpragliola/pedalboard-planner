import type { DeviceTemplate } from "../devices";

export const KEMPER_DEVICE_TEMPLATES: DeviceTemplate[] = [
  {
    id: "device-kemper-profiler-stage",
    type: "multifx",
    brand: "Kemper",
    model: "Profiler Stage",
    name: "Kemper Profiler Stage",
    wdh: [470, 260, 85],
    image: null,
  },
  {
    id: "device-kemper-profiler-player",
    type: "multifx",
    brand: "Kemper",
    model: "Profiler Player",
    name: "Kemper Profiler Player",
    wdh: [311, 198, 68],
    image: null,
  },
];
