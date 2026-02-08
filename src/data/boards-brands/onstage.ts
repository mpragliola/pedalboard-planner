import type { Wdh } from '../../wdh'
import type { BoardTemplate } from '../boards'

/** 18"×12" style, 76 mm height (e.g. Gator PS, Holeyboard 123). */
const WDH_BOARD_457_305_76: Wdh = [457, 305, 76]
/** 24"×15" style, 76 mm height. */
const WDH_BOARD_610_381_76: Wdh = [610, 381, 76]

export const ONSTAGE_BOARD_TEMPLATES: BoardTemplate[] = [
  { id: 'board-onstage-gpb2000', type: 'classic', brand: 'On-Stage', model: 'GPB2000', name: 'On-Stage GPB2000', wdh: WDH_BOARD_457_305_76, image: null },
  { id: 'board-onstage-gpb3000', type: 'classic', brand: 'On-Stage', model: 'GPB3000', name: 'On-Stage GPB3000', wdh: WDH_BOARD_610_381_76, image: null },
]
