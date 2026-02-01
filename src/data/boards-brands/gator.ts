import { WDH_BOARD_457_305_76 } from '../../wdh'
import type { BoardTemplate } from '../boards'

export const GATOR_BOARD_TEMPLATES: BoardTemplate[] = [
  { id: 'board-gator-nano', type: 'classic', brand: 'Gator', model: 'GPB-NANO', name: 'Gator GPB-NANO', wdh: [380, 140, 35], image: null },
  { id: 'board-gator-ps', type: 'classic', brand: 'Gator', model: 'GPB-PS', name: 'Gator GPB-PS', wdh: WDH_BOARD_457_305_76, image: null },
  { id: 'board-gator-xl', type: 'classic', brand: 'Gator', model: 'GPB-XL', name: 'Gator GPB-XL', wdh: [762, 457, 76], image: null },
]
