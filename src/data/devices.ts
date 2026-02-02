import { type Wdh, WDH_MXR_BASS } from '../wdh'
import { ATOMIC_DEVICE_TEMPLATES } from './devices-brands/atomic'
import { BOSS_DEVICE_TEMPLATES } from './devices-brands/boss'
import { DUNLOP_DEVICE_TEMPLATES } from './devices-brands/dunlop'
import { HOTONE_DEVICE_TEMPLATES } from './devices-brands/hotone'
import { MOOER_DEVICE_TEMPLATES } from './devices-brands/mooer'
import { MXR_DEVICE_TEMPLATES } from './devices-brands/mxr'
import { STRYMON_DEVICE_TEMPLATES } from './devices-brands/strymon'
import { VALETON_DEVICE_TEMPLATES } from './devices-brands/valeton'
import { NUX_DEVICE_TEMPLATES } from './devices-brands/nux'
import { ZOOM_DEVICE_TEMPLATES } from './devices-brands/zoom'

export type DeviceType = 'power unit' | 'controller' | 'pedal' | 'multifx'

export interface DeviceTemplate {
  id: string
  type: DeviceType
  brand: string
  model: string
  name: string
  /** [width, depth, height] in mm. */
  wdh: Wdh
  /** Omitted when template has an image. */
  color?: string
  image: string | null
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

  // Single / standard pedals
  { id: 'device-ts808', type: 'pedal', brand: 'Ibanez', model: 'TS808', name: 'TS808', wdh: [70, 125, 52], image: 'ibanez/ts808.png' },
  { id: 'device-ehx-nano', type: 'pedal', brand: 'Electro-Harmonix', model: 'Nano Pedal', name: 'Electro-Harmonix Nano Pedal', wdh: [70, 114, 54], image: null },
  { id: 'device-ehx-xo', type: 'pedal', brand: 'Electro-Harmonix', model: 'XO Pedal', name: 'Electro-Harmonix XO Pedal', wdh: [91, 118, 57], image: null },
  // EVH
  { id: 'device-evh-mhg', type: 'pedal', brand: 'EVH', model: 'EVH 5150 Overdrive', name: 'EVH 5150 Overdrive', wdh: WDH_MXR_BASS, image: 'evh/EVHMHG.MAIN__65502.png' },
  // AMT
  { id: 'device-amt-ex50', type: 'pedal', brand: 'AMT', model: 'EX-50 Expression Pedal', name: 'AMT EX-50 Expression Pedal', wdh: [62, 110, 58], image: 'amt/amt-ex-50.png' },
  // Mission Engineering
  { id: 'device-mission-sp1', type: 'pedal', brand: 'Mission Engineering', model: 'SP-1 Expression Pedal', name: 'Mission Engineering SP-1 Expression Pedal', wdh: [99, 251, 76], image: 'mission/mission--sp1-nd-gy.png' },
  { id: 'device-ibanez-tubescreamer', type: 'pedal', brand: 'Ibanez', model: 'Tube Screamer', name: 'Ibanez Tube Screamer', wdh: [70, 124, 53], image: 'ibanez/ts808.png' },
  { id: 'device-tc-compact', type: 'pedal', brand: 'TC Electronic', model: 'Compact Pedal', name: 'TC Electronic Compact Pedal', wdh: [74, 122, 50], image: null },
  { id: 'device-tc-flashback-x4', type: 'pedal', brand: 'TC Electronic', model: 'Flashback X4', name: 'TC Electronic Flashback X4', wdh: [235, 145, 57], image: null },
  { id: 'device-eqd-standard', type: 'pedal', brand: 'EarthQuaker Devices', model: 'Standard', name: 'EarthQuaker Devices Standard', wdh: [64, 117, 57], image: null },
  { id: 'device-jhs-standard', type: 'pedal', brand: 'JHS', model: 'Standard', name: 'JHS Standard', wdh: [66, 121, 56], image: null },
  { id: 'device-walrus-standard', type: 'pedal', brand: 'Walrus Audio', model: 'Standard', name: 'Walrus Audio Standard', wdh: [67, 122, 57], image: null },
  { id: 'device-chasebliss-standard', type: 'pedal', brand: 'Chase Bliss', model: 'Standard', name: 'Chase Bliss Standard', wdh: [60, 125, 60], image: null },
  // Single / compact pedals
  { id: 'device-tc-mini', type: 'pedal', brand: 'TC Electronic', model: 'Mini Pedal', name: 'TC Electronic Mini Pedal', wdh: [48, 93, 50], image: null },
  { id: 'device-joyo-ironman-mini', type: 'pedal', brand: 'Joyo', model: 'Ironman Mini', name: 'Joyo Ironman Mini', wdh: [50, 75, 45], image: null },
  { id: 'device-joyo-standard', type: 'pedal', brand: 'Joyo', model: 'Standard Pedal', name: 'Joyo Standard Pedal', wdh: [70, 120, 50], image: null },
  { id: 'device-wampler-standard', type: 'pedal', brand: 'Wampler', model: 'Standard', name: 'Wampler Standard', wdh: [64, 118, 57], image: null },
  { id: 'device-keeley-standard', type: 'pedal', brand: 'Keeley', model: 'Standard', name: 'Keeley Standard', wdh: [66, 121, 56], image: null },
  { id: 'device-darkglass-microtubes', type: 'pedal', brand: 'Darkglass', model: 'Microtubes Pedal', name: 'Darkglass Microtubes Pedal', wdh: [120, 95, 57], image: null },
  { id: 'device-eventide-h9', type: 'pedal', brand: 'Eventide', model: 'H9 / H90', name: 'Eventide H9 / H90', wdh: [140, 114, 58], image: null },
  { id: 'device-eventide-factor', type: 'pedal', brand: 'Eventide', model: 'Factor Series', name: 'Eventide Factor Series', wdh: [196, 122, 58], image: null },
  { id: 'device-line6-dl4-mkii', type: 'pedal', brand: 'Line 6', model: 'DL4 MkII', name: 'Line 6 DL4 MkII', wdh: [300, 190, 64], image: null },
  { id: 'device-digitech-whammy-dt', type: 'pedal', brand: 'DigiTech', model: 'Whammy DT', name: 'DigiTech Whammy DT', wdh: [170, 196, 61], image: null },
  { id: 'device-ehx-pico', type: 'pedal', brand: 'Electro-Harmonix', model: 'Pico Pedal', name: 'Electro-Harmonix Pico Pedal', wdh: [50, 90, 50], image: null },
  { id: 'device-ehx-memoryman-deluxe', type: 'pedal', brand: 'Electro-Harmonix', model: 'Memory Man Deluxe', name: 'Electro-Harmonix Memory Man Deluxe', wdh: [146, 121, 64], image: null },
  // Power supply units
  { id: 'device-cioks-dc7', type: 'power unit', brand: 'Cioks', model: 'DC7', name: 'Cioks DC7', wdh: [160, 87, 26], image: 'cioks/cioks-dc7.png' },
  { id: 'device-cioks-dc10', type: 'power unit', brand: 'Cioks', model: 'DC10', name: 'Cioks DC10', wdh: [160, 87, 26], image: 'cioks/cioks-dc10.png' },
  { id: 'device-cioks-4', type: 'power unit', brand: 'Cioks', model: '4', name: 'Cioks 4', wdh: [120, 70, 26], image: 'cioks/cioks-4.png' },
  { id: 'device-cioks-8', type: 'power unit', brand: 'Cioks', model: '8', name: 'Cioks 8', wdh: [160, 87, 26], image: 'cioks/cioks-8.png' },
  { id: 'device-cioks-sol', type: 'power unit', brand: 'Cioks', model: 'Sol', name: 'Cioks Sol', wdh: [103, 89, 38], image: 'cioks/cioks-sol.png' },
  { id: 'device-cioks-ac10', type: 'power unit', brand: 'Cioks', model: 'AC10', name: 'Cioks AC10', wdh: [160, 87, 26], image: 'cioks/cioks-ac10.png' },
  { id: 'device-cioks-ciokolate', type: 'power unit', brand: 'Cioks', model: 'Ciokolate', name: 'Cioks Ciokolate', wdh: [160, 87, 26], image: 'cioks/cioks-ciokolate.png' },
  { id: 'device-cioks-crux', type: 'power unit', brand: 'Cioks', model: 'Crux', name: 'Cioks Crux', wdh: [103, 89, 38], image: 'cioks/cioks-crux.png' },
  { id: 'device-voodoolab-pp2plus', type: 'power unit', brand: 'Voodoo Lab', model: 'Pedal Power 2 Plus', name: 'Voodoo Lab Pedal Power 2 Plus', wdh: [152, 86, 45], image: null },
  { id: 'device-truetone-cs12', type: 'power unit', brand: 'Truetone', model: '1 SPOT Pro CS12', name: 'Truetone 1 SPOT Pro CS12 Power Supply', wdh: [206, 86, 50], image: null },
  { id: 'device-mono-powersupply-medium', type: 'power unit', brand: 'Mono', model: 'Power Supply Medium', name: 'Mono Power Supply Medium', wdh: [100, 80, 30], image: null },
  { id: 'device-joyo-jp05', type: 'power unit', brand: 'Joyo', model: 'JP-05 Power Bank Supply 5', name: 'Joyo JP-05 Power Bank Supply 5', wdh: [150, 85, 40], image: null },
  { id: 'device-harleybenton-iso5pro', type: 'power unit', brand: 'Harley Benton', model: 'PowerPlant ISO-5 Pro', name: 'Harley Benton PowerPlant ISO-5 Pro', wdh: [140, 90, 35], image: null },
  { id: 'device-voodoolab-iso5', type: 'power unit', brand: 'Voodoo Lab', model: 'Pedal Power Iso 5', name: 'Voodoo Lab Pedal Power Iso 5', wdh: [110, 80, 35], image: null },
  { id: 'device-palmer-pwt06', type: 'power unit', brand: 'Palmer', model: 'PWT 06 IEC', name: 'Palmer PWT 06 IEC', wdh: [130, 90, 40], image: null },
  { id: 'device-palmer-pwt04', type: 'power unit', brand: 'Palmer', model: 'PWT 04 / Universal Pedalboard Power Supply', name: 'Palmer PWT 04 Universal Pedalboard Power Supply', wdh: [100, 70, 35], image: null },
  { id: 'device-tonecity-tps06', type: 'power unit', brand: 'Tone City', model: 'TPS-06 Multi Power Supply', name: 'Tone City TPS-06 Multi Power Supply', wdh: [150, 80, 35], image: null },
  // Multieffect units
  { id: 'device-line6-helix-floor', type: 'multifx', brand: 'Line 6', model: 'Helix Floor', name: 'Line 6 Helix Floor', wdh: [560, 350, 87], image: 'line6/line6-helix-floor.png' },
  { id: 'device-line6-helix-lt', type: 'multifx', brand: 'Line 6', model: 'Helix LT', name: 'Line 6 Helix LT', wdh: [527, 301, 87], image: null },
  { id: 'device-line6-hx-stomp', type: 'multifx', brand: 'Line 6', model: 'HX Stomp', name: 'Line 6 HX Stomp', wdh: [178, 126, 66], image: 'line6/line6-hxstomp.png' },
  { id: 'device-line6-hx-stomp-xl', type: 'multifx', brand: 'Line 6', model: 'HX Stomp XL', name: 'Line 6 HX Stomp XL', wdh: [316, 126, 66], image: null },
  { id: 'device-line6-pod-go', type: 'multifx', brand: 'Line 6', model: 'POD Go', name: 'Line 6 POD Go', wdh: [359, 227, 79], image: 'line6/line6-podgo.png' },
  { id: 'device-fractal-axefx3', type: 'multifx', brand: 'Fractal Audio', model: 'Axe-Fx III', name: 'Fractal Audio Axe-Fx III', wdh: [483, 279, 89], image: null },
  { id: 'device-fractal-fm3', type: 'multifx', brand: 'Fractal Audio', model: 'FM3', name: 'Fractal Audio FM3', wdh: [297, 229, 89], image: 'fractal/fractal-fm3.png' },
  { id: 'device-fractal-fm9', type: 'multifx', brand: 'Fractal Audio', model: 'FM9', name: 'Fractal Audio FM9', wdh: [394, 279, 89], image: 'fractal/fractal-fm9.png' },
  { id: 'device-neural-quadcortex', type: 'multifx', brand: 'Neural DSP', model: 'Quad Cortex', name: 'Neural DSP Quad Cortex', wdh: [290, 190, 49], image: 'neural/quadcortex.png' },
  { id: 'device-neural-minicortex', type: 'multifx', brand: 'Neural DSP', model: 'Mini Cortex', name: 'Neural DSP Mini Cortex', wdh: [228, 118, 65], image: 'neural/minicortex.png' },
  { id: 'device-headrush-pedalboard', type: 'multifx', brand: 'Headrush', model: 'Pedalboard', name: 'Headrush Pedalboard', wdh: [667, 356, 87], image: 'headrush/headrush-pedalboard.png' },
  { id: 'device-headrush-gigboard', type: 'multifx', brand: 'Headrush', model: 'Gigboard', name: 'Headrush Gigboard', wdh: [457, 318, 76], image: null },
  { id: 'device-headrush-mx5', type: 'multifx', brand: 'Headrush', model: 'MX5', name: 'Headrush MX5', wdh: [295, 150, 65], image: null },
  // More multieffect units
  { id: 'device-kemper-profiler-stage', type: 'multifx', brand: 'Kemper', model: 'Profiler Stage', name: 'Kemper Profiler Stage', wdh: [470, 260, 85], image: null },
  { id: 'device-kemper-profiler-player', type: 'multifx', brand: 'Kemper', model: 'Profiler Player', name: 'Kemper Profiler Player', wdh: [311, 198, 68], image: null },
  { id: 'device-donner-arena-2000', type: 'multifx', brand: 'Donner', model: 'Arena 2000', name: 'Donner Arena 2000', wdh: [330, 190, 60], image: null },
  { id: 'device-ik-tonex-pedal', type: 'multifx', brand: 'IK Multimedia', model: 'Tonex Pedal', name: 'IK Multimedia Tonex Pedal', wdh: [176, 142, 58], image: null },
  { id: 'device-harleybenton-dnafx-git', type: 'multifx', brand: 'Harley Benton', model: 'DNAfx GiT', name: 'Harley Benton DNAfx GiT', wdh: [430, 250, 75], image: null },
  { id: 'device-harleybenton-dnafx-git-pro', type: 'multifx', brand: 'Harley Benton', model: 'DNAfx GiT Pro', name: 'Harley Benton DNAfx GiT Pro', wdh: [560, 350, 90], image: null },
]
