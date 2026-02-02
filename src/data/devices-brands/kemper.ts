import type { DeviceTemplate } from "../devices";

const WDH_KEMPER_PROFILER_STAGE: [number, number, number] = [470, 260, 85]; // verified
const WDH_KEMPER_PROFILER_PLAYER: [number, number, number] = [145, 166, 68]; // verified

export const KEMPER_DEVICE_TEMPLATES: DeviceTemplate[] = [
  {
    id: "device-kemper-profiler-stage",
    type: "multifx",
    brand: "Kemper",
    model: "Profiler Stage",
    name: "Kemper Profiler Stage",
    wdh: WDH_KEMPER_PROFILER_STAGE,
    image: null,
  },
  {
    id: "device-kemper-profiler-player",
    type: "multifx",
    brand: "Kemper",
    model: "Profiler Player",
    name: "Kemper Profiler Player",
    wdh: WDH_KEMPER_PROFILER_PLAYER,
    image: null,
  },
];
