import type { DeviceTemplate } from "../devices";
import { deviceId } from "../../lib/slug";
import type { Wdh } from "../../wdh";

type NeuralRowBase = {
  model: string;
  wdh: Wdh;
  image: string | null;
};

// verified
export const WDH_QUAD_CORTEX: Wdh = [290, 195, 69];
export const WDH_MINI_CORTEX: Wdh = [228, 118, 65];
export const WDH_NANO_CORTEX: Wdh = [144, 103, 62];

const neuralTemplatesRaw: NeuralRowBase[] = [
  { model: "Quad Cortex", wdh: WDH_QUAD_CORTEX, image: "quadcortex.png" },
  { model: "Mini Cortex", wdh: WDH_MINI_CORTEX, image: "minicortex.png" },
  { model: "Nano Cortex", wdh: WDH_NANO_CORTEX, image: "neural-nano-cortex.png" },
];

export const NEURAL_DEVICE_TEMPLATES: DeviceTemplate[] = neuralTemplatesRaw.map((d) => ({
  id: deviceId("neural", d.model),
  type: "multifx",
  brand: "Neural DSP",
  model: d.model,
  name: `Neural DSP ${d.model}`,
  wdh: d.wdh,
  image: d.image ? `neural/${d.image}` : null,
}));
