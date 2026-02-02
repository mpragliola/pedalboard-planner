import type { DeviceTemplate } from "../devices";
import { deviceId } from "../../lib/slug";

const strymonDevices: Omit<DeviceTemplate, "id" | "name" | "brand">[] = [
  {
    type: "pedal",
    model: "Small Format (Timeline / BigSky)",
    wdh: [170, 127, 44],
    image: null,
  },
  {
    type: "pedal",
    model: "Compact (El Capistan v2 size)",
    wdh: [114, 103, 44],
    image: null,
  },
  {
    type: "power unit",
    model: "Ojai Multi Power Supply",
    wdh: [103, 89, 38],
    image: null,
  },
  {
    type: "power unit",
    model: "Zuma",
    wdh: [103, 89, 38],
    image: "strymon-zuma.png",
  },
  {
    type: "pedal",
    model: "BigSky MX",
    wdh: [170, 127, 44],
    image: "strymon-BigSkyMX_Site_StoreImage-768x768.png",
  },
  {
    type: "pedal",
    model: "BigSky",
    wdh: [170, 127, 44],
    image: "strymon-bigsky_topdown_grad2_1600-1024x1024-1-768x768.png",
  },
  {
    type: "pedal",
    model: "BlueSky v2",
    wdh: [114, 103, 44],
    image: "strymon-blueSkyv2_StoreImage_NoBorder-768x768.png",
  },
  {
    type: "pedal",
    model: "Brig",
    wdh: [114, 103, 44],
    image: "strymon-Brig_StoreImage-768x768.png",
  },
  {
    type: "pedal",
    model: "Cloudburst",
    wdh: [114, 103, 44],
    image: "strymon-Cloudburst_StoreImage_NoBorder-768x768.png",
  },
  {
    type: "pedal",
    model: "Compadre",
    wdh: [114, 103, 44],
    image: "strymon-compadre_topdown_grad2_1600-768x768.png",
  },
  {
    type: "pedal",
    model: "Deco v2",
    wdh: [114, 103, 44],
    image: "strymon-Deco_v2-StoreImage_NoBorder-768x768.png",
  },
  {
    type: "pedal",
    model: "DIG v2",
    wdh: [114, 103, 44],
    image: "strymon-DIGv2_StoreImage_NoBorder-768x768.png",
  },
  {
    type: "pedal",
    model: "EC-1",
    wdh: [114, 103, 44],
    image: "strymon-EC1_StoreImage-768x768.png",
  },
  {
    type: "pedal",
    model: "El Capistan v2",
    wdh: [114, 103, 44],
    image: "strymon-ElCapistanv2_StoreImage_NoBorder-768x768.png",
  },
  {
    type: "pedal",
    model: "Fairfax",
    wdh: [114, 103, 44],
    image: "strymon-Fairfax_StoreImage-768x768.png",
  },
  {
    type: "pedal",
    model: "Flint v2",
    wdh: [114, 103, 44],
    image: "strymon-Flintv2_StoreImage_NoBorder-768x768.png",
  },
  {
    type: "pedal",
    model: "Iridium",
    wdh: [114, 103, 44],
    image: "strymon-iridium_topdown_grad2_1600-768x768.png",
  },
  {
    type: "pedal",
    model: "Lex v2",
    wdh: [114, 103, 44],
    image: "strymon-Lexv2_StoreImage_NoBorder-768x768.png",
  },
  {
    type: "controller",
    model: "Mini Switch",
    wdh: [114, 103, 44],
    image: "strymon-miniswitch_topdown_grad_1600-768x768.png",
  },
  {
    type: "pedal",
    model: "Mobius",
    wdh: [170, 127, 44],
    image: "strymon-mobius_topdown_grad_1600-768x768.png",
  },
  {
    type: "controller",
    model: "MultiSwitch Plus",
    wdh: [170, 127, 44],
    image: "strymon-multiswitchplus_topdown_grad_1600-768x768.png",
  },
  {
    type: "pedal",
    model: "NightSky",
    wdh: [114, 103, 44],
    image: "strymon-nightsky_topdown_grad_1600-768x768.png",
  },
  {
    type: "pedal",
    model: "Oliver",
    wdh: [114, 103, 44],
    image: "strymon-Olivera_Site_StoreImage-768x768.png",
  },
  {
    type: "pedal",
    model: "Riverside",
    wdh: [114, 103, 44],
    image: "strymon-riverside_topdown_grad_1600-768x768.png",
  },
  {
    type: "pedal",
    model: "Sunset",
    wdh: [114, 103, 44],
    image: "strymon-sunset_topdown_grad_1600-768x768.png",
  },
  {
    type: "pedal",
    model: "Timeline",
    wdh: [170, 127, 44],
    image: "strymon-timeline_topdown_grad_1600-768x768.png",
  },
  {
    type: "pedal",
    model: "Ultraviolet",
    wdh: [114, 103, 44],
    image: "strymon-Ultraviolet_StoreImage-768x768.png",
  },
  {
    type: "pedal",
    model: "Volante",
    wdh: [114, 103, 44],
    image: "strymon-volante_topdown_grad2_1600-768x768.png",
  },
  {
    type: "pedal",
    model: "Zelzah",
    wdh: [114, 103, 44],
    image: "strymon-Zelzah_Store-768x768.png",
  },
];

export const STRYMON_DEVICE_TEMPLATES: DeviceTemplate[] = strymonDevices.map(
  (d) => ({
    ...d,
    name: `Strymon ${d.model}`,
    id: deviceId("strymon", d.model),
    brand: "Strymon",
    image: d.image ? "strymon/" + d.image : null,
  })
);
