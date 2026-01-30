import type { CanvasObjectType } from './types'
import type { ConnectorKind, ConnectorLinkType } from './types'
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

/** Default fill color when a board or device has no image (and no custom color). */
export const DEFAULT_OBJECT_COLOR = 'rgb(72, 72, 82)'

/** Connector link type options (audio, midi, expression). */
export const CONNECTOR_TYPE_OPTIONS: { value: ConnectorLinkType; label: string }[] = [
  { value: 'audio', label: 'Audio' },
  { value: 'midi', label: 'MIDI' },
  { value: 'expression', label: 'Expression' },
]

/** Physical connector kind options. */
export const CONNECTOR_KIND_OPTIONS: { value: ConnectorKind; label: string }[] = [
  { value: 'mono jack (TS)', label: 'Mono jack (TS)' },
  { value: 'stereo jack (TRS)', label: 'Stereo jack (TRS)' },
  { value: 'MIDI (DIN)', label: 'MIDI (DIN)' },
  { value: 'MIDI (TRS)', label: 'MIDI (TRS)' },
  { value: 'two mono jacks (TSx2)', label: 'Two mono jacks (TSx2)' },
  { value: 'XLR male', label: 'XLR male' },
  { value: 'XLR female', label: 'XLR female' },
]

