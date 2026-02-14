import type { Shape3D } from "../../shape3d";
import type { Wdh } from "../../wdh";
import type { DeviceTemplate } from "../devices";
import { deviceTemplate, deviceImage } from "../deviceHelpers";

/** Dunlop Cry Baby standard wah. */
const WDH_CRYBABY_STANDARD: Wdh = [102, 252, 76];
/** MXR standard (e.g. Phase 90, Carbon Copy). */
const WDH_MXR_STANDARD: Wdh = [60, 110, 50];

const WAH_SHAPE: Shape3D = { type: "wah" };

const dunlopRows: { model: string; wdh: Wdh; image: string; shape?: Shape3D }[] = [
  {
    model: "GCB95 Cry Baby Standard",
    wdh: WDH_CRYBABY_STANDARD,
    image: "cry-baby-standard.png",
    shape: WAH_SHAPE,
  },
  {
    model: "CBM95 Cry Baby Mini Wah",
    wdh: [80, 133, 75],
    image: "cry-baby-mini.png",
    shape: WAH_SHAPE,
  },
  {
    model: "CBJ95 Cry Baby Junior Wah White",
    wdh: [101, 203, 76],
    image: "cry-baby-junior-wah-special-edition-white.png",
    shape: WAH_SHAPE,
  },
  {
    model: "535Q-C Cry Baby 535Q Multi-Wah Chrome",
    wdh: WDH_CRYBABY_STANDARD,
    image: "dunlop-cry-baby-535q-multi-wah-chrome.png",
    shape: WAH_SHAPE,
  },
  {
    model: "M250 Q Zone Fixed Wah",
    wdh: WDH_MXR_STANDARD,
    image: "cry-baby-q-zone-fixed-wah.png",
  },
  {
    model: "DB01 Dimebag Cry Baby From Hell Wah",
    wdh: WDH_CRYBABY_STANDARD,
    image: "dimebag-cry-baby-wah.png",
    shape: WAH_SHAPE,
  },
  {
    model: "GCJ95 Gary Clark Jr. Cry Baby Wah",
    wdh: WDH_CRYBABY_STANDARD,
    image: "dunlop-gary-clark-jr.-cry-baby-wah.png",
    shape: WAH_SHAPE,
  },
  {
    model: "GZ95 Geezer Butler Cry Baby Wah",
    wdh: WDH_CRYBABY_STANDARD,
    image: "dunlop-geezer-butler-cry-baby-wah.png",
    shape: WAH_SHAPE,
  },
  {
    model: "JC95B Jerry Cantrell Firefly Cry Baby Wah",
    wdh: WDH_CRYBABY_STANDARD,
    image: "dunlop-jerry-cantrell-firefly-cry-baby-wah-cream.png",
    shape: WAH_SHAPE,
  },
  {
    model: "SEP95 Sepultura 40th Anniv Cry Baby Wah",
    wdh: WDH_CRYBABY_STANDARD,
    image: "dunlop-sepultura-40th-anniversary-cry-baby-wah.png",
    shape: WAH_SHAPE,
  },
  {
    model: "TBM95 Tom Morello Cry Baby Wah",
    wdh: WDH_CRYBABY_STANDARD,
    image: "dunlop-tom-morello-cry-baby-wah.png",
    shape: WAH_SHAPE,
  },
  {
    model: "KH95 Kirk Hammett Collection Cry Baby Wah",
    wdh: WDH_CRYBABY_STANDARD,
    image: "kirk-hammett-collection-cry-baby-wah.png",
    shape: WAH_SHAPE,
  },
];

export const DUNLOP_DEVICE_TEMPLATES: DeviceTemplate[] = dunlopRows.map((d) =>
  deviceTemplate("dunlop", "Dunlop", {
    type: "pedal",
    model: d.model,
    wdh: d.wdh,
    image: deviceImage("dunlop", d.image),
    shape: d.shape,
  })
);
