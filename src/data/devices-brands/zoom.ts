import type { Wdh } from "../../wdh";
import { WDH_ZOOM_AC, WDH_ZOOM_MS } from "../../wdh";
import type { DeviceTemplate } from "../devices";
import { deviceTemplate, deviceImage } from "../deviceHelpers";

const WDH_ZOOM_338: Wdh = [338, 180, 77];
const WDH_ZOOM_SMALL: Wdh = [10, 10, 10];

type ZoomRow = { model: string; name: string; wdh: Wdh; type: "multifx" | "pedal"; image: string };
const zoomMultifx: ZoomRow[] = [
  { model: "G3Xn", name: "Zoom G3Xn", wdh: [318, 181, 57], type: "multifx", image: "g3xn.png" },
  { model: "G5n", name: "Zoom G5n", wdh: [423, 196, 73], type: "multifx", image: "g5n.png" },
  { model: "G11", name: "Zoom G11", wdh: WDH_ZOOM_338, type: "multifx", image: "g11.png" },
  { model: "A1X Four", name: "Zoom A1X Four", wdh: WDH_ZOOM_SMALL, type: "multifx", image: "a1xfour.png" },
  { model: "AC-2", name: "Zoom AC-2", wdh: WDH_ZOOM_AC, type: "multifx", image: "ac2.png" },
  { model: "AC-3", name: "Zoom AC-3", wdh: WDH_ZOOM_AC, type: "multifx", image: "ac3.png" },
  { model: "B2 Four", name: "Zoom B2 Four", wdh: WDH_ZOOM_SMALL, type: "multifx", image: "b2four.png" },
  { model: "B6", name: "Zoom B6", wdh: WDH_ZOOM_338, type: "multifx", image: "b6.png" },
  { model: "G1 Four", name: "Zoom G1 Four", wdh: WDH_ZOOM_SMALL, type: "multifx", image: "g1four.png" },
  { model: "G6", name: "Zoom G6", wdh: WDH_ZOOM_338, type: "multifx", image: "g6.png" },
  { model: "G5", name: "Zoom G5", wdh: [423, 196, 73], type: "multifx", image: "g5.png" },
  { model: "G3", name: "Zoom G3", wdh: [318, 181, 57], type: "multifx", image: "g3.png" },
  { model: "G3X", name: "Zoom G3X", wdh: [318, 181, 57], type: "multifx", image: "g3x.png" },
  { model: "G7.1ut", name: "Zoom G7.1ut", wdh: WDH_ZOOM_338, type: "multifx", image: "g7-1ut.png" },
  { model: "G9.2tt", name: "Zoom G9.2tt", wdh: WDH_ZOOM_338, type: "multifx", image: "g9-2tt.png" },
  { model: "FP1", name: "Zoom FP1", wdh: WDH_ZOOM_AC, type: "multifx", image: "fp1.png" },
  { model: "FP-02M", name: "Zoom FP-02M", wdh: WDH_ZOOM_AC, type: "multifx", image: "fp-02m.png" },
];

const zoomPedals: ZoomRow[] = [
  { model: "MS-50G+", name: "Zoom MS-50G+", wdh: WDH_ZOOM_MS, type: "pedal", image: "m50gplus.png" },
  { model: "MS-200D+", name: "Zoom MS-200D+", wdh: WDH_ZOOM_MS, type: "pedal", image: "ms-200dplus.png" },
  { model: "MS-60B+", name: "Zoom MS-60B+", wdh: WDH_ZOOM_MS, type: "pedal", image: "ms-60bplus.png" },
  { model: "MS-70CDR+", name: "Zoom MS-70CDR+", wdh: WDH_ZOOM_MS, type: "pedal", image: "ms-70cdrplus.png" },
  { model: "MS-80IR+", name: "Zoom MS-80IR+", wdh: WDH_ZOOM_MS, type: "pedal", image: "ms-80irplus.png" },
  { model: "MS-90LP+", name: "Zoom MS-90LP+", wdh: WDH_ZOOM_MS, type: "pedal", image: "ms-90lpplus.png" },
];

const zoomRows: ZoomRow[] = [...zoomMultifx, ...zoomPedals];

export const ZOOM_DEVICE_TEMPLATES: DeviceTemplate[] = zoomRows.map((d) =>
  deviceTemplate("zoom", "Zoom", {
    type: d.type,
    model: d.model,
    wdh: d.wdh,
    name: d.name,
    image: deviceImage("zoom", d.image),
  })
);
