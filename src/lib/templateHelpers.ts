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
    width: template.wdh[0] * MM_TO_PX,
    depth: template.wdh[1] * MM_TO_PX,
    height: template.wdh[2] * MM_TO_PX,
    rotation: 0,
    ...(template.image ? {} : { color: template.color }),
    image: template.image ? `images/boards/${template.image}` : null,
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
    width: template.wdh[0] * MM_TO_PX,
    depth: template.wdh[1] * MM_TO_PX,
    height: template.wdh[2] * MM_TO_PX,
    rotation: 0,
    ...(template.image ? {} : { color: template.color }),
    image: template.image ? `images/devices/${template.image}` : null,
  }
}
