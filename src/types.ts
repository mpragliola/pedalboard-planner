export type { BoardType } from './data/boards'
export type { DeviceType } from './data/devices'
import type { Point } from './lib/vector'

export type ObjectSubtype = 'board' | 'device'

/** Rotation in degrees: 0, 90, 180, 270. Affects footprint (90/270 swap width/depth). */
export interface CanvasObjectType {
  /** Unique numeric instance ID (e.g. "1", "2", "3"). */
  id: string
  /** Template ID for looking up image (e.g. "device-boss-ds-1", "board-aclam-xs1"). */
  templateId?: string
  subtype: ObjectSubtype
  type: string
  brand: string
  model: string
  pos: Point
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

export type ConnectorKind =
  | 'mono jack (TS)'
  | 'mono jack (TS mini)'
  | 'stereo jack (TRS)'
  | 'stereo jack (TRS mini)'
  | 'MIDI (DIN)'
  | 'MIDI (DIN female)'
  | 'MIDI (TRS)'
  | 'two mono jacks (TSx2)'
  | 'XLR male'
  | 'XLR female'
  | 'Ethernet'

/** One segment of a cable or polyline (canvas coordinates). */
export interface CableSegment {
  start: Point
  end: Point
}

export interface Cable {
  id: string
  segments: CableSegment[]
  color: string
  connectorA: ConnectorKind
  connectorB: ConnectorKind
  /** Optional label for connector A (e.g. "Input", "Out L"). */
  connectorAName?: string
  /** Optional label for connector B (e.g. "Output", "In R"). */
  connectorBName?: string
}
