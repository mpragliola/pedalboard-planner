import { WDH_BOARD_457_305_76, WDH_BOARD_610_381_76, WDH_BOARD_813_406_76 } from '../../wdh'
import type { BoardTemplate } from '../boards'

export const BLACKBIRD_BOARD_TEMPLATES: BoardTemplate[] = [
  { id: 'board-blackbird-standard', type: 'classic', brand: 'Blackbird', model: 'Standard', name: 'Blackbird Standard', wdh: WDH_BOARD_457_305_76, image: null },
  { id: 'board-blackbird-custom-24', type: 'classic', brand: 'Blackbird', model: 'Custom 24', name: 'Blackbird Custom 24', wdh: WDH_BOARD_610_381_76, image: null },
  { id: 'board-blackbird-custom-32', type: 'classic', brand: 'Blackbird', model: 'Custom 32', name: 'Blackbird Custom 32', wdh: WDH_BOARD_813_406_76, image: null },
  { id: 'board-blackbird-feather-board', type: 'classic', brand: 'Blackbird', model: 'Feather Board', name: 'Blackbird Feather Board', wdh: WDH_BOARD_457_305_76, image: 'blackbird/blackbird-feather-board-top.png' },
  { id: 'board-blackbird-1630hc', type: 'classic', brand: 'Blackbird', model: '1630HC', name: 'Blackbird 1630HC', wdh: WDH_BOARD_457_305_76, image: 'blackbird/blackbird-1630hc.png' },
]
