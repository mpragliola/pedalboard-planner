import type { Wdh } from '../../wdh'
import type { BoardTemplate } from '../boards'

/** 18"×12" style, 76 mm height (e.g. Gator PS, Holeyboard 123). */
const WDH_BOARD_457_305_76: Wdh = [457, 305, 76]

export const BLACKBIRD_BOARD_TEMPLATES: BoardTemplate[] = [
  { id: 'board-blackbird-feather-board', type: 'classic', brand: 'Blackbird', model: 'Feather Board', name: 'Blackbird Feather Board', wdh: WDH_BOARD_457_305_76, image: 'blackbird/blackbird-feather-board-top.png' },
  { id: 'board-blackbird-1630hc', type: 'classic', brand: 'Blackbird', model: '1630HC', name: 'Blackbird 1630HC', wdh: WDH_BOARD_457_305_76, image: 'blackbird/blackbird-1630hc.png' },
]
