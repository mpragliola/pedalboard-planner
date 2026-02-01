import { WDH_BOARD_813_406_64 } from '../../wdh'
import type { BoardTemplate } from '../boards'

export const WESTCOAST_BOARD_TEMPLATES: BoardTemplate[] = [
  { id: 'board-westcoast-mini', type: 'classic', brand: 'West Coast Pedalboard', model: 'Mini', name: 'West Coast Pedalboard Mini', wdh: [406, 203, 38], image: null },
  { id: 'board-westcoast-standard', type: 'classic', brand: 'West Coast Pedalboard', model: 'Standard', name: 'West Coast Pedalboard Standard', wdh: [610, 305, 64], image: null },
  { id: 'board-westcoast-large', type: 'classic', brand: 'West Coast Pedalboard', model: 'Large', name: 'West Coast Pedalboard Large', wdh: WDH_BOARD_813_406_64, image: null },
]
