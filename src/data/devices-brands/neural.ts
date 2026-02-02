import type { DeviceTemplate } from "../devices";

// verified
const WDH_QUAD_CORTEX: [number, number, number] = [290, 195, 69];
const WDH_MINI_CORTEX: [number, number, number] = [228, 118, 65];

export const NEURAL_DEVICE_TEMPLATES: DeviceTemplate[] = [
  {
    id: "device-neural-quadcortex",
    type: "multifx",
    brand: "Neural DSP",
    model: "Quad Cortex",
    name: "Neural DSP Quad Cortex",
    wdh: WDH_QUAD_CORTEX,
    image: "neural/quadcortex.png",
  },
  {
    id: "device-neural-minicortex",
    type: "multifx",
    brand: "Neural DSP",
    model: "Mini Cortex",
    name: "Neural DSP Mini Cortex",
    wdh: WDH_MINI_CORTEX,
    image: "neural/minicortex.png",
  },
];
