import type { DeviceTemplate } from "../devices";
import { createBrandHelpers } from "../deviceHelpers";

const { multifx } = createBrandHelpers("kemper", "Kemper");

const WDH_PROFILER_STAGE: [number, number, number] = [470, 260, 85];
const WDH_PROFILER_PLAYER: [number, number, number] = [145, 166, 68];

export const KEMPER_DEVICE_TEMPLATES: DeviceTemplate[] = [
  multifx("Profiler Stage", WDH_PROFILER_STAGE, null),
  multifx("Profiler Player", WDH_PROFILER_PLAYER, null),
];
