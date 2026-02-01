import { type Wdh } from '../wdh'
import { ACLAM_BOARD_TEMPLATES } from './boards-brands/aclam'
import { BLACKBIRD_BOARD_TEMPLATES } from './boards-brands/blackbird'
import { BOSS_BOARD_TEMPLATES } from './boards-brands/boss'
import { CREATION_BOARD_TEMPLATES } from './boards-brands/creation'
import { DADDARIO_BOARD_TEMPLATES } from './boards-brands/daddario'
import { ELEVATION_BOARD_TEMPLATES } from './boards-brands/elevation'
import { FENDER_BOARD_TEMPLATES } from './boards-brands/fender'
import { FRIEDMAN_BOARD_TEMPLATES } from './boards-brands/friedman'
import { GATOR_BOARD_TEMPLATES } from './boards-brands/gator'
import { HARLEYBENTON_BOARD_TEMPLATES } from './boards-brands/harleybenton'
import { HOLEYBOARD_BOARD_TEMPLATES } from './boards-brands/holeyboard'
import { LINE6_BOARD_TEMPLATES } from './boards-brands/line6'
import { MOOER_BOARD_TEMPLATES } from './boards-brands/mooer'
import { NUX_BOARD_TEMPLATES } from './boards-brands/nux'
import { NYC_BOARD_TEMPLATES } from './boards-brands/nyc'
import { ONSTAGE_BOARD_TEMPLATES } from './boards-brands/onstage'
import { PALMER_BOARD_TEMPLATES } from './boards-brands/palmer'
import { PEDALTRAIN_BOARD_TEMPLATES } from './boards-brands/pedaltrain'
import { PEDALPAD_BOARD_TEMPLATES } from './boards-brands/pedalpad'
import { ROCKBOARD_BOARD_TEMPLATES } from './boards-brands/rockboard'
import { ROADRUNNER_BOARD_TEMPLATES } from './boards-brands/roadrunner'
import { SCHMIDTARRAY_BOARD_TEMPLATES } from './boards-brands/schmidtarray'
import { SKB_BOARD_TEMPLATES } from './boards-brands/skb'
import { TEMPLEAUDIO_BOARD_TEMPLATES } from './boards-brands/templeaudio'
import { TRAILERTRASH_BOARD_TEMPLATES } from './boards-brands/trailertrash'
import { VERTEX_BOARD_TEMPLATES } from './boards-brands/vertex'
import { VOODOOLAB_BOARD_TEMPLATES } from './boards-brands/voodoolab'
import { WARWICK_BOARD_TEMPLATES } from './boards-brands/warwick'
import { WESTCOAST_BOARD_TEMPLATES } from './boards-brands/westcoast'

export type BoardType = 'classic'

export interface BoardTemplate {
  id: string
  type: BoardType
  brand: string
  model: string
  name: string
  /** [width, depth, height] in mm. */
  wdh: Wdh
  /** Omitted when template has an image. */
  color?: string
  image: string | null
}

/** Board dimensions (width, depth, height) are in millimetres. */
export const BOARD_TEMPLATES: BoardTemplate[] = [
  ...ACLAM_BOARD_TEMPLATES,
  ...BLACKBIRD_BOARD_TEMPLATES,
  ...BOSS_BOARD_TEMPLATES,
  ...CREATION_BOARD_TEMPLATES,
  ...DADDARIO_BOARD_TEMPLATES,
  ...ELEVATION_BOARD_TEMPLATES,
  ...FENDER_BOARD_TEMPLATES,
  ...FRIEDMAN_BOARD_TEMPLATES,
  ...GATOR_BOARD_TEMPLATES,
  ...HARLEYBENTON_BOARD_TEMPLATES,
  ...HOLEYBOARD_BOARD_TEMPLATES,
  ...LINE6_BOARD_TEMPLATES,
  ...MOOER_BOARD_TEMPLATES,
  ...NYC_BOARD_TEMPLATES,
  ...NUX_BOARD_TEMPLATES,
  ...ONSTAGE_BOARD_TEMPLATES,
  ...PALMER_BOARD_TEMPLATES,
  ...PEDALTRAIN_BOARD_TEMPLATES,
  ...PEDALPAD_BOARD_TEMPLATES,
  ...ROCKBOARD_BOARD_TEMPLATES,
  ...ROADRUNNER_BOARD_TEMPLATES,
  ...SCHMIDTARRAY_BOARD_TEMPLATES,
  ...SKB_BOARD_TEMPLATES,
  ...TEMPLEAUDIO_BOARD_TEMPLATES,
  ...TRAILERTRASH_BOARD_TEMPLATES,
  ...VERTEX_BOARD_TEMPLATES,
  ...VOODOOLAB_BOARD_TEMPLATES,
  ...WARWICK_BOARD_TEMPLATES,
  ...WESTCOAST_BOARD_TEMPLATES,
]
