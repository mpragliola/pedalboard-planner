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
