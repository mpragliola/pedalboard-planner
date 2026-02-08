import type { Wdh } from '../../wdh'
import type { BoardTemplate } from '../boards'

/** 18"×12" style, 76 mm height (e.g. Gator PS, Holeyboard 123). */
const WDH_BOARD_457_305_76: Wdh = [457, 305, 76]

export const HOLEYBOARD_BOARD_TEMPLATES: BoardTemplate[] = [
  { id: 'board-holeyboard-123', type: 'classic', brand: 'Holeyboard', model: '123', name: 'Holeyboard 123', wdh: WDH_BOARD_457_305_76, image: null },
  { id: 'board-holeyboard-1818', type: 'classic', brand: 'Holeyboard', model: '1818', name: 'Holeyboard 1818', wdh: [457, 457, 76], image: null },
  { id: 'board-holeyboard-123x', type: 'classic', brand: 'Holeyboard', model: '123X', name: 'Holeyboard 123X', wdh: [610, 305, 76], image: null },
]
