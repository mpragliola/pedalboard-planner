import type { CanvasObjectType, Connector } from '../types'

/** Shape of state persisted to storage (e.g. localStorage). */
export interface SavedState {
  objects: CanvasObjectType[]
  past?: CanvasObjectType[][]
  future?: CanvasObjectType[][]
  zoom?: number
  pan?: { x: number; y: number }
  showGrid?: boolean
  unit?: 'mm' | 'in'
  connectors?: Connector[]
}

/**
 * Loads and saves app state to a storage backend (e.g. localStorage).
 * Validates loaded data and returns null on invalid or missing data.
 */
export class StateManager {
  constructor(private readonly storageKey: string = 'pedal/state') { }

  load(): SavedState | null {
    try {
      const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(this.storageKey) : null
      if (!raw) return null
      const data = JSON.parse(raw) as unknown
      if (typeof data !== 'object' || data === null || !('objects' in data)) return null
      const objects = (data as SavedState).objects
      if (!StateManager.isValidObjectArray(objects)) return null
      const past = (data as SavedState).past
      const future = (data as SavedState).future
      const pan = (data as SavedState).pan
      return {
        objects,
        past: Array.isArray(past) && past.every(StateManager.isValidObjectArray) ? past : undefined,
        future: Array.isArray(future) && future.every(StateManager.isValidObjectArray) ? future : undefined,
        zoom: typeof (data as SavedState).zoom === 'number' ? (data as SavedState).zoom : undefined,
        pan:
          typeof pan === 'object' &&
            pan !== null &&
            'x' in pan &&
            'y' in pan &&
            typeof (pan as { x: unknown; y: unknown }).x === 'number' &&
            typeof (pan as { x: unknown; y: unknown }).y === 'number'
            ? (pan as { x: number; y: number })
            : undefined,
        showGrid: typeof (data as SavedState).showGrid === 'boolean' ? (data as SavedState).showGrid : undefined,
        unit: (data as SavedState).unit === 'mm' || (data as SavedState).unit === 'in' ? (data as SavedState).unit : undefined,
        connectors: StateManager.isValidConnectorArray((data as SavedState).connectors) ? (data as SavedState).connectors : undefined,
      }
    } catch {
      return null
    }
  }

  save(state: SavedState): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.storageKey, JSON.stringify(state))
      }
    } catch {
      // quota or disabled
    }
  }

  private static isValidObject(o: unknown): o is CanvasObjectType {
    if (typeof o !== 'object' || o === null) return false
    const t = o as Record<string, unknown>
    return (
      typeof t.id === 'string' &&
      typeof t.subtype === 'string' &&
      typeof t.x === 'number' &&
      typeof t.y === 'number' &&
      typeof t.width === 'number' &&
      typeof t.depth === 'number' &&
      typeof t.height === 'number' &&
      typeof t.name === 'string'
    )
  }

  private static isValidObjectArray(arr: unknown): arr is CanvasObjectType[] {
    return Array.isArray(arr) && arr.every(StateManager.isValidObject)
  }

  private static isValidConnector(o: unknown): o is Connector {
    if (typeof o !== 'object' || o === null) return false
    const c = o as Record<string, unknown>
    return (
      typeof c.id === 'string' &&
      typeof c.deviceA === 'string' &&
      typeof c.deviceB === 'string' &&
      typeof c.type === 'string' &&
      typeof c.connectorA === 'string' &&
      typeof c.connectorB === 'string'
    )
  }

  private static isValidConnectorArray(arr: unknown): arr is Connector[] {
    return Array.isArray(arr) && arr.every(StateManager.isValidConnector)
  }
}
