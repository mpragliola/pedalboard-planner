import type { DeviceTemplate } from "../devices";
import { deviceId } from "../../lib/slug";

const WDH_LINE6_DL4_MKII: [number, number, number] = [254, 152.4, 63.5]; // verified
const WDH_LINE6_HELIX_FLOOR: [number, number, number] = [558, 300, 85]; // verified
const WDH_LINE6_HELIX_LT: [number, number, number] = [529, 301, 87]; // verified
const WDH_LINE6_HX_STOMP: [number, number, number] = [178, 126, 66]; // verified
const WDH_LINE6_HX_STOMP_XL: [number, number, number] = [316, 120, 68]; // verified
const WDH_LINE6_POD_GO: [number, number, number] = [356, 225, 95]; // verified
const WDH_LINE6_STADIUM_FLOOR: [number, number, number] = [408, 241, 82]; // verified
const WDH_LINE6_STADIUM_XL_FLOOR: [number, number, number] = [492, 262, 110]; // verified
const WDH_LINE6_RELAY: [number, number, number] = [73, 129, 59]; // compact wireless
const WDH_LINE6_HX_ONE: [number, number, number] = [96, 125, 62]; // single stomp

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
  {
    type: "wireless",
    model: "Relay G10 Wireless",
    wdh: WDH_LINE6_RELAY,
    image: "line6-relay-g10-wireless.png",
  },
  { type: "wireless", model: "Relay G30 Wireless", wdh: WDH_LINE6_RELAY, image: "line6-relayg30-wireless.png" },
  { type: "wireless", model: "Relay G50", wdh: WDH_LINE6_RELAY, image: "line6-relay-g50.png" },
  { type: "wireless", model: "Relay G70", wdh: WDH_LINE6_RELAY, image: "line6-relay-g70.png" },
];

export const LINE6_DEVICE_TEMPLATES: DeviceTemplate[] = line6Devices.map((d) => ({
  ...d,
  name: `Line 6 ${d.model}`,
  id: deviceId("line6", d.model),
  brand: "Line 6",
  image: d.image ? "line6/" + d.image : null,
}));
