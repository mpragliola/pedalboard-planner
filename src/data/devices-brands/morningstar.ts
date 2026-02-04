import type { DeviceTemplate } from "../devices";
import { deviceTemplate, deviceImage } from "../deviceHelpers";

const WDH_MC4: [number, number, number] = [120, 80, 40];
const WDH_MC6: [number, number, number] = [180, 95, 45];
const WDH_MC8: [number, number, number] = [240, 95, 45];

type MorningstarRow = { type: "controller"; model: string; wdh: [number, number, number]; image: string };
const morningstarRows: MorningstarRow[] = [
  { type: "controller", model: "MC4 Pro", wdh: WDH_MC4, image: "morningstar-mc4-pro.png" },
  { type: "controller", model: "MC6", wdh: WDH_MC6, image: "morningstar-mc6.png" },
  { type: "controller", model: "MC6 MkII", wdh: WDH_MC6, image: "morningstar-mc6-mkii.png" },
  { type: "controller", model: "MC8", wdh: WDH_MC8, image: "morninstar-mc8.png" },
];

export const MORNINGSTAR_DEVICE_TEMPLATES: DeviceTemplate[] = morningstarRows.map((d) =>
  deviceTemplate("morningstar", "Morningstar", {
    type: d.type,
    model: d.model,
    wdh: d.wdh,
    image: deviceImage("morningstar", d.image),
  })
);
