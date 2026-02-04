import type { DeviceTemplate } from "../devices";
import { deviceTemplate, deviceImage } from "../deviceHelpers";
import type { Wdh } from "../../wdh";

const WDH_CUVAVE: Wdh = [162, 61, 23];
const WDH_CHOCOLATE: Wdh = [212, 36, 17];
const WDH_TANKG: Wdh = [230, 100, 35];
const WHD_BLACKBOX: Wdh = [110, 110, 35];

type MvaveRow = { type: "multifx" | "controller"; model: string; wdh: Wdh; image: string };
const mvaveRows: MvaveRow[] = [
  { type: "multifx", model: "Blackbox", wdh: WHD_BLACKBOX, image: "mvave-blackbox.png" },
  { type: "controller", model: "Chocolate", wdh: WDH_CHOCOLATE, image: "mvave-chocolate.png" },
  { type: "controller", model: "Chocolate Plus", wdh: WDH_CHOCOLATE, image: "mvave-chocolate-plus.png" },
  { type: "multifx", model: "Cuvave Acoustic", wdh: WDH_CUVAVE, image: "mvave-cucave-acoustic.png" },
  { type: "multifx", model: "Cuvave (Cube Baby)", wdh: WDH_CUVAVE, image: "mvave-cuvave.png" },
  { type: "multifx", model: "Tank G", wdh: WDH_TANKG, image: "mvave-gtank.png" },
];

export const MVAVE_DEVICE_TEMPLATES: DeviceTemplate[] = mvaveRows.map((d) =>
  deviceTemplate("mvave", "Mvave", {
    type: d.type,
    model: d.model,
    wdh: d.wdh,
    image: deviceImage("mvave", d.image),
  })
);
