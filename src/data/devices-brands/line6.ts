import type { DeviceTemplate } from "../devices";
import { deviceId } from "../../lib/slug";

// Dimensions [width, depth, height] in mm — from Line 6 specs / manuals where verified
const WDH_LINE6_DL4_MKII: [number, number, number] = [282, 120, 51]; // 11.1" x 4.7" x 2" (Guitar Chalk / Line 6)
const WDH_LINE6_HELIX_FLOOR: [number, number, number] = [560, 301, 91]; // 22.05" x 11.85" x 3.6" (Line 6 KB)
const WDH_LINE6_HELIX_LT: [number, number, number] = [530, 303, 93]; // ~20.87" x 11.93" x 3.66"
const WDH_LINE6_HX_STOMP: [number, number, number] = [178, 126, 66]; // 7.01" x 4.96" x 2.6" (Guitar Chalk)
const WDH_LINE6_HX_STOMP_XL: [number, number, number] = [318, 126, 66]; // 12.5" wide, depth/height ~HX Stomp
const WDH_LINE6_POD_GO: [number, number, number] = [358, 231, 89]; // 14.1" x 9.1" x 3.5" (POD Go FAQ)
const WDH_LINE6_STADIUM_FLOOR: [number, number, number] = [408, 241, 82]; // estimated
const WDH_LINE6_STADIUM_XL_FLOOR: [number, number, number] = [492, 262, 110]; // estimated
const WDH_LINE6_HX_ONE: [number, number, number] = [96, 125, 62]; // ultra-compact; exact mm not in public spec
// Relay receiver dimensions (Line 6 comparison chart)
const WDH_LINE6_RELAY_G10: [number, number, number] = [99, 99, 60.3];
const WDH_LINE6_RELAY_G30: [number, number, number] = [80, 114, 31];
const WDH_LINE6_RELAY_G50: [number, number, number] = [80, 110, 33];
const WDH_LINE6_RELAY_G70: [number, number, number] = [103, 140, 52]; // pilot's guide

const line6Devices: Omit<DeviceTemplate, "id" | "name" | "brand">[] = [
  { type: "pedal", model: "DL4 MkII", wdh: WDH_LINE6_DL4_MKII, image: null },
  { type: "pedal", model: "HX One", wdh: WDH_LINE6_HX_ONE, image: "line6-hx-one.png" },
  { type: "multifx", model: "Helix Floor", wdh: WDH_LINE6_HELIX_FLOOR, image: "line6-helix-floor.png" },
  { type: "multifx", model: "Helix LT", wdh: WDH_LINE6_HELIX_LT, image: null },
  { type: "multifx", model: "HX Stomp", wdh: WDH_LINE6_HX_STOMP, image: "line6-hxstomp.png" },
  { type: "multifx", model: "HX Stomp XL", wdh: WDH_LINE6_HX_STOMP_XL, image: null },
  { type: "multifx", model: "POD Go", wdh: WDH_LINE6_POD_GO, image: "line6-podgo.png" },
  { type: "multifx", model: "Stadium Floor", wdh: WDH_LINE6_STADIUM_FLOOR, image: null },
  { type: "multifx", model: "Stadium XL Floor", wdh: WDH_LINE6_STADIUM_XL_FLOOR, image: null },
  { type: "wireless", model: "Relay G10 Wireless", wdh: WDH_LINE6_RELAY_G10, image: "line6-relay-g10-wireless.png" },
  { type: "wireless", model: "Relay G30 Wireless", wdh: WDH_LINE6_RELAY_G30, image: "line6-relayg30-wireless.png" },
  { type: "wireless", model: "Relay G50", wdh: WDH_LINE6_RELAY_G50, image: "line6-relay-g50.png" },
  { type: "wireless", model: "Relay G70", wdh: WDH_LINE6_RELAY_G70, image: "line6-relay-g70.png" },
];

export const LINE6_DEVICE_TEMPLATES: DeviceTemplate[] = line6Devices.map((d) => ({
  ...d,
  name: `Line 6 ${d.model}`,
  id: deviceId("line6", d.model),
  brand: "Line 6",
  image: d.image ? "line6/" + d.image : null,
}));
