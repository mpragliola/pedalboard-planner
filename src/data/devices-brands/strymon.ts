import type { DeviceTemplate } from "../devices";
import { deviceTemplate } from "../deviceHelpers";

const WDH_SMALL: [number, number, number] = [171, 130, 48];
const WDH_COMPACT: [number, number, number] = [114, 102, 44];
const WDH_POWER_UNIT: [number, number, number] = [81, 58, 33];

function strymonImage(filename: string): string {
  const base = filename.endsWith(".png") ? filename.slice(0, -4) : filename;
  const name = base.startsWith("strymon-") ? base : `strymon-${base}`;
  return `strymon/${name}.png`;
}

type StrymonRow = {
  type: "pedal" | "power" | "controller";
  model: string;
  wdh: [number, number, number];
  image: string;
};
const strymonRows: StrymonRow[] = [
  { type: "power", model: "Zuma", wdh: WDH_POWER_UNIT, image: "zuma" },
  { type: "pedal", model: "BigSky MX", wdh: [178, 127, 48], image: "bigsky-mx" },
  { type: "pedal", model: "BigSky", wdh: WDH_SMALL, image: "bigsky" },
  { type: "pedal", model: "BlueSky v2", wdh: WDH_COMPACT, image: "bluesky-v2" },
  { type: "pedal", model: "Brig", wdh: WDH_COMPACT, image: "brig" },
  { type: "pedal", model: "Cloudburst", wdh: WDH_COMPACT, image: "cloudburst" },
  { type: "pedal", model: "Compadre", wdh: WDH_COMPACT, image: "compadre" },
  { type: "pedal", model: "Deco v2", wdh: WDH_COMPACT, image: "deco-v2" },
  { type: "pedal", model: "DIG v2", wdh: WDH_COMPACT, image: "dig-v2" },
  { type: "pedal", model: "EC-1", wdh: WDH_COMPACT, image: "ec-1" },
  { type: "pedal", model: "El Capistan v2", wdh: WDH_COMPACT, image: "el-capistan-v2" },
  { type: "pedal", model: "Fairfax", wdh: WDH_COMPACT, image: "fairfax" },
  { type: "pedal", model: "Flint v2", wdh: WDH_COMPACT, image: "flint-v2" },
  { type: "pedal", model: "Iridium", wdh: WDH_COMPACT, image: "iridium" },
  { type: "pedal", model: "Lex v2", wdh: WDH_COMPACT, image: "lex-v2" },
  { type: "controller", model: "Mini Switch", wdh: WDH_COMPACT, image: "miniswitch" },
  { type: "controller", model: "MultiSwitch Plus", wdh: WDH_SMALL, image: "multiswitch-plus" },
  { type: "pedal", model: "Mobius", wdh: WDH_SMALL, image: "mobius" },
  { type: "pedal", model: "NightSky", wdh: WDH_COMPACT, image: "nightsky" },
  { type: "pedal", model: "Oliver", wdh: WDH_COMPACT, image: "oliver" },
  { type: "pedal", model: "Riverside", wdh: WDH_COMPACT, image: "riverside" },
  { type: "pedal", model: "Sunset", wdh: WDH_COMPACT, image: "sunset" },
  { type: "pedal", model: "Timeline", wdh: WDH_SMALL, image: "timeline" },
  { type: "pedal", model: "Ultraviolet", wdh: WDH_COMPACT, image: "ultraviolet" },
  { type: "pedal", model: "Volante", wdh: WDH_COMPACT, image: "volante" },
  { type: "pedal", model: "Zelzah", wdh: WDH_COMPACT, image: "zelzah" },
];

export const STRYMON_DEVICE_TEMPLATES: DeviceTemplate[] = strymonRows.map((d) =>
  deviceTemplate("strymon", "Strymon", {
    type: d.type,
    model: d.model,
    wdh: d.wdh,
    image: strymonImage(d.image),
  })
);
