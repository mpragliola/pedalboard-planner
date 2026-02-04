import type { DeviceTemplate } from "../devices";
import { createBrandHelpers } from "../deviceHelpers";

const { multifx, img } = createBrandHelpers("atomic", "Atomic");

export const ATOMIC_DEVICE_TEMPLATES: DeviceTemplate[] = [
  multifx("AmpliFire 3", [219.1, 168.3, 76.2], img("atomic-amplifire-3.png")),
  multifx("AmpliFire 6", [219.1, 168.3, 76.2], img("atomic-amplifire-6.png")),
  multifx("AmpliFire 12", [425.5, 168.1, 76.2], img("atomic-amplifire-12.png")),
  multifx("AmpliFirebox", [88.7, 117.5, 57.1], img("atomic-amplifirebox.png")),
];
