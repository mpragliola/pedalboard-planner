import {
  type Wdh,
  WDH_BOARD_457_305_64,
  WDH_BOARD_457_305_76,
  WDH_BOARD_610_381_76,
  WDH_BOARD_813_406_64,
  WDH_BOARD_813_406_76,
} from '../wdh'

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
  // Pedaltrain (images in pedaltrain/)
  { id: 'board-pedaltrain-nano', type: 'classic', brand: 'Pedaltrain', model: 'Nano', name: 'Pedaltrain Nano', wdh: [381, 140, 35], image: 'pedaltrain/pedaltrain-nano.png' },
  { id: 'board-pedaltrain-nano-plus', type: 'classic', brand: 'Pedaltrain', model: 'Nano+', name: 'Pedaltrain Nano+', wdh: [457, 140, 35], image: 'pedaltrain/pedaltrain-nano-plus.png' },
  { id: 'board-pedaltrain-nano-max', type: 'classic', brand: 'Pedaltrain', model: 'Nano Max', name: 'Pedaltrain Nano Max', wdh: [711, 140, 35], image: 'pedaltrain/pedaltrain-nano-max.png' },
  { id: 'board-pedaltrain-metro-16', type: 'classic', brand: 'Pedaltrain', model: 'Metro 16', name: 'Pedaltrain Metro 16', wdh: [406, 203, 35], image: 'pedaltrain/pedaltrain-metro-16.png' },
  { id: 'board-pedaltrain-metro-20', type: 'classic', brand: 'Pedaltrain', model: 'Metro 20', name: 'Pedaltrain Metro 20', wdh: [508, 203, 35], image: 'pedaltrain/pedaltrain-metro-20.png' },
  { id: 'board-pedaltrain-metro-24', type: 'classic', brand: 'Pedaltrain', model: 'Metro 24', name: 'Pedaltrain Metro 24', wdh: [609, 203, 35], image: 'pedaltrain/pedaltrain-metro-24.png' },
  { id: 'board-pedaltrain-metro-max', type: 'classic', brand: 'Pedaltrain', model: 'Metro Max', name: 'Pedaltrain Metro Max', wdh: [711, 203, 76], image: 'pedaltrain/pedaltrain-metro-max.png' },
  { id: 'board-pedaltrain-classic-jr', type: 'classic', brand: 'Pedaltrain', model: 'Classic JR', name: 'Pedaltrain Classic JR', wdh: [457, 317, 89], image: 'pedaltrain/pedaltrain-classic-jr.png' },
  { id: 'board-pedaltrain-classic-1', type: 'classic', brand: 'Pedaltrain', model: 'Classic 1', name: 'Pedaltrain Classic 1', wdh: [559, 317, 89], image: 'pedaltrain/pedaltrain-classic-1.png' },
  { id: 'board-pedaltrain-classic-2', type: 'classic', brand: 'Pedaltrain', model: 'Classic 2', name: 'Pedaltrain Classic 2', wdh: [609, 317, 89], image: 'pedaltrain/pedaltrain-classic-2.png' },
  { id: 'board-pedaltrain-classic-3', type: 'classic', brand: 'Pedaltrain', model: 'Classic 3', name: 'Pedaltrain Classic 3', wdh: [610, 406, 89], image: 'pedaltrain/pedaltrain-classic-3.png' },
  { id: 'board-pedaltrain-classic-pro', type: 'classic', brand: 'Pedaltrain', model: 'Classic Pro', name: 'Pedaltrain Classic Pro', wdh: [813, 406, 89], image: 'pedaltrain/pedaltrain-classic-pro.png' },
  { id: 'board-pedaltrain-jr-max', type: 'classic', brand: 'Pedaltrain', model: 'JR Max', name: 'Pedaltrain JR Max', wdh: [711, 318, 89], image: 'pedaltrain/pedaltrain-jr-max.png' },
  { id: 'board-pedaltrain-novo-18', type: 'classic', brand: 'Pedaltrain', model: 'Novo 18', name: 'Pedaltrain Novo 18', wdh: [457, 368, 89], image: 'pedaltrain/pedaltrain-novo-18.png' },
  { id: 'board-pedaltrain-novo-24', type: 'classic', brand: 'Pedaltrain', model: 'Novo 24', name: 'Pedaltrain Novo 24', wdh: [609, 368, 89], image: 'pedaltrain/pedaltrain-novo-24.png' },
  { id: 'board-pedaltrain-novo-32', type: 'classic', brand: 'Pedaltrain', model: 'Novo 32', name: 'Pedaltrain Novo 32', wdh: [813, 368, 89], image: 'pedaltrain/pedaltrain-novo-32.png' },
  { id: 'board-pedaltrain-terra-42', type: 'classic', brand: 'Pedaltrain', model: 'Terra 42', name: 'Pedaltrain Terra 42', wdh: [1067, 368, 89], image: 'pedaltrain/pedaltrain-terra-42.png' },
  { id: 'board-pedaltrain-xd-18', type: 'classic', brand: 'Pedaltrain', model: 'XD-18', name: 'Pedaltrain XD-18', wdh: [457, 445, 89], image: 'pedaltrain/pedaltrain-xd-18.png' },
  // RockBoard
  { id: 'board-rockboard-duo-20', type: 'classic', brand: 'RockBoard', model: 'Duo 2.0', name: 'RockBoard Duo 2.0', wdh: [450, 142, 35], image: null },
  { id: 'board-rockboard-duo-21', type: 'classic', brand: 'RockBoard', model: 'Duo 2.1', name: 'RockBoard Duo 2.1', wdh: [470, 142, 35], image: null },
  { id: 'board-rockboard-duo-22', type: 'classic', brand: 'RockBoard', model: 'Duo 2.2', name: 'RockBoard Duo 2.2', wdh: [622, 142, 35], image: null },
  { id: 'board-rockboard-tres-30', type: 'classic', brand: 'RockBoard', model: 'Tres 3.0', name: 'RockBoard Tres 3.0', wdh: [442, 236, 37], image: null },
  { id: 'board-rockboard-tres-31', type: 'classic', brand: 'RockBoard', model: 'Tres 3.1', name: 'RockBoard Tres 3.1', wdh: [598, 236, 37], image: null },
  { id: 'board-rockboard-tres-32', type: 'classic', brand: 'RockBoard', model: 'Tres 3.2', name: 'RockBoard Tres 3.2', wdh: [598, 291, 37], image: null },
  { id: 'board-rockboard-quad-41', type: 'classic', brand: 'RockBoard', model: 'Quad 4.1', name: 'RockBoard Quad 4.1', wdh: [610, 326, 37], image: null },
  { id: 'board-rockboard-quad-42', type: 'classic', brand: 'RockBoard', model: 'Quad 4.2', name: 'RockBoard Quad 4.2', wdh: [810, 326, 37], image: null },
  // Boss
  { id: 'board-boss-bcb-30', type: 'classic', brand: 'Boss', model: 'BCB-30', name: 'Boss BCB-30', wdh: [330, 300, 81], image: null },
  { id: 'board-boss-bcb-60', type: 'classic', brand: 'Boss', model: 'BCB-60', name: 'Boss BCB-60', wdh: [530, 330, 100], image: null },
  // Temple Audio
  { id: 'board-temple-solo-18', type: 'classic', brand: 'Temple Audio', model: 'Solo 18', name: 'Temple Audio Solo 18', wdh: [457, 305, 40], image: null },
  { id: 'board-temple-duo-24', type: 'classic', brand: 'Temple Audio', model: 'Duo 24', name: 'Temple Audio Duo 24', wdh: [610, 305, 40], image: null },
  { id: 'board-temple-trio-28', type: 'classic', brand: 'Temple Audio', model: 'Trio 28', name: 'Temple Audio Trio 28', wdh: [711, 419, 40], image: null },
  { id: 'board-temple-trio-43', type: 'classic', brand: 'Temple Audio', model: 'Trio 43', name: 'Temple Audio Trio 43', wdh: [1092, 419, 40], image: null },
  // Aclam
  { id: 'board-aclam-xs1', type: 'classic', brand: 'Aclam', model: 'Smart Track XS1', name: 'Aclam Smart Track XS1', wdh: [420, 150, 25], image: null },
  { id: 'board-aclam-xs2', type: 'classic', brand: 'Aclam', model: 'Smart Track XS2', name: 'Aclam Smart Track XS2', wdh: [420, 300, 25], image: null },
  { id: 'board-aclam-l2', type: 'classic', brand: 'Aclam', model: 'Smart Track L2', name: 'Aclam Smart Track L2', wdh: [820, 300, 25], image: null },
  // Friedman
  { id: 'board-friedman-1524', type: 'classic', brand: 'Friedman', model: 'Tour Pro 1524', name: 'Friedman Tour Pro 1524', wdh: [609, 381, 89], image: null },
  { id: 'board-friedman-1530', type: 'classic', brand: 'Friedman', model: 'Tour Pro 1530', name: 'Friedman Tour Pro 1530', wdh: [762, 381, 89], image: null },
  // Harley Benton
  { id: 'board-harley-benton-spaceship-20', type: 'classic', brand: 'Harley Benton', model: 'Spaceship 20', name: 'Harley Benton Spaceship 20', wdh: [500, 190, 35], image: null },
  { id: 'board-harley-benton-spaceship-40', type: 'classic', brand: 'Harley Benton', model: 'Spaceship 40', name: 'Harley Benton Spaceship 40', wdh: [600, 315, 70], image: null },
  { id: 'board-harley-benton-spaceship-60', type: 'classic', brand: 'Harley Benton', model: 'Spaceship 60', name: 'Harley Benton Spaceship 60', wdh: [800, 390, 70], image: null },
  { id: 'board-harley-benton-spaceship-80', type: 'classic', brand: 'Harley Benton', model: 'Spaceship 80', name: 'Harley Benton Spaceship 80', wdh: [800, 390, 70], image: null },
  // Mooer
  { id: 'board-mooer-micro', type: 'classic', brand: 'Mooer', model: 'Micro Pedalboard', name: 'Mooer Micro Pedalboard', wdh: [400, 160, 30], image: null },
  { id: 'board-mooer-s', type: 'classic', brand: 'Mooer', model: 'Pedalboard S', name: 'Mooer Pedalboard S', wdh: [470, 310, 60], image: null },
  { id: 'board-mooer-l', type: 'classic', brand: 'Mooer', model: 'Pedalboard L', name: 'Mooer Pedalboard L', wdh: [610, 410, 60], image: null },
  // D'Addario
  { id: 'board-daddario-xpnd-1', type: 'classic', brand: "D'Addario", model: 'XPND 1', name: "D'Addario XPND 1", wdh: [356, 140, 38], image: null },
  { id: 'board-daddario-xpnd-2', type: 'classic', brand: "D'Addario", model: 'XPND 2', name: "D'Addario XPND 2", wdh: [609, 318, 38], image: null },
  // Gator
  { id: 'board-gator-nano', type: 'classic', brand: 'Gator', model: 'GPB-NANO', name: 'Gator GPB-NANO', wdh: [380, 140, 35], image: null },
  { id: 'board-gator-ps', type: 'classic', brand: 'Gator', model: 'GPB-PS', name: 'Gator GPB-PS', wdh: WDH_BOARD_457_305_76, image: null },
  { id: 'board-gator-xl', type: 'classic', brand: 'Gator', model: 'GPB-XL', name: 'Gator GPB-XL', wdh: [762, 457, 76], image: null },
  // Palmer
  { id: 'board-palmer-40', type: 'classic', brand: 'Palmer', model: 'Pedalbay 40', name: 'Palmer Pedalbay 40', wdh: [450, 160, 30], image: null },
  { id: 'board-palmer-50s', type: 'classic', brand: 'Palmer', model: 'Pedalbay 50S', name: 'Palmer Pedalbay 50S', wdh: [500, 270, 70], image: null },
  { id: 'board-palmer-60l', type: 'classic', brand: 'Palmer', model: 'Pedalbay 60L', name: 'Palmer Pedalbay 60L', wdh: [600, 315, 70], image: null },
  { id: 'board-palmer-80', type: 'classic', brand: 'Palmer', model: 'Pedalbay 80', name: 'Palmer Pedalbay 80', wdh: [800, 390, 70], image: null },
  // Holeyboard
  { id: 'board-holeyboard-123', type: 'classic', brand: 'Holeyboard', model: '123', name: 'Holeyboard 123', wdh: WDH_BOARD_457_305_76, image: null },
  { id: 'board-holeyboard-1818', type: 'classic', brand: 'Holeyboard', model: '1818', name: 'Holeyboard 1818', wdh: [457, 457, 76], image: null },
  { id: 'board-holeyboard-123x', type: 'classic', brand: 'Holeyboard', model: '123X', name: 'Holeyboard 123X', wdh: [610, 305, 76], image: null },
  // Creation Music Company
  { id: 'board-creation-daybreak', type: 'classic', brand: 'Creation Music Company', model: 'Daybreak', name: 'Creation Music Company Daybreak', wdh: WDH_BOARD_457_305_64, image: null },
  { id: 'board-creation-elevation-24', type: 'classic', brand: 'Creation Music Company', model: 'Elevation Series 24', name: 'Creation Music Company Elevation Series 24', wdh: [610, 318, 64], image: null },
  { id: 'board-creation-elevation-32', type: 'classic', brand: 'Creation Music Company', model: 'Elevation Series 32', name: 'Creation Music Company Elevation Series 32', wdh: WDH_BOARD_813_406_64, image: null },
  // Warwick
  { id: 'board-warwick-cinque-52', type: 'classic', brand: 'Warwick', model: 'RockBoard CINQUE 5.2', name: 'Warwick RockBoard CINQUE 5.2', wdh: [810, 410, 37], image: null },
  { id: 'board-warwick-cinque-53', type: 'classic', brand: 'Warwick', model: 'RockBoard CINQUE 5.3', name: 'Warwick RockBoard CINQUE 5.3', wdh: [810, 485, 37], image: null },
  // Voodoo Lab
  { id: 'board-voodoolab-dingbat-small', type: 'classic', brand: 'Voodoo Lab', model: 'Dingbat Small', name: 'Voodoo Lab Dingbat Small', wdh: [460, 280, 89], image: null },
  { id: 'board-voodoolab-dingbat-medium', type: 'classic', brand: 'Voodoo Lab', model: 'Dingbat Medium', name: 'Voodoo Lab Dingbat Medium', wdh: [610, 410, 89], image: null },
  { id: 'board-voodoolab-dingbat-large', type: 'classic', brand: 'Voodoo Lab', model: 'Dingbat Large', name: 'Voodoo Lab Dingbat Large', wdh: [810, 410, 89], image: null },
  // Line 6
  { id: 'board-line6-helix', type: 'classic', brand: 'Line 6', model: 'Helix Board', name: 'Line 6 Helix Board', wdh: [560, 350, 90], image: null },
  // Boss (additional)
  { id: 'board-boss-bcb-90x', type: 'classic', brand: 'Boss', model: 'BCB-90X', name: 'Boss BCB-90X', wdh: [730, 360, 100], image: null },
  // SKB
  { id: 'board-skb-ps8', type: 'classic', brand: 'SKB', model: 'PS-8 Pedalboard', name: 'SKB PS-8 Pedalboard', wdh: [508, 305, 89], image: null },
  { id: 'board-skb-ps12', type: 'classic', brand: 'SKB', model: 'PS-12 Pedalboard', name: 'SKB PS-12 Pedalboard', wdh: [610, 381, 89], image: null },
  // On-Stage
  { id: 'board-onstage-gpb2000', type: 'classic', brand: 'On-Stage', model: 'GPB2000', name: 'On-Stage GPB2000', wdh: WDH_BOARD_457_305_76, image: null },
  { id: 'board-onstage-gpb3000', type: 'classic', brand: 'On-Stage', model: 'GPB3000', name: 'On-Stage GPB3000', wdh: WDH_BOARD_610_381_76, image: null },
  // Road Runner
  { id: 'board-roadrunner-rrpb100', type: 'classic', brand: 'Road Runner', model: 'RRPB100', name: 'Road Runner RRPB100', wdh: WDH_BOARD_457_305_76, image: null },
  { id: 'board-roadrunner-rrpb200', type: 'classic', brand: 'Road Runner', model: 'RRPB200', name: 'Road Runner RRPB200', wdh: WDH_BOARD_610_381_76, image: null },
  // Fender
  { id: 'board-fender-pro-small', type: 'classic', brand: 'Fender', model: 'Professional Pedal Board Small', name: 'Fender Professional Pedal Board Small', wdh: [457, 305, 57], image: null },
  { id: 'board-fender-pro-medium', type: 'classic', brand: 'Fender', model: 'Professional Pedal Board Medium', name: 'Fender Professional Pedal Board Medium', wdh: [610, 305, 57], image: null },
  { id: 'board-fender-pro-large', type: 'classic', brand: 'Fender', model: 'Professional Pedal Board Large', name: 'Fender Professional Pedal Board Large', wdh: [813, 406, 57], image: null },
  // NUX
  { id: 'board-nux-bumblebee-small', type: 'classic', brand: 'NUX', model: 'Bumblebee Small', name: 'NUX Bumblebee Small', wdh: [430, 230, 35], image: null },
  { id: 'board-nux-bumblebee-medium', type: 'classic', brand: 'NUX', model: 'Bumblebee Medium', name: 'NUX Bumblebee Medium', wdh: [500, 300, 35], image: null },
  { id: 'board-nux-bumblebee-large', type: 'classic', brand: 'NUX', model: 'Bumblebee Large', name: 'NUX Bumblebee Large', wdh: [600, 320, 35], image: null },
  // Vertex
  { id: 'board-vertex-small', type: 'classic', brand: 'Vertex', model: 'Pedalboard Small', name: 'Vertex Pedalboard Small', wdh: WDH_BOARD_457_305_64, image: null },
  { id: 'board-vertex-medium', type: 'classic', brand: 'Vertex', model: 'Pedalboard Medium', name: 'Vertex Pedalboard Medium', wdh: [610, 381, 64], image: null },
  { id: 'board-vertex-large', type: 'classic', brand: 'Vertex', model: 'Pedalboard Large', name: 'Vertex Pedalboard Large', wdh: WDH_BOARD_813_406_64, image: null },
  // Pedal Pad
  { id: 'board-pedalpad-axs-24', type: 'classic', brand: 'Pedal Pad', model: 'AXS Classic 24', name: 'Pedal Pad AXS Classic 24', wdh: [610, 305, 95], image: null },
  { id: 'board-pedalpad-axs-32', type: 'classic', brand: 'Pedal Pad', model: 'AXS Classic 32', name: 'Pedal Pad AXS Classic 32', wdh: [813, 406, 95], image: null },
  // Schmidt Array
  { id: 'board-schmidt-sa450', type: 'classic', brand: 'Schmidt Array', model: 'SA450', name: 'Schmidt Array SA450', wdh: [450, 300, 85], image: null },
  { id: 'board-schmidt-sa750', type: 'classic', brand: 'Schmidt Array', model: 'SA750', name: 'Schmidt Array SA750', wdh: [750, 350, 85], image: null },
  // Blackbird
  { id: 'board-blackbird-standard', type: 'classic', brand: 'Blackbird', model: 'Standard', name: 'Blackbird Standard', wdh: WDH_BOARD_457_305_76, image: null },
  { id: 'board-blackbird-custom-24', type: 'classic', brand: 'Blackbird', model: 'Custom 24', name: 'Blackbird Custom 24', wdh: WDH_BOARD_610_381_76, image: null },
  { id: 'board-blackbird-custom-32', type: 'classic', brand: 'Blackbird', model: 'Custom 32', name: 'Blackbird Custom 32', wdh: WDH_BOARD_813_406_76, image: null },
  // West Coast Pedalboard
  { id: 'board-westcoast-mini', type: 'classic', brand: 'West Coast Pedalboard', model: 'Mini', name: 'West Coast Pedalboard Mini', wdh: [406, 203, 38], image: null },
  { id: 'board-westcoast-standard', type: 'classic', brand: 'West Coast Pedalboard', model: 'Standard', name: 'West Coast Pedalboard Standard', wdh: [610, 305, 64], image: null },
  { id: 'board-westcoast-large', type: 'classic', brand: 'West Coast Pedalboard', model: 'Large', name: 'West Coast Pedalboard Large', wdh: WDH_BOARD_813_406_64, image: null },
  // NYC Pedalboards
  { id: 'board-nyc-small', type: 'classic', brand: 'NYC Pedalboards', model: 'Small', name: 'NYC Pedalboards Small', wdh: WDH_BOARD_457_305_76, image: null },
  { id: 'board-nyc-medium', type: 'classic', brand: 'NYC Pedalboards', model: 'Medium', name: 'NYC Pedalboards Medium', wdh: WDH_BOARD_610_381_76, image: null },
  { id: 'board-nyc-large', type: 'classic', brand: 'NYC Pedalboards', model: 'Large', name: 'NYC Pedalboards Large', wdh: WDH_BOARD_813_406_76, image: null },
  // Trailer Trash
  { id: 'board-trailertrash-classic-18', type: 'classic', brand: 'Trailer Trash', model: 'Classic 18', name: 'Trailer Trash Classic 18', wdh: WDH_BOARD_457_305_76, image: null },
  { id: 'board-trailertrash-pro-24', type: 'classic', brand: 'Trailer Trash', model: 'Pro 24', name: 'Trailer Trash Pro 24', wdh: WDH_BOARD_610_381_76, image: null },
  { id: 'board-trailertrash-pro-32', type: 'classic', brand: 'Trailer Trash', model: 'Pro 32', name: 'Trailer Trash Pro 32', wdh: WDH_BOARD_813_406_76, image: null },
  // Elevation
  { id: 'board-elevation-flat-16', type: 'classic', brand: 'Elevation', model: 'Flat Board 16', name: 'Elevation Flat Board 16', wdh: [406, 203, 25], image: null },
  { id: 'board-elevation-flat-24', type: 'classic', brand: 'Elevation', model: 'Flat Board 24', name: 'Elevation Flat Board 24', wdh: [610, 305, 25], image: null },
  // Custom
  { id: 'board-custom', type: 'classic', brand: '', model: 'Custom', name: 'Custom board', wdh: [400, 200, 20], image: null },
]
