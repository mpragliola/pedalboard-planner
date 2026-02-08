import type { Wdh } from '../../wdh'
import type { BoardTemplate } from '../boards'

/** 18"×12" style, 64 mm height. */
const WDH_BOARD_457_305_64: Wdh = [457, 305, 64]
/** 32"×16" style, 64 mm height. */
const WDH_BOARD_813_406_64: Wdh = [813, 406, 64]

export const CREATION_BOARD_TEMPLATES: BoardTemplate[] = [
  { id: 'board-creation-daybreak', type: 'classic', brand: 'Creation Music Company', model: 'Daybreak', name: 'Creation Music Company Daybreak', wdh: WDH_BOARD_457_305_64, image: null },
  { id: 'board-creation-elevation-24', type: 'classic', brand: 'Creation Music Company', model: 'Elevation Series 24', name: 'Creation Music Company Elevation Series 24', wdh: [610, 318, 64], image: null },
  { id: 'board-creation-elevation-32', type: 'classic', brand: 'Creation Music Company', model: 'Elevation Series 32', name: 'Creation Music Company Elevation Series 32', wdh: WDH_BOARD_813_406_64, image: null },
]
