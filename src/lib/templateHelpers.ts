import { MM_TO_PX, DEFAULT_OBJECT_COLOR, BASE_URL } from '../constants'
import type { CanvasObjectType } from '../types'
import type { BoardTemplate } from '../data/boards'
import type { DeviceTemplate } from '../data/devices'

/** Next counter per template id so IDs are templateId-1, templateId-2, … */
const nextCounterByTemplate = new Map<string, number>()

function getNextCounter(templateId: string): number {
  const n = (nextCounterByTemplate.get(templateId) ?? 1)
  nextCounterByTemplate.set(templateId, n + 1)
  return n
}

/** Call when restoring state so new objects never get IDs that collide with existing ones. */
export function initNextObjectIdFromObjects(objects: CanvasObjectType[]): void {
  for (const o of objects) {
    const m = o.id.match(/-(\d+)$/)
    if (m) {
      const base = o.id.slice(0, -m[0].length)
      const n = parseInt(m[1], 10) + 1
      const prev = nextCounterByTemplate.get(base) ?? 1
      nextCounterByTemplate.set(base, Math.max(prev, n))
    }
  }
}

export function createObjectFromBoardTemplate(
  template: BoardTemplate,
  x: number,
  y: number
): CanvasObjectType {
  return {
    id: `${template.id}-${getNextCounter(template.id)}`,
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
    ...(template.image ? {} : { color: template.color ?? DEFAULT_OBJECT_COLOR }),
    image: template.image ? `images/boards/${template.image}` : null,
  }
}

export function createObjectFromDeviceTemplate(
  template: DeviceTemplate,
  x: number,
  y: number
): CanvasObjectType {
  return {
    id: `${template.id}-${getNextCounter(template.id)}`,
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
    ...(template.image ? {} : { color: template.color ?? DEFAULT_OBJECT_COLOR }),
    image: template.image ? `${BASE_URL}images/devices/${template.image}` : null,
  }
}

const CUSTOM_BOARD_ID = 'board-custom'
const CUSTOM_DEVICE_ID = 'device-custom'
const CUSTOM_BOARD_HEIGHT_MM = 20
const CUSTOM_DEVICE_HEIGHT_MM = 50

export interface CustomBoardParams {
  widthMm: number
  depthMm: number
  color: string
  name: string
}

export interface CustomDeviceParams {
  widthMm: number
  depthMm: number
  color: string
  name: string
}

export function createObjectFromCustomBoard(
  params: CustomBoardParams,
  x: number,
  y: number
): CanvasObjectType {
  const template: BoardTemplate = {
    id: CUSTOM_BOARD_ID,
    type: 'classic',
    brand: '',
    model: 'Custom',
    name: params.name.trim() || 'Custom board',
    wdh: [params.widthMm, params.depthMm, CUSTOM_BOARD_HEIGHT_MM],
    color: params.color,
    image: null,
  }
  return createObjectFromBoardTemplate(template, x, y)
}

export function createObjectFromCustomDevice(
  params: CustomDeviceParams,
  x: number,
  y: number
): CanvasObjectType {
  const template: DeviceTemplate = {
    id: CUSTOM_DEVICE_ID,
    type: 'pedal',
    brand: '',
    model: 'Custom',
    name: params.name.trim() || 'Custom device',
    wdh: [params.widthMm, params.depthMm, CUSTOM_DEVICE_HEIGHT_MM],
    color: params.color,
    image: null,
  }
  return createObjectFromDeviceTemplate(template, x, y)
}
