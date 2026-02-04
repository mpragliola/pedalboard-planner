import type { DeviceTemplate } from "../devices";
import { createBrandHelpers } from "../deviceHelpers";

const { pedal } = createBrandHelpers("walrus", "Walrus Audio");

export const WALRUS_DEVICE_TEMPLATES: DeviceTemplate[] = [pedal("Standard", [67, 122, 57], null)];
