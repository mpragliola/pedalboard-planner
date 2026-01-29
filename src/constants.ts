import type { CanvasObjectType } from './types'
import type { DeviceType } from './data/devices'

export const ZOOM_MIN = 0.5
export const ZOOM_MAX = 3
export const ZOOM_STEP = 0.25

/** Scale: board/device template dimensions are in mm; convert to px for canvas. 1 mm = 1 px. */
export const MM_TO_PX = 1

export const DEVICE_TYPE_ORDER: DeviceType[] = ['pedal', 'multifx', 'power unit', 'controller']
export const DEVICE_TYPE_LABEL: Record<DeviceType, string> = {
  pedal: 'Pedals',
  multifx: 'Multifx',
  'power unit': 'Power units',
  controller: 'Controllers',
}

export const initialObjects: CanvasObjectType[] = []

