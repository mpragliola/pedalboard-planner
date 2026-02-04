import type { DeviceTemplate } from "../devices";
import { createBrandHelpers } from "../deviceHelpers";

const { multifx } = createBrandHelpers("ik-multimedia", "IK Multimedia");

export const IK_MULTIMEDIA_DEVICE_TEMPLATES: DeviceTemplate[] = [multifx("Tonex Pedal", [176, 142, 58], null)];
