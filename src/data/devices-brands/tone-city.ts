import type { DeviceTemplate } from "../devices";
import { createBrandHelpers } from "../deviceHelpers";

const { power } = createBrandHelpers("tonecity", "Tone City");

export const TONE_CITY_DEVICE_TEMPLATES: DeviceTemplate[] = [power("TPS-06 Multi Power Supply", [150, 80, 35], null)];
