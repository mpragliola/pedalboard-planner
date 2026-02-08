import type { Wdh } from '../../wdh'
import type { BoardTemplate } from '../boards'

/** 18"×12" style, 76 mm height (e.g. Gator PS, Holeyboard 123). */
const WDH_BOARD_457_305_76: Wdh = [457, 305, 76]

export const GATOR_BOARD_TEMPLATES: BoardTemplate[] = [
  { id: 'board-gator-nano', type: 'classic', brand: 'Gator', model: 'GPB-NANO', name: 'Gator GPB-NANO', wdh: [380, 140, 35], image: null },
  { id: 'board-gator-ps', type: 'classic', brand: 'Gator', model: 'GPB-PS', name: 'Gator GPB-PS', wdh: WDH_BOARD_457_305_76, image: null },
  { id: 'board-gator-xl', type: 'classic', brand: 'Gator', model: 'GPB-XL', name: 'Gator GPB-XL', wdh: [762, 457, 76], image: null },
]
