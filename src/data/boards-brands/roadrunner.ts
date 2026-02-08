import type { Wdh } from '../../wdh'
import type { BoardTemplate } from '../boards'

/** 18"×12" style, 76 mm height (e.g. Gator PS, Holeyboard 123). */
const WDH_BOARD_457_305_76: Wdh = [457, 305, 76]
/** 24"×15" style, 76 mm height. */
const WDH_BOARD_610_381_76: Wdh = [610, 381, 76]

export const ROADRUNNER_BOARD_TEMPLATES: BoardTemplate[] = [
  { id: 'board-roadrunner-rrpb100', type: 'classic', brand: 'Road Runner', model: 'RRPB100', name: 'Road Runner RRPB100', wdh: WDH_BOARD_457_305_76, image: null },
  { id: 'board-roadrunner-rrpb200', type: 'classic', brand: 'Road Runner', model: 'RRPB200', name: 'Road Runner RRPB200', wdh: WDH_BOARD_610_381_76, image: null },
]
