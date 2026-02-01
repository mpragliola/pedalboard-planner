import { WDH_BOARD_457_305_76, WDH_BOARD_610_381_76, WDH_BOARD_813_406_76 } from '../../wdh'
import type { BoardTemplate } from '../boards'

export const NYC_BOARD_TEMPLATES: BoardTemplate[] = [
  { id: 'board-nyc-small', type: 'classic', brand: 'NYC Pedalboards', model: 'Small', name: 'NYC Pedalboards Small', wdh: WDH_BOARD_457_305_76, image: null },
  { id: 'board-nyc-medium', type: 'classic', brand: 'NYC Pedalboards', model: 'Medium', name: 'NYC Pedalboards Medium', wdh: WDH_BOARD_610_381_76, image: null },
  { id: 'board-nyc-large', type: 'classic', brand: 'NYC Pedalboards', model: 'Large', name: 'NYC Pedalboards Large', wdh: WDH_BOARD_813_406_76, image: null },
]
