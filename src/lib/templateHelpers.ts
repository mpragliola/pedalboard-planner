import { MM_TO_PX } from '../constants'
import type { CanvasObjectType } from '../types'
import type { BoardTemplate } from '../data/boards'
import type { DeviceTemplate } from '../data/devices'

let nextObjectId = 2

export function createObjectFromBoardTemplate(
  template: BoardTemplate,
  x: number,
  y: number
): CanvasObjectType {
  return {
    id: `obj-${nextObjectId++}`,
    subtype: 'board',
    type: template.type,
    brand: template.brand,
    model: template.model,
    name: template.name,
    x,
    y,
    width: template.width * MM_TO_PX,
    depth: template.depth * MM_TO_PX,
    height: template.height * MM_TO_PX,
    rotation: 0,
    color: template.color,
    image: template.image,
  }
}

export function createObjectFromDeviceTemplate(
  template: DeviceTemplate,
  x: number,
  y: number
): CanvasObjectType {
  return {
    id: `obj-${nextObjectId++}`,
    subtype: 'device',
    type: template.type,
    brand: template.brand,
    model: template.model,
    name: template.name,
    x,
    y,
    width: template.width * MM_TO_PX,
    depth: template.depth * MM_TO_PX,
    height: template.height * MM_TO_PX,
    rotation: 0,
    color: template.color,
    image: template.image,
  }
}
