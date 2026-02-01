import { WDH_BOARD_457_305_64, WDH_BOARD_813_406_64 } from '../../wdh'
import type { BoardTemplate } from '../boards'

export const VERTEX_BOARD_TEMPLATES: BoardTemplate[] = [
  { id: 'board-vertex-small', type: 'classic', brand: 'Vertex', model: 'Pedalboard Small', name: 'Vertex Pedalboard Small', wdh: WDH_BOARD_457_305_64, image: null },
  { id: 'board-vertex-medium', type: 'classic', brand: 'Vertex', model: 'Pedalboard Medium', name: 'Vertex Pedalboard Medium', wdh: [610, 381, 64], image: null },
  { id: 'board-vertex-large', type: 'classic', brand: 'Vertex', model: 'Pedalboard Large', name: 'Vertex Pedalboard Large', wdh: WDH_BOARD_813_406_64, image: null },
]
