import { WDH_BOSS_COMPACT, WDH_MOOER_MICRO } from '../../wdh'
import type { DeviceTemplate } from '../devices'

export const MOOER_DEVICE_TEMPLATES: DeviceTemplate[] = [
  { id: 'device-mooer-micro', type: 'pedal', brand: 'Mooer', model: 'Micro Pedal', name: 'Mooer Micro Pedal', wdh: WDH_MOOER_MICRO, image: null },
  { id: 'device-mooer-mini', type: 'pedal', brand: 'Mooer', model: 'Mini Pedal', name: 'Mooer Mini Pedal', wdh: [47, 108, 52], image: null },
  { id: 'device-mooer-macro-s8', type: 'power unit', brand: 'Mooer', model: 'Macro Power S8', name: 'Mooer Macro Power S8', wdh: [210, 110, 40], image: null },
  { id: 'device-mooer-ge200', type: 'multifx', brand: 'Mooer', model: 'GE200', name: 'Mooer GE200', wdh: [331, 174, 45], image: null },
  { id: 'device-mooer-ge250', type: 'multifx', brand: 'Mooer', model: 'GE250', name: 'Mooer GE250', wdh: [324, 170, 46], image: 'mooer/ge-250.png' },
  { id: 'device-mooer-ge100', type: 'multifx', brand: 'Mooer', model: 'GE100', name: 'Mooer GE100', wdh: [310, 165, 45], image: 'mooer/ge-100.png' },
  { id: 'device-mooer-ge1000', type: 'multifx', brand: 'Mooer', model: 'GE1000', name: 'Mooer GE1000', wdh: [400, 220, 55], image: 'mooer/ge1000.png' },
  { id: 'device-mooer-ge150plusli', type: 'multifx', brand: 'Mooer', model: 'GE150 Plus Li', name: 'Mooer GE150 Plus Li', wdh: [320, 170, 46], image: 'mooer/ge150plusli.png' },
  { id: 'device-mooer-ge200plus', type: 'multifx', brand: 'Mooer', model: 'GE200 Plus', name: 'Mooer GE200 Plus', wdh: [331, 174, 45], image: 'mooer/ge200plus.png' },
  { id: 'device-mooer-expline', type: 'pedal', brand: 'Mooer', model: 'Expline', name: 'Mooer Expline', wdh: WDH_MOOER_MICRO, image: 'mooer/expline.png' },
  { id: 'device-mooer-gl100', type: 'pedal', brand: 'Mooer', model: 'GL100', name: 'Mooer GL100', wdh: WDH_MOOER_MICRO, image: 'mooer/gl100.png' },
  { id: 'device-mooer-gl200', type: 'pedal', brand: 'Mooer', model: 'GL200', name: 'Mooer GL200', wdh: WDH_MOOER_MICRO, image: 'mooer/gl200.png' },
  { id: 'device-mooer-harmony-v2', type: 'pedal', brand: 'Mooer', model: 'Harmony V2', name: 'Mooer Harmony V2', wdh: WDH_BOSS_COMPACT, image: 'mooer/harmony-v2.png' },
  { id: 'device-mooer-mvp1-autuner', type: 'pedal', brand: 'Mooer', model: 'MVP1 Autuner', name: 'Mooer MVP1 Autuner', wdh: WDH_MOOER_MICRO, image: 'mooer/mvp1-autuner.png' },
  { id: 'device-mooer-mvp2-harmonier', type: 'pedal', brand: 'Mooer', model: 'MVP2 Harmonier', name: 'Mooer MVP2 Harmonier', wdh: WDH_MOOER_MICRO, image: 'mooer/mvp2-harmonier.png' },
  { id: 'device-mooer-mvp3-loopation', type: 'pedal', brand: 'Mooer', model: 'MVP3 Loopation', name: 'Mooer MVP3 Loopation', wdh: WDH_MOOER_MICRO, image: 'mooer/mvp3-loopation.png' },
  { id: 'device-mooer-ocean-machine-ii', type: 'pedal', brand: 'Mooer', model: 'Ocean Machine II', name: 'Mooer Ocean Machine II', wdh: [235, 120, 55], image: 'mooer/ocean-machine-ii.png' },
  { id: 'device-mooer-tender-octaver-x2', type: 'pedal', brand: 'Mooer', model: 'Tender Octaver X2', name: 'Mooer Tender Octaver X2', wdh: WDH_BOSS_COMPACT, image: 'mooer/tender-octaver-x2.png' },
]
