import type { Shape3D } from "../../shape3d";
import type { DeviceTemplate } from "../devices";
import { deviceTemplate, deviceImage } from "../deviceHelpers";

const WDH_LINE6_DL4_MKII: [number, number, number] = [282, 120, 51];
const WDH_LINE6_HELIX_FLOOR: [number, number, number] = [560, 301, 91];
const WDH_LINE6_HELIX_LT: [number, number, number] = [530, 303, 93];
const WDH_LINE6_HX_STOMP: [number, number, number] = [178, 126, 66];
const WDH_LINE6_HX_STOMP_XL: [number, number, number] = [318, 126, 66];
const WDH_LINE6_POD_GO: [number, number, number] = [358, 231, 89];
const WDH_LINE6_STADIUM_FLOOR: [number, number, number] = [408, 241, 82];
const WDH_LINE6_STADIUM_XL_FLOOR: [number, number, number] = [492, 262, 110];
const WDH_LINE6_HX_ONE: [number, number, number] = [96, 125, 62];
const WDH_LINE6_RELAY_G10: [number, number, number] = [99, 99, 60.3];
const WDH_LINE6_RELAY_G30: [number, number, number] = [80, 114, 31];
const WDH_LINE6_RELAY_G50: [number, number, number] = [80, 110, 33];
const WDH_LINE6_RELAY_G70: [number, number, number] = [103, 140, 52];

const HALF_WEDGE_FLOOR: Shape3D = { type: "half-wedge", topRatio: 0.5, frontRatio: 0.65 };
const WEDGE_FLOOR: Shape3D = { type: "wedge", ratio: 0.5 };

type Line6Row = {
  type: "pedal" | "multifx" | "wireless";
  model: string;
  wdh: [number, number, number];
  image: string | null;
  shape?: Shape3D;
};
const line6Rows: Line6Row[] = [
  { type: "pedal", model: "DL4 MkII", wdh: WDH_LINE6_DL4_MKII, image: null },
  { type: "pedal", model: "HX One", wdh: WDH_LINE6_HX_ONE, image: "line6-hx-one.png" },
  { type: "multifx", model: "Helix Floor", wdh: WDH_LINE6_HELIX_FLOOR, image: "line6-helix-floor.png", shape: WEDGE_FLOOR },
  { type: "multifx", model: "Helix LT", wdh: WDH_LINE6_HELIX_LT, image: null, shape: WEDGE_FLOOR },
  { type: "multifx", model: "HX Stomp", wdh: WDH_LINE6_HX_STOMP, image: "line6-hxstomp.png" },
  { type: "multifx", model: "HX Stomp XL", wdh: WDH_LINE6_HX_STOMP_XL, image: null },
  { type: "multifx", model: "POD Go", wdh: WDH_LINE6_POD_GO, image: "line6-podgo.png", shape: WEDGE_FLOOR },
  { type: "multifx", model: "Stadium Floor", wdh: WDH_LINE6_STADIUM_FLOOR, image: null, shape: HALF_WEDGE_FLOOR },
  { type: "multifx", model: "Stadium XL Floor", wdh: WDH_LINE6_STADIUM_XL_FLOOR, image: null, shape: HALF_WEDGE_FLOOR },
  { type: "wireless", model: "Relay G10 Wireless", wdh: WDH_LINE6_RELAY_G10, image: "line6-relay-g10-wireless.png" },
  { type: "wireless", model: "Relay G30 Wireless", wdh: WDH_LINE6_RELAY_G30, image: "line6-relayg30-wireless.png" },
  { type: "wireless", model: "Relay G50", wdh: WDH_LINE6_RELAY_G50, image: "line6-relay-g50.png" },
  { type: "wireless", model: "Relay G70", wdh: WDH_LINE6_RELAY_G70, image: "line6-relay-g70.png" },
];

export const LINE6_DEVICE_TEMPLATES: DeviceTemplate[] = line6Rows.map((d) =>
  deviceTemplate("line6", "Line 6", {
    type: d.type,
    model: d.model,
    wdh: d.wdh,
    image: d.image ? deviceImage("line6", d.image) : null,
    shape: d.shape,
  })
);
