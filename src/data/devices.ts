import { type Wdh, WDH_MXR_BASS } from "../wdh";
import { ATOMIC_DEVICE_TEMPLATES } from "./devices-brands/atomic";
import { BOSS_DEVICE_TEMPLATES } from "./devices-brands/boss";
import { DUNLOP_DEVICE_TEMPLATES } from "./devices-brands/dunlop";
import { HOTONE_DEVICE_TEMPLATES } from "./devices-brands/hotone";
import { MOOER_DEVICE_TEMPLATES } from "./devices-brands/mooer";
import { MXR_DEVICE_TEMPLATES } from "./devices-brands/mxr";
import { STRYMON_DEVICE_TEMPLATES } from "./devices-brands/strymon";
import { VALETON_DEVICE_TEMPLATES } from "./devices-brands/valeton";
import { NUX_DEVICE_TEMPLATES } from "./devices-brands/nux";
import { ZOOM_DEVICE_TEMPLATES } from "./devices-brands/zoom";
import { EVENTIDE_DEVICE_TEMPLATES } from "./devices-brands/eventide";
import { EHX_DEVICE_TEMPLATES } from "./devices-brands/ehx";
import { JOYO_DEVICE_TEMPLATES } from "./devices-brands/joyo";
import { CIOKS_DEVICE_TEMPLATES } from "./devices-brands/cioks";
import { LINE6_DEVICE_TEMPLATES } from "./devices-brands/line6";
import { FRACTAL_DEVICE_TEMPLATES } from "./devices-brands/fractal";
import { KEMPER_DEVICE_TEMPLATES } from "./devices-brands/kemper";
import { NEURAL_DEVICE_TEMPLATES } from "./devices-brands/neural";
import { HEADRUSH_DEVICE_TEMPLATES } from "./devices-brands/headrush";
import { HARLEY_BENTON_DEVICE_TEMPLATES } from "./devices-brands/harley-benton";
import { HUGHES_KETTNER_DEVICE_TEMPLATES } from "./devices-brands/hughes-kettner";
import { MIPRO_DEVICE_TEMPLATES } from "./devices-brands/mipro";
import { SENNHEISER_DEVICE_TEMPLATES } from "./devices-brands/sennheiser";
import { SHURE_DEVICE_TEMPLATES } from "./devices-brands/shure";
import { MORNINGSTAR_DEVICE_TEMPLATES } from "./devices-brands/morningstar";
import { MVAVE_DEVICE_TEMPLATES } from "./devices-brands/mvave";
import { SONICAKE_DEVICE_TEMPLATES } from "./devices-brands/sonicake";

export type DeviceType = "power" | "controller" | "pedal" | "multifx" | "wireless";

export interface DeviceTemplate {
  id: string;
  type: DeviceType;
  brand: string;
  model: string;
  name: string;
  /** [width, depth, height] in mm. */
  wdh: Wdh;
  /** Omitted when template has an image. */
  color?: string;
  image: string | null;
}

/** Dimensions are in mm. */
export const DEVICE_TEMPLATES: DeviceTemplate[] = [
  ...BOSS_DEVICE_TEMPLATES,
  ...DUNLOP_DEVICE_TEMPLATES,
  ...MXR_DEVICE_TEMPLATES,
  ...MOOER_DEVICE_TEMPLATES,
  ...STRYMON_DEVICE_TEMPLATES,
  ...HOTONE_DEVICE_TEMPLATES,
  ...VALETON_DEVICE_TEMPLATES,
  ...ATOMIC_DEVICE_TEMPLATES,
  ...NUX_DEVICE_TEMPLATES,
  ...ZOOM_DEVICE_TEMPLATES,
  ...EVENTIDE_DEVICE_TEMPLATES,
  ...EHX_DEVICE_TEMPLATES,
  ...JOYO_DEVICE_TEMPLATES,
  ...CIOKS_DEVICE_TEMPLATES,
  ...LINE6_DEVICE_TEMPLATES,
  ...FRACTAL_DEVICE_TEMPLATES,
  ...KEMPER_DEVICE_TEMPLATES,
  ...NEURAL_DEVICE_TEMPLATES,
  ...HEADRUSH_DEVICE_TEMPLATES,
  ...HARLEY_BENTON_DEVICE_TEMPLATES,
  ...HUGHES_KETTNER_DEVICE_TEMPLATES,
  ...MIPRO_DEVICE_TEMPLATES,
  ...SENNHEISER_DEVICE_TEMPLATES,
  ...SHURE_DEVICE_TEMPLATES,
  ...MORNINGSTAR_DEVICE_TEMPLATES,
  ...MVAVE_DEVICE_TEMPLATES,
  ...SONICAKE_DEVICE_TEMPLATES,

  // Single / standard pedals
  {
    id: "device-ts808",
    type: "pedal",
    brand: "Ibanez",
    model: "TS808",
    name: "TS808",
    wdh: [70, 125, 52],
    image: "ibanez/ts808.png",
  },
  // EVH
  {
    id: "device-evh-mhg",
    type: "pedal",
    brand: "EVH",
    model: "EVH 5150 Overdrive",
    name: "EVH 5150 Overdrive",
    wdh: WDH_MXR_BASS,
    image: "evh/EVHMHG.MAIN__65502.png",
  },
  // AMT
  {
    id: "device-amt-ex50",
    type: "pedal",
    brand: "AMT",
    model: "EX-50 Expression Pedal",
    name: "AMT EX-50 Expression Pedal",
    wdh: [62, 110, 58],
    image: "amt/amt-ex-50.png",
  },
  // Mission Engineering
  {
    id: "device-mission-sp1",
    type: "pedal",
    brand: "Mission Engineering",
    model: "SP-1 Expression Pedal",
    name: "Mission Engineering SP-1 Expression Pedal",
    wdh: [99, 251, 76],
    image: "mission/mission--sp1-nd-gy.png",
  },
  {
    id: "device-ibanez-tubescreamer",
    type: "pedal",
    brand: "Ibanez",
    model: "Tube Screamer",
    name: "Ibanez Tube Screamer",
    wdh: [70, 124, 53],
    image: "ibanez/ts808.png",
  },
  {
    id: "device-tc-compact",
    type: "pedal",
    brand: "TC Electronic",
    model: "Compact Pedal",
    name: "TC Electronic Compact Pedal",
    wdh: [74, 122, 50],
    image: null,
  },
  {
    id: "device-tc-flashback-x4",
    type: "pedal",
    brand: "TC Electronic",
    model: "Flashback X4",
    name: "TC Electronic Flashback X4",
    wdh: [235, 145, 57],
    image: null,
  },
  {
    id: "device-eqd-standard",
    type: "pedal",
    brand: "EarthQuaker Devices",
    model: "Standard",
    name: "EarthQuaker Devices Standard",
    wdh: [64, 117, 57],
    image: null,
  },
  {
    id: "device-jhs-standard",
    type: "pedal",
    brand: "JHS",
    model: "Standard",
    name: "JHS Standard",
    wdh: [66, 121, 56],
    image: null,
  },
  {
    id: "device-walrus-standard",
    type: "pedal",
    brand: "Walrus Audio",
    model: "Standard",
    name: "Walrus Audio Standard",
    wdh: [67, 122, 57],
    image: null,
  },
  {
    id: "device-chasebliss-standard",
    type: "pedal",
    brand: "Chase Bliss",
    model: "Standard",
    name: "Chase Bliss Standard",
    wdh: [60, 125, 60],
    image: null,
  },
  // Single / compact pedals
  {
    id: "device-tc-mini",
    type: "pedal",
    brand: "TC Electronic",
    model: "Mini Pedal",
    name: "TC Electronic Mini Pedal",
    wdh: [48, 93, 50],
    image: null,
  },
  {
    id: "device-wampler-standard",
    type: "pedal",
    brand: "Wampler",
    model: "Standard",
    name: "Wampler Standard",
    wdh: [64, 118, 57],
    image: null,
  },
  {
    id: "device-keeley-standard",
    type: "pedal",
    brand: "Keeley",
    model: "Standard",
    name: "Keeley Standard",
    wdh: [66, 121, 56],
    image: null,
  },
  {
    id: "device-darkglass-microtubes",
    type: "pedal",
    brand: "Darkglass",
    model: "Microtubes Pedal",
    name: "Darkglass Microtubes Pedal",
    wdh: [120, 95, 57],
    image: null,
  },
  {
    id: "device-digitech-whammy-dt",
    type: "pedal",
    brand: "DigiTech",
    model: "Whammy DT",
    name: "DigiTech Whammy DT",
    wdh: [170, 196, 61],
    image: null,
  },
  // Power supply units
  {
    id: "device-voodoolab-pp2plus",
    type: "power",
    brand: "Voodoo Lab",
    model: "Pedal Power 2 Plus",
    name: "Voodoo Lab Pedal Power 2 Plus",
    wdh: [152, 86, 45],
    image: null,
  },
  {
    id: "device-truetone-cs12",
    type: "power",
    brand: "Truetone",
    model: "1 SPOT Pro CS12",
    name: "Truetone 1 SPOT Pro CS12 Power Supply",
    wdh: [206, 86, 50],
    image: null,
  },
  {
    id: "device-mono-powersupply-medium",
    type: "power",
    brand: "Mono",
    model: "Power Supply Medium",
    name: "Mono Power Supply Medium",
    wdh: [100, 80, 30],
    image: null,
  },
  {
    id: "device-voodoolab-iso5",
    type: "power",
    brand: "Voodoo Lab",
    model: "Pedal Power Iso 5",
    name: "Voodoo Lab Pedal Power Iso 5",
    wdh: [110, 80, 35],
    image: null,
  },
  {
    id: "device-palmer-pwt06",
    type: "power",
    brand: "Palmer",
    model: "PWT 06 IEC",
    name: "Palmer PWT 06 IEC",
    wdh: [130, 90, 40],
    image: null,
  },
  {
    id: "device-palmer-pwt04",
    type: "power",
    brand: "Palmer",
    model: "PWT 04 / Universal Pedalboard Power Supply",
    name: "Palmer PWT 04 Universal Pedalboard Power Supply",
    wdh: [100, 70, 35],
    image: null,
  },
  {
    id: "device-tonecity-tps06",
    type: "power",
    brand: "Tone City",
    model: "TPS-06 Multi Power Supply",
    name: "Tone City TPS-06 Multi Power Supply",
    wdh: [150, 80, 35],
    image: null,
  },
  // More multieffect units
  {
    id: "device-donner-arena-2000",
    type: "multifx",
    brand: "Donner",
    model: "Arena 2000",
    name: "Donner Arena 2000",
    wdh: [330, 190, 60],
    image: null,
  },
  {
    id: "device-ik-tonex-pedal",
    type: "multifx",
    brand: "IK Multimedia",
    model: "Tonex Pedal",
    name: "IK Multimedia Tonex Pedal",
    wdh: [176, 142, 58],
    image: null,
  },
];
