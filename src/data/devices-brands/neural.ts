import type { DeviceTemplate } from "../devices";
import { deviceTemplate, deviceImage } from "../deviceHelpers";
import type { Wdh } from "../../wdh";

export const WDH_QUAD_CORTEX: Wdh = [290, 195, 69];
export const WDH_MINI_CORTEX: Wdh = [228, 118, 65];
export const WDH_NANO_CORTEX: Wdh = [144, 103, 62];

const neuralRows: { model: string; wdh: Wdh; image: string | null }[] = [
  { model: "Quad Cortex", wdh: WDH_QUAD_CORTEX, image: "quadcortex.png" },
  { model: "Mini Cortex", wdh: WDH_MINI_CORTEX, image: "minicortex.png" },
  { model: "Nano Cortex", wdh: WDH_NANO_CORTEX, image: "neural-nano-cortex.png" },
];

export const NEURAL_DEVICE_TEMPLATES: DeviceTemplate[] = neuralRows.map((d) =>
  deviceTemplate("neural", "Neural DSP", {
    type: "multifx",
    model: d.model,
    wdh: d.wdh,
    image: d.image ? deviceImage("neural", d.image) : null,
  })
);
