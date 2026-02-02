import type { DeviceTemplate } from "../devices";

export const NEURAL_DEVICE_TEMPLATES: DeviceTemplate[] = [
  {
    id: "device-neural-quadcortex",
    type: "multifx",
    brand: "Neural DSP",
    model: "Quad Cortex",
    name: "Neural DSP Quad Cortex",
    wdh: [290, 195, 69],
    image: "neural/quadcortex.png",
  },
  {
    id: "device-neural-minicortex",
    type: "multifx",
    brand: "Neural DSP",
    model: "Mini Cortex",
    name: "Neural DSP Mini Cortex",
    wdh: [228, 118, 65],
    image: "neural/minicortex.png",
  },
];
