import type { DeviceTemplate } from "../devices";
import { createBrandHelpers } from "../deviceHelpers";

const { pedal } = createBrandHelpers("earthquaker", "EarthQuaker Devices");

export const EARTHQUAKER_DEVICE_TEMPLATES: DeviceTemplate[] = [pedal("Standard", [64, 117, 57], null)];
