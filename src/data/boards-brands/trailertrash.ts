import type { Wdh } from '../../wdh'
import type { BoardTemplate } from '../boards'

/** 18"×12" style, 76 mm height (e.g. Gator PS, Holeyboard 123). */
const WDH_BOARD_457_305_76: Wdh = [457, 305, 76]
/** 24"×15" style, 76 mm height. */
const WDH_BOARD_610_381_76: Wdh = [610, 381, 76]
/** 32"×16" style, 76 mm height. */
const WDH_BOARD_813_406_76: Wdh = [813, 406, 76]

export const TRAILERTRASH_BOARD_TEMPLATES: BoardTemplate[] = [
  { id: 'board-trailertrash-classic-18', type: 'classic', brand: 'Trailer Trash', model: 'Classic 18', name: 'Trailer Trash Classic 18', wdh: WDH_BOARD_457_305_76, image: null },
  { id: 'board-trailertrash-pro-24', type: 'classic', brand: 'Trailer Trash', model: 'Pro 24', name: 'Trailer Trash Pro 24', wdh: WDH_BOARD_610_381_76, image: null },
  { id: 'board-trailertrash-pro-32', type: 'classic', brand: 'Trailer Trash', model: 'Pro 32', name: 'Trailer Trash Pro 32', wdh: WDH_BOARD_813_406_76, image: null },
]
