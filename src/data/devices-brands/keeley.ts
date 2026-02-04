import type { DeviceTemplate } from "../devices";
import { createBrandHelpers } from "../deviceHelpers";

const { pedal } = createBrandHelpers("keeley", "Keeley");

export const KEELEY_DEVICE_TEMPLATES: DeviceTemplate[] = [pedal("Standard", [66, 121, 56], null)];
