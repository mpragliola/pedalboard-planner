export type BoardType = 'classic'

export interface BoardTemplate {
  id: string
  type: BoardType
  brand: string
  model: string
  name: string
  width: number
  depth: number
  height: number
  color: string
  image: string | null
}

/** Board dimensions (width, depth, height) are in millimetres. */
export const BOARD_TEMPLATES: BoardTemplate[] = [
// Pedaltrain
  { id: 'board-pedaltrain-nano', type: 'classic', brand: 'Pedaltrain', model: 'Nano', name: 'Pedaltrain Nano', width: 381, depth: 140, height: 35, color: 'rgb(60, 60, 60)', image: null },
  { id: 'board-pedaltrain-nano-plus', type: 'classic', brand: 'Pedaltrain', model: 'Nano+', name: 'Pedaltrain Nano+', width: 457, depth: 140, height: 35, color: 'rgb(60, 60, 60)', image: null },
  { id: 'board-pedaltrain-nano-max', type: 'classic', brand: 'Pedaltrain', model: 'Nano Max', name: 'Pedaltrain Nano Max', width: 711, depth: 140, height: 35, color: 'rgb(60, 60, 60)', image: null },
  { id: 'board-pedaltrain-metro-16', type: 'classic', brand: 'Pedaltrain', model: 'Metro 16', name: 'Pedaltrain Metro 16', width: 406, depth: 203, height: 35, color: 'rgb(60, 60, 60)', image: null },
  { id: 'board-pedaltrain-metro-20', type: 'classic', brand: 'Pedaltrain', model: 'Metro 20', name: 'Pedaltrain Metro 20', width: 508, depth: 203, height: 35, color: 'rgb(60, 60, 60)', image: null },
  { id: 'board-pedaltrain-metro-24', type: 'classic', brand: 'Pedaltrain', model: 'Metro 24', name: 'Pedaltrain Metro 24', width: 609, depth: 203, height: 35, color: 'rgb(60, 60, 60)', image: null },
  { id: 'board-pedaltrain-classic-jr', type: 'classic', brand: 'Pedaltrain', model: 'Classic JR', name: 'Pedaltrain Classic JR', width: 457, depth: 317, height: 89, color: 'rgb(60, 60, 60)', image: null },
  { id: 'board-pedaltrain-classic-1', type: 'classic', brand: 'Pedaltrain', model: 'Classic 1', name: 'Pedaltrain Classic 1', width: 559, depth: 317, height: 89, color: 'rgb(60, 60, 60)', image: null },
  { id: 'board-pedaltrain-classic-2', type: 'classic', brand: 'Pedaltrain', model: 'Classic 2', name: 'Pedaltrain Classic 2', width: 609, depth: 317, height: 89, color: 'rgb(60, 60, 60)', image: null },
  { id: 'board-pedaltrain-classic-pro', type: 'classic', brand: 'Pedaltrain', model: 'Classic Pro', name: 'Pedaltrain Classic Pro', width: 813, depth: 406, height: 89, color: 'rgb(60, 60, 60)', image: null },
  { id: 'board-pedaltrain-novo-18', type: 'classic', brand: 'Pedaltrain', model: 'Novo 18', name: 'Pedaltrain Novo 18', width: 457, depth: 368, height: 89, color: 'rgb(60, 60, 60)', image: null },
  { id: 'board-pedaltrain-novo-24', type: 'classic', brand: 'Pedaltrain', model: 'Novo 24', name: 'Pedaltrain Novo 24', width: 609, depth: 368, height: 89, color: 'rgb(60, 60, 60)', image: null },
  { id: 'board-pedaltrain-novo-32', type: 'classic', brand: 'Pedaltrain', model: 'Novo 32', name: 'Pedaltrain Novo 32', width: 813, depth: 368, height: 89, color: 'rgb(60, 60, 60)', image: null },
  { id: 'board-pedaltrain-terra-42', type: 'classic', brand: 'Pedaltrain', model: 'Terra 42', name: 'Pedaltrain Terra 42', width: 1067, depth: 368, height: 89, color: 'rgb(60, 60, 60)', image: null },
  // RockBoard
  { id: 'board-rockboard-duo-20', type: 'classic', brand: 'RockBoard', model: 'Duo 2.0', name: 'RockBoard Duo 2.0', width: 450, depth: 142, height: 35, color: 'rgb(55, 55, 55)', image: null },
  { id: 'board-rockboard-duo-21', type: 'classic', brand: 'RockBoard', model: 'Duo 2.1', name: 'RockBoard Duo 2.1', width: 470, depth: 142, height: 35, color: 'rgb(55, 55, 55)', image: null },
  { id: 'board-rockboard-duo-22', type: 'classic', brand: 'RockBoard', model: 'Duo 2.2', name: 'RockBoard Duo 2.2', width: 622, depth: 142, height: 35, color: 'rgb(55, 55, 55)', image: null },
  { id: 'board-rockboard-tres-30', type: 'classic', brand: 'RockBoard', model: 'Tres 3.0', name: 'RockBoard Tres 3.0', width: 442, depth: 236, height: 37, color: 'rgb(55, 55, 55)', image: null },
  { id: 'board-rockboard-tres-31', type: 'classic', brand: 'RockBoard', model: 'Tres 3.1', name: 'RockBoard Tres 3.1', width: 598, depth: 236, height: 37, color: 'rgb(55, 55, 55)', image: null },
  { id: 'board-rockboard-tres-32', type: 'classic', brand: 'RockBoard', model: 'Tres 3.2', name: 'RockBoard Tres 3.2', width: 598, depth: 291, height: 37, color: 'rgb(55, 55, 55)', image: null },
  { id: 'board-rockboard-quad-41', type: 'classic', brand: 'RockBoard', model: 'Quad 4.1', name: 'RockBoard Quad 4.1', width: 610, depth: 326, height: 37, color: 'rgb(55, 55, 55)', image: null },
  { id: 'board-rockboard-quad-42', type: 'classic', brand: 'RockBoard', model: 'Quad 4.2', name: 'RockBoard Quad 4.2', width: 810, depth: 326, height: 37, color: 'rgb(55, 55, 55)', image: null },
  // Boss
  { id: 'board-boss-bcb-30', type: 'classic', brand: 'Boss', model: 'BCB-30', name: 'Boss BCB-30', width: 330, depth: 300, height: 81, color: 'rgb(70, 70, 80)', image: null },
  { id: 'board-boss-bcb-60', type: 'classic', brand: 'Boss', model: 'BCB-60', name: 'Boss BCB-60', width: 530, depth: 330, height: 100, color: 'rgb(70, 70, 80)', image: null },
  // Temple Audio
  { id: 'board-temple-solo-18', type: 'classic', brand: 'Temple Audio', model: 'Solo 18', name: 'Temple Audio Solo 18', width: 457, depth: 305, height: 40, color: 'rgb(50, 55, 60)', image: null },
  { id: 'board-temple-duo-24', type: 'classic', brand: 'Temple Audio', model: 'Duo 24', name: 'Temple Audio Duo 24', width: 610, depth: 305, height: 40, color: 'rgb(50, 55, 60)', image: null },
  { id: 'board-temple-trio-28', type: 'classic', brand: 'Temple Audio', model: 'Trio 28', name: 'Temple Audio Trio 28', width: 711, depth: 419, height: 40, color: 'rgb(50, 55, 60)', image: null },
  { id: 'board-temple-trio-43', type: 'classic', brand: 'Temple Audio', model: 'Trio 43', name: 'Temple Audio Trio 43', width: 1092, depth: 419, height: 40, color: 'rgb(50, 55, 60)', image: null },
  // Aclam
  { id: 'board-aclam-xs1', type: 'classic', brand: 'Aclam', model: 'Smart Track XS1', name: 'Aclam Smart Track XS1', width: 420, depth: 150, height: 25, color: 'rgb(65, 60, 55)', image: null },
  { id: 'board-aclam-xs2', type: 'classic', brand: 'Aclam', model: 'Smart Track XS2', name: 'Aclam Smart Track XS2', width: 420, depth: 300, height: 25, color: 'rgb(65, 60, 55)', image: null },
  { id: 'board-aclam-l2', type: 'classic', brand: 'Aclam', model: 'Smart Track L2', name: 'Aclam Smart Track L2', width: 820, depth: 300, height: 25, color: 'rgb(65, 60, 55)', image: null },
  // Friedman
  { id: 'board-friedman-1524', type: 'classic', brand: 'Friedman', model: 'Tour Pro 1524', name: 'Friedman Tour Pro 1524', width: 609, depth: 381, height: 89, color: 'rgb(58, 58, 62)', image: null },
  { id: 'board-friedman-1530', type: 'classic', brand: 'Friedman', model: 'Tour Pro 1530', name: 'Friedman Tour Pro 1530', width: 762, depth: 381, height: 89, color: 'rgb(58, 58, 62)', image: null },
  // Harley Benton
  { id: 'board-harley-benton-spaceship-20', type: 'classic', brand: 'Harley Benton', model: 'Spaceship 20', name: 'Harley Benton Spaceship 20', width: 500, depth: 190, height: 35, color: 'rgb(62, 58, 55)', image: null },
  { id: 'board-harley-benton-spaceship-40', type: 'classic', brand: 'Harley Benton', model: 'Spaceship 40', name: 'Harley Benton Spaceship 40', width: 600, depth: 315, height: 70, color: 'rgb(62, 58, 55)', image: null },
  { id: 'board-harley-benton-spaceship-60', type: 'classic', brand: 'Harley Benton', model: 'Spaceship 60', name: 'Harley Benton Spaceship 60', width: 800, depth: 390, height: 70, color: 'rgb(62, 58, 55)', image: null },
  { id: 'board-harley-benton-spaceship-80', type: 'classic', brand: 'Harley Benton', model: 'Spaceship 80', name: 'Harley Benton Spaceship 80', width: 800, depth: 390, height: 70, color: 'rgb(62, 58, 55)', image: null },
  // Mooer
  { id: 'board-mooer-micro', type: 'classic', brand: 'Mooer', model: 'Micro Pedalboard', name: 'Mooer Micro Pedalboard', width: 400, depth: 160, height: 30, color: 'rgb(55, 55, 58)', image: null },
  { id: 'board-mooer-s', type: 'classic', brand: 'Mooer', model: 'Pedalboard S', name: 'Mooer Pedalboard S', width: 470, depth: 310, height: 60, color: 'rgb(55, 55, 58)', image: null },
  { id: 'board-mooer-l', type: 'classic', brand: 'Mooer', model: 'Pedalboard L', name: 'Mooer Pedalboard L', width: 610, depth: 410, height: 60, color: 'rgb(55, 55, 58)', image: null },
  // D'Addario
  { id: 'board-daddario-xpnd-1', type: 'classic', brand: "D'Addario", model: 'XPND 1', name: "D'Addario XPND 1", width: 356, depth: 140, height: 38, color: 'rgb(68, 65, 62)', image: null },
  { id: 'board-daddario-xpnd-2', type: 'classic', brand: "D'Addario", model: 'XPND 2', name: "D'Addario XPND 2", width: 609, depth: 318, height: 38, color: 'rgb(68, 65, 62)', image: null },
  // Gator
  { id: 'board-gator-nano', type: 'classic', brand: 'Gator', model: 'GPB-NANO', name: 'Gator GPB-NANO', width: 380, depth: 140, height: 35, color: 'rgb(52, 55, 58)', image: null },
  { id: 'board-gator-ps', type: 'classic', brand: 'Gator', model: 'GPB-PS', name: 'Gator GPB-PS', width: 457, depth: 305, height: 76, color: 'rgb(52, 55, 58)', image: null },
  { id: 'board-gator-xl', type: 'classic', brand: 'Gator', model: 'GPB-XL', name: 'Gator GPB-XL', width: 762, depth: 457, height: 76, color: 'rgb(52, 55, 58)', image: null },
  // Palmer
  { id: 'board-palmer-40', type: 'classic', brand: 'Palmer', model: 'Pedalbay 40', name: 'Palmer Pedalbay 40', width: 450, depth: 160, height: 30, color: 'rgb(58, 56, 54)', image: null },
  { id: 'board-palmer-50s', type: 'classic', brand: 'Palmer', model: 'Pedalbay 50S', name: 'Palmer Pedalbay 50S', width: 500, depth: 270, height: 70, color: 'rgb(58, 56, 54)', image: null },
  { id: 'board-palmer-60l', type: 'classic', brand: 'Palmer', model: 'Pedalbay 60L', name: 'Palmer Pedalbay 60L', width: 600, depth: 315, height: 70, color: 'rgb(58, 56, 54)', image: null },
  { id: 'board-palmer-80', type: 'classic', brand: 'Palmer', model: 'Pedalbay 80', name: 'Palmer Pedalbay 80', width: 800, depth: 390, height: 70, color: 'rgb(58, 56, 54)', image: null },
  // Holeyboard
  { id: 'board-holeyboard-123', type: 'classic', brand: 'Holeyboard', model: '123', name: 'Holeyboard 123', width: 457, depth: 305, height: 76, color: 'rgb(50, 52, 55)', image: null },
  { id: 'board-holeyboard-1818', type: 'classic', brand: 'Holeyboard', model: '1818', name: 'Holeyboard 1818', width: 457, depth: 457, height: 76, color: 'rgb(50, 52, 55)', image: null },
  { id: 'board-holeyboard-123x', type: 'classic', brand: 'Holeyboard', model: '123X', name: 'Holeyboard 123X', width: 610, depth: 305, height: 76, color: 'rgb(50, 52, 55)', image: null },
  // Creation Music Company
  { id: 'board-creation-daybreak', type: 'classic', brand: 'Creation Music Company', model: 'Daybreak', name: 'Creation Music Company Daybreak', width: 457, depth: 305, height: 64, color: 'rgb(56, 58, 60)', image: null },
  { id: 'board-creation-elevation-24', type: 'classic', brand: 'Creation Music Company', model: 'Elevation Series 24', name: 'Creation Music Company Elevation Series 24', width: 610, depth: 318, height: 64, color: 'rgb(56, 58, 60)', image: null },
  { id: 'board-creation-elevation-32', type: 'classic', brand: 'Creation Music Company', model: 'Elevation Series 32', name: 'Creation Music Company Elevation Series 32', width: 813, depth: 406, height: 64, color: 'rgb(56, 58, 60)', image: null },
  // Warwick
  { id: 'board-warwick-cinque-52', type: 'classic', brand: 'Warwick', model: 'RockBoard CINQUE 5.2', name: 'Warwick RockBoard CINQUE 5.2', width: 810, depth: 410, height: 37, color: 'rgb(54, 56, 58)', image: null },
  { id: 'board-warwick-cinque-53', type: 'classic', brand: 'Warwick', model: 'RockBoard CINQUE 5.3', name: 'Warwick RockBoard CINQUE 5.3', width: 810, depth: 485, height: 37, color: 'rgb(54, 56, 58)', image: null },
  // Voodoo Lab
  { id: 'board-voodoolab-dingbat-small', type: 'classic', brand: 'Voodoo Lab', model: 'Dingbat Small', name: 'Voodoo Lab Dingbat Small', width: 460, depth: 280, height: 89, color: 'rgb(48, 48, 52)', image: null },
  { id: 'board-voodoolab-dingbat-medium', type: 'classic', brand: 'Voodoo Lab', model: 'Dingbat Medium', name: 'Voodoo Lab Dingbat Medium', width: 610, depth: 410, height: 89, color: 'rgb(48, 48, 52)', image: null },
  { id: 'board-voodoolab-dingbat-large', type: 'classic', brand: 'Voodoo Lab', model: 'Dingbat Large', name: 'Voodoo Lab Dingbat Large', width: 810, depth: 410, height: 89, color: 'rgb(48, 48, 52)', image: null },
  // Line 6
  { id: 'board-line6-helix', type: 'classic', brand: 'Line 6', model: 'Helix Board', name: 'Line 6 Helix Board', width: 560, depth: 350, height: 90, color: 'rgb(60, 58, 62)', image: null },
  // Boss (additional)
  { id: 'board-boss-bcb-90x', type: 'classic', brand: 'Boss', model: 'BCB-90X', name: 'Boss BCB-90X', width: 730, depth: 360, height: 100, color: 'rgb(70, 70, 80)', image: null },
  // SKB
  { id: 'board-skb-ps8', type: 'classic', brand: 'SKB', model: 'PS-8 Pedalboard', name: 'SKB PS-8 Pedalboard', width: 508, depth: 305, height: 89, color: 'rgb(58, 58, 62)', image: null },
  { id: 'board-skb-ps12', type: 'classic', brand: 'SKB', model: 'PS-12 Pedalboard', name: 'SKB PS-12 Pedalboard', width: 610, depth: 381, height: 89, color: 'rgb(58, 58, 62)', image: null },
  // On-Stage
  { id: 'board-onstage-gpb2000', type: 'classic', brand: 'On-Stage', model: 'GPB2000', name: 'On-Stage GPB2000', width: 457, depth: 305, height: 76, color: 'rgb(55, 55, 58)', image: null },
  { id: 'board-onstage-gpb3000', type: 'classic', brand: 'On-Stage', model: 'GPB3000', name: 'On-Stage GPB3000', width: 610, depth: 381, height: 76, color: 'rgb(55, 55, 58)', image: null },
  // Road Runner
  { id: 'board-roadrunner-rrpb100', type: 'classic', brand: 'Road Runner', model: 'RRPB100', name: 'Road Runner RRPB100', width: 457, depth: 305, height: 76, color: 'rgb(52, 54, 56)', image: null },
  { id: 'board-roadrunner-rrpb200', type: 'classic', brand: 'Road Runner', model: 'RRPB200', name: 'Road Runner RRPB200', width: 610, depth: 381, height: 76, color: 'rgb(52, 54, 56)', image: null },
  // Fender
  { id: 'board-fender-pro-small', type: 'classic', brand: 'Fender', model: 'Professional Pedal Board Small', name: 'Fender Professional Pedal Board Small', width: 457, depth: 305, height: 57, color: 'rgb(62, 60, 58)', image: null },
  { id: 'board-fender-pro-medium', type: 'classic', brand: 'Fender', model: 'Professional Pedal Board Medium', name: 'Fender Professional Pedal Board Medium', width: 610, depth: 305, height: 57, color: 'rgb(62, 60, 58)', image: null },
  { id: 'board-fender-pro-large', type: 'classic', brand: 'Fender', model: 'Professional Pedal Board Large', name: 'Fender Professional Pedal Board Large', width: 813, depth: 406, height: 57, color: 'rgb(62, 60, 58)', image: null },
  // NUX
  { id: 'board-nux-bumblebee-small', type: 'classic', brand: 'NUX', model: 'Bumblebee Small', name: 'NUX Bumblebee Small', width: 430, depth: 230, height: 35, color: 'rgb(56, 54, 52)', image: null },
  { id: 'board-nux-bumblebee-medium', type: 'classic', brand: 'NUX', model: 'Bumblebee Medium', name: 'NUX Bumblebee Medium', width: 500, depth: 300, height: 35, color: 'rgb(56, 54, 52)', image: null },
  { id: 'board-nux-bumblebee-large', type: 'classic', brand: 'NUX', model: 'Bumblebee Large', name: 'NUX Bumblebee Large', width: 600, depth: 320, height: 35, color: 'rgb(56, 54, 52)', image: null },
  // Vertex
  { id: 'board-vertex-small', type: 'classic', brand: 'Vertex', model: 'Pedalboard Small', name: 'Vertex Pedalboard Small', width: 457, depth: 305, height: 64, color: 'rgb(54, 56, 58)', image: null },
  { id: 'board-vertex-medium', type: 'classic', brand: 'Vertex', model: 'Pedalboard Medium', name: 'Vertex Pedalboard Medium', width: 610, depth: 381, height: 64, color: 'rgb(54, 56, 58)', image: null },
  { id: 'board-vertex-large', type: 'classic', brand: 'Vertex', model: 'Pedalboard Large', name: 'Vertex Pedalboard Large', width: 813, depth: 406, height: 64, color: 'rgb(54, 56, 58)', image: null },
  // Pedal Pad
  { id: 'board-pedalpad-axs-24', type: 'classic', brand: 'Pedal Pad', model: 'AXS Classic 24', name: 'Pedal Pad AXS Classic 24', width: 610, depth: 305, height: 95, color: 'rgb(52, 54, 56)', image: null },
  { id: 'board-pedalpad-axs-32', type: 'classic', brand: 'Pedal Pad', model: 'AXS Classic 32', name: 'Pedal Pad AXS Classic 32', width: 813, depth: 406, height: 95, color: 'rgb(52, 54, 56)', image: null },
  // Schmidt Array
  { id: 'board-schmidt-sa450', type: 'classic', brand: 'Schmidt Array', model: 'SA450', name: 'Schmidt Array SA450', width: 450, depth: 300, height: 85, color: 'rgb(58, 56, 54)', image: null },
  { id: 'board-schmidt-sa750', type: 'classic', brand: 'Schmidt Array', model: 'SA750', name: 'Schmidt Array SA750', width: 750, depth: 350, height: 85, color: 'rgb(58, 56, 54)', image: null },
  // Blackbird
  { id: 'board-blackbird-standard', type: 'classic', brand: 'Blackbird', model: 'Standard', name: 'Blackbird Standard', width: 457, depth: 305, height: 76, color: 'rgb(48, 48, 50)', image: null },
  { id: 'board-blackbird-custom-24', type: 'classic', brand: 'Blackbird', model: 'Custom 24', name: 'Blackbird Custom 24', width: 610, depth: 381, height: 76, color: 'rgb(48, 48, 50)', image: null },
  { id: 'board-blackbird-custom-32', type: 'classic', brand: 'Blackbird', model: 'Custom 32', name: 'Blackbird Custom 32', width: 813, depth: 406, height: 76, color: 'rgb(48, 48, 50)', image: null },
  // West Coast Pedalboard
  { id: 'board-westcoast-mini', type: 'classic', brand: 'West Coast Pedalboard', model: 'Mini', name: 'West Coast Pedalboard Mini', width: 406, depth: 203, height: 38, color: 'rgb(56, 58, 60)', image: null },
  { id: 'board-westcoast-standard', type: 'classic', brand: 'West Coast Pedalboard', model: 'Standard', name: 'West Coast Pedalboard Standard', width: 610, depth: 305, height: 64, color: 'rgb(56, 58, 60)', image: null },
  { id: 'board-westcoast-large', type: 'classic', brand: 'West Coast Pedalboard', model: 'Large', name: 'West Coast Pedalboard Large', width: 813, depth: 406, height: 64, color: 'rgb(56, 58, 60)', image: null },
  // NYC Pedalboards
  { id: 'board-nyc-small', type: 'classic', brand: 'NYC Pedalboards', model: 'Small', name: 'NYC Pedalboards Small', width: 457, depth: 305, height: 76, color: 'rgb(50, 52, 54)', image: null },
  { id: 'board-nyc-medium', type: 'classic', brand: 'NYC Pedalboards', model: 'Medium', name: 'NYC Pedalboards Medium', width: 610, depth: 381, height: 76, color: 'rgb(50, 52, 54)', image: null },
  { id: 'board-nyc-large', type: 'classic', brand: 'NYC Pedalboards', model: 'Large', name: 'NYC Pedalboards Large', width: 813, depth: 406, height: 76, color: 'rgb(50, 52, 54)', image: null },
  // Trailer Trash
  { id: 'board-trailertrash-classic-18', type: 'classic', brand: 'Trailer Trash', model: 'Classic 18', name: 'Trailer Trash Classic 18', width: 457, depth: 305, height: 76, color: 'rgb(52, 50, 48)', image: null },
  { id: 'board-trailertrash-pro-24', type: 'classic', brand: 'Trailer Trash', model: 'Pro 24', name: 'Trailer Trash Pro 24', width: 610, depth: 381, height: 76, color: 'rgb(52, 50, 48)', image: null },
  { id: 'board-trailertrash-pro-32', type: 'classic', brand: 'Trailer Trash', model: 'Pro 32', name: 'Trailer Trash Pro 32', width: 813, depth: 406, height: 76, color: 'rgb(52, 50, 48)', image: null },
  // Elevation
  { id: 'board-elevation-flat-16', type: 'classic', brand: 'Elevation', model: 'Flat Board 16', name: 'Elevation Flat Board 16', width: 406, depth: 203, height: 25, color: 'rgb(58, 60, 62)', image: null },
  { id: 'board-elevation-flat-24', type: 'classic', brand: 'Elevation', model: 'Flat Board 24', name: 'Elevation Flat Board 24', width: 610, depth: 305, height: 25, color: 'rgb(58, 60, 62)', image: null },
  // Custom
  { id: 'board-custom', type: 'classic', brand: '', model: 'Custom', name: 'Custom board', width: 400, depth: 200, height: 20, color: 'rgb(139, 115, 85)', image: null },
]
