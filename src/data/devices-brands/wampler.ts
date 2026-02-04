import type { DeviceTemplate } from "../devices";
import { createBrandHelpers } from "../deviceHelpers";

const { pedal } = createBrandHelpers("wampler", "Wampler");

export const WAMPLER_DEVICE_TEMPLATES: DeviceTemplate[] = [pedal("Standard", [64, 118, 57], null)];
