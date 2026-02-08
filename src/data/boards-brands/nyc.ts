import type { Wdh } from '../../wdh'
import type { BoardTemplate } from '../boards'

/** 18"×12" style, 76 mm height (e.g. Gator PS, Holeyboard 123). */
const WDH_BOARD_457_305_76: Wdh = [457, 305, 76]
/** 24"×15" style, 76 mm height. */
const WDH_BOARD_610_381_76: Wdh = [610, 381, 76]
/** 32"×16" style, 76 mm height. */
const WDH_BOARD_813_406_76: Wdh = [813, 406, 76]

export const NYC_BOARD_TEMPLATES: BoardTemplate[] = [
  { id: 'board-nyc-small', type: 'classic', brand: 'NYC Pedalboards', model: 'Small', name: 'NYC Pedalboards Small', wdh: WDH_BOARD_457_305_76, image: null },
  { id: 'board-nyc-medium', type: 'classic', brand: 'NYC Pedalboards', model: 'Medium', name: 'NYC Pedalboards Medium', wdh: WDH_BOARD_610_381_76, image: null },
  { id: 'board-nyc-large', type: 'classic', brand: 'NYC Pedalboards', model: 'Large', name: 'NYC Pedalboards Large', wdh: WDH_BOARD_813_406_76, image: null },
]
