import type { DeviceTemplate } from "../devices";
import { createBrandHelpers } from "../deviceHelpers";

const { pedal } = createBrandHelpers("jhs", "JHS");

export const JHS_DEVICE_TEMPLATES: DeviceTemplate[] = [pedal("Standard", [66, 121, 56], null)];
