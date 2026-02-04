import { WDH_CRYBABY_STANDARD, WDH_MXR_STANDARD } from "../../wdh";
import type { DeviceTemplate } from "../devices";
import { deviceTemplate, deviceImage } from "../deviceHelpers";

const dunlopRows: { model: string; wdh: [number, number, number]; image: string }[] = [
  {
    model: "GCB95 Cry Baby Standard",
    wdh: WDH_CRYBABY_STANDARD,
    image: "cry-baby-standard.png",
  },
  {
    model: "CBM95 Cry Baby Mini Wah",
    wdh: [80, 133, 75],
    image: "cry-baby-mini.png",
  },
  {
    model: "CBJ95 Cry Baby Junior Wah White",
    wdh: [101, 203, 76],
    image: "cry-baby-junior-wah-special-edition-white.png",
  },
  {
    model: "535Q-C Cry Baby 535Q Multi-Wah Chrome",
    wdh: WDH_CRYBABY_STANDARD,
    image: "dunlop-cry-baby-535q-multi-wah-chrome.png",
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
  },
  {
    model: "GCJ95 Gary Clark Jr. Cry Baby Wah",
    wdh: WDH_CRYBABY_STANDARD,
    image: "dunlop-gary-clark-jr.-cry-baby-wah.png",
  },
  {
    model: "GZ95 Geezer Butler Cry Baby Wah",
    wdh: WDH_CRYBABY_STANDARD,
    image: "dunlop-geezer-butler-cry-baby-wah.png",
  },
  {
    model: "JC95B Jerry Cantrell Firefly Cry Baby Wah",
    wdh: WDH_CRYBABY_STANDARD,
    image: "dunlop-jerry-cantrell-firefly-cry-baby-wah-cream.png",
  },
  {
    model: "SEP95 Sepultura 40th Anniv Cry Baby Wah",
    wdh: WDH_CRYBABY_STANDARD,
    image: "dunlop-sepultura-40th-anniversary-cry-baby-wah.png",
  },
  {
    model: "TBM95 Tom Morello Cry Baby Wah",
    wdh: WDH_CRYBABY_STANDARD,
    image: "dunlop-tom-morello-cry-baby-wah.png",
  },
  {
    model: "KH95 Kirk Hammett Collection Cry Baby Wah",
    wdh: WDH_CRYBABY_STANDARD,
    image: "kirk-hammett-collection-cry-baby-wah.png",
  },
];

export const DUNLOP_DEVICE_TEMPLATES: DeviceTemplate[] = dunlopRows.map((d) =>
  deviceTemplate("dunlop", "Dunlop", {
    type: "pedal",
    model: d.model,
    wdh: d.wdh,
    image: deviceImage("dunlop", d.image),
  })
);
