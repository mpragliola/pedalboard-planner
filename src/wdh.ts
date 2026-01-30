/** [width, depth, height] in mm (templates) or px (canvas objects). */
export type Wdh = [number, number, number]

// ——— Device (pedal) dimensions ———
/** Boss compact pedal (e.g. DS-1, TU-3, RC-1). */
export const WDH_BOSS_COMPACT: Wdh = [75, 132, 59]
/** MXR standard (e.g. Phase 90, Carbon Copy). */
export const WDH_MXR_STANDARD: Wdh = [60, 110, 50]
/** MXR bass / double (e.g. Bass D.I.+, Dime Distortion). */
export const WDH_MXR_BASS: Wdh = [124, 92, 55]
/** Dunlop Cry Baby standard wah. */
export const WDH_CRYBABY_STANDARD: Wdh = [102, 252, 76]
/** Boss 200 series (e.g. DD-200, RV-200). */
export const WDH_BOSS_200: Wdh = [260, 160, 60]
/** Boss 500 series (e.g. DD-500, RV-500). */
export const WDH_BOSS_500: Wdh = [320, 240, 70]
/** Boss GT-1 / GT-1B size. */
export const WDH_BOSS_GT1: Wdh = [240, 180, 60]
/** Boss GT-6 / GT-6B / GT-8. */
export const WDH_BOSS_GT6: Wdh = [515, 261, 75]
/** Mooer micro (e.g. Expline, MVP series). */
export const WDH_MOOER_MICRO: Wdh = [42, 93, 52]
/** Zoom AC-2 / AC-3. */
export const WDH_ZOOM_AC: Wdh = [77.5, 130, 58.5]
/** Zoom MS series (MS-50G+, MS-60B+, etc.). */
export const WDH_ZOOM_MS: Wdh = [77.5, 130.3, 58.5]

// ——— Board dimensions ———
/** 18"×12" style, 76 mm height (e.g. Gator PS, Holeyboard 123). */
export const WDH_BOARD_457_305_76: Wdh = [457, 305, 76]
/** 24"×15" style, 76 mm height. */
export const WDH_BOARD_610_381_76: Wdh = [610, 381, 76]
/** 32"×16" style, 76 mm height. */
export const WDH_BOARD_813_406_76: Wdh = [813, 406, 76]
/** 18"×12" style, 64 mm height. */
export const WDH_BOARD_457_305_64: Wdh = [457, 305, 64]
/** 32"×16" style, 64 mm height. */
export const WDH_BOARD_813_406_64: Wdh = [813, 406, 64]
