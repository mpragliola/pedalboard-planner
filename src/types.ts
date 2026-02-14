export type { BoardType } from './data/boards'
export type { DeviceType } from './data/devices'
import type { Shape3D } from './shape3d'
import type { Point } from './lib/vector'

export type ObjectSubtype = 'board' | 'device'

/**
 * A generic object on the canvas, either a board or a device. Contains all 
 * properties needed for rendering and interaction.
 */
export interface CanvasObjectType {
  /** Unique instance ID */
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
  /** Rotation in degrees: 0, 90, 180, 270. Affects footprint (90/270 swap width/depth). */
  rotation?: number
  /** Omitted when object has an image. */
  color?: string
  image: string | null
  name: string
  shape?: Shape3D
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

/**
 * Represents a cable connecting two objects on the canvas.
 * You can specify a shape, a color, and two connectors with optional
 * labels (e.g. "Input", "Output", "Send", "In L", "Out R") for each end.
 */
export interface Cable {
  id: string
  segments: Point[]
  color: string
  connectorA: ConnectorKind
  connectorB: ConnectorKind
  /** Optional label for connector A (e.g. "Input", "Out L"). */
  connectorAName?: string
  /** Optional label for connector B (e.g. "Output", "In R"). */
  connectorBName?: string
}
