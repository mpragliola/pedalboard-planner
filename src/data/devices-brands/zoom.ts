import { WDH_BOSS_GT1, WDH_ZOOM_AC, WDH_ZOOM_MS } from '../../wdh'
import type { DeviceTemplate } from '../devices'

export const ZOOM_DEVICE_TEMPLATES: DeviceTemplate[] = [
  { id: 'device-zoom-g3xn', type: 'multifx', brand: 'Zoom', model: 'G3Xn', name: 'Zoom G3Xn', wdh: [318, 181, 57], image: null },
  { id: 'device-zoom-g5n', type: 'multifx', brand: 'Zoom', model: 'G5n', name: 'Zoom G5n', wdh: [423, 196, 73], image: null },
  { id: 'device-zoom-g11', type: 'multifx', brand: 'Zoom', model: 'G11', name: 'Zoom G11', wdh: [338, 180, 77], image: 'zoom/g11.png' },
  { id: 'device-zoom-a1xfour', type: 'multifx', brand: 'Zoom', model: 'A1X Four', name: 'Zoom A1X Four', wdh: WDH_BOSS_GT1, image: 'zoom/a1xfour.png' },
  { id: 'device-zoom-ac2', type: 'multifx', brand: 'Zoom', model: 'AC-2', name: 'Zoom AC-2', wdh: WDH_ZOOM_AC, image: 'zoom/ac2.png' },
  { id: 'device-zoom-ac3', type: 'multifx', brand: 'Zoom', model: 'AC-3', name: 'Zoom AC-3', wdh: WDH_ZOOM_AC, image: 'zoom/ac3.png' },
  { id: 'device-zoom-b2four', type: 'multifx', brand: 'Zoom', model: 'B2 Four', name: 'Zoom B2 Four', wdh: WDH_BOSS_GT1, image: 'zoom/b2four.png' },
  { id: 'device-zoom-b6', type: 'multifx', brand: 'Zoom', model: 'B6', name: 'Zoom B6', wdh: [338, 180, 77], image: 'zoom/b6.png' },
  { id: 'device-zoom-g1four', type: 'multifx', brand: 'Zoom', model: 'G1 Four', name: 'Zoom G1 Four', wdh: WDH_BOSS_GT1, image: 'zoom/g1four.png' },
  { id: 'device-zoom-g6', type: 'multifx', brand: 'Zoom', model: 'G6', name: 'Zoom G6', wdh: [338, 180, 77], image: 'zoom/g6.png' },
  { id: 'device-zoom-m50gplus', type: 'pedal', brand: 'Zoom', model: 'MS-50G+', name: 'Zoom MS-50G+', wdh: WDH_ZOOM_MS, image: 'zoom/m50gplus.png' },
  { id: 'device-zoom-ms200dplus', type: 'pedal', brand: 'Zoom', model: 'MS-200D+', name: 'Zoom MS-200D+', wdh: WDH_ZOOM_MS, image: 'zoom/ms-200dplus.png' },
  { id: 'device-zoom-ms60bplus', type: 'pedal', brand: 'Zoom', model: 'MS-60B+', name: 'Zoom MS-60B+', wdh: WDH_ZOOM_MS, image: 'zoom/ms-60bplus.png' },
  { id: 'device-zoom-ms70cdrplus', type: 'pedal', brand: 'Zoom', model: 'MS-70CDR+', name: 'Zoom MS-70CDR+', wdh: WDH_ZOOM_MS, image: 'zoom/ms-70cdrplus.png' },
  { id: 'device-zoom-ms80irplus', type: 'pedal', brand: 'Zoom', model: 'MS-80IR+', name: 'Zoom MS-80IR+', wdh: WDH_ZOOM_MS, image: 'zoom/ms-80irplus.png' },
  { id: 'device-zoom-ms90lpplus', type: 'pedal', brand: 'Zoom', model: 'MS-90LP+', name: 'Zoom MS-90LP+', wdh: WDH_ZOOM_MS, image: 'zoom/ms-90lpplus.png' },
]
