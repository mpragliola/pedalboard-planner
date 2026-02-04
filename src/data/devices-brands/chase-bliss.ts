import type { DeviceTemplate } from "../devices";
import { createBrandHelpers } from "../deviceHelpers";

const { pedal } = createBrandHelpers("chase-bliss", "Chase Bliss");

export const CHASE_BLISS_DEVICE_TEMPLATES: DeviceTemplate[] = [pedal("Standard", [60, 125, 60], null)];
