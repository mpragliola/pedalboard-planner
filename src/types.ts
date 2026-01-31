export type { BoardType } from './data/boards'
export type { DeviceType } from './data/devices'

export type ObjectSubtype = 'board' | 'device'

/** Rotation in degrees: 0, 90, 180, 270. Affects footprint (90/270 swap width/depth). */
export interface CanvasObjectType {
  id: string
  subtype: ObjectSubtype
  type: string
  brand: string
  model: string
  x: number
  y: number
  width: number
  depth: number
  height: number
  /** Rotation in degrees. Default 0. */
  rotation?: number
  /** Omitted when object has an image. */
  color?: string
  image: string | null
  name: string
}

export type ConnectorLinkType = 'audio' | 'midi' | 'expression'

export type ConnectorKind =
  | 'mono jack (TS)'
  | 'stereo jack (TRS)'
  | 'MIDI (DIN)'
  | 'MIDI (TRS)'
  | 'two mono jacks (TSx2)'
  | 'XLR male'
  | 'XLR female'

export interface Connector {
  id: string
  deviceA: string
  deviceB: string
  type: ConnectorLinkType
  connectorA: ConnectorKind
  connectorB: ConnectorKind
}
