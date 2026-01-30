/** CORS-friendly reverse geocode (e.g. BigDataCloud; Nominatim blocks browser from localhost). */
const REVERSE_GEOCODE_URL = 'https://api.bigdatacloud.net/data/reverse-geocode-client'

/**
 * Loads a human-readable location from the browser (geolocation + reverse geocoding).
 * Use in response to user action (e.g. "Load from browser" button).
 */
export class LocationLoader {
  /**
   * Gets current position via Geolocation API, then reverse-geocodes to a place name.
   * @returns Place string (e.g. "Berlin, Berlin, Germany")
   * @throws Error with a user-facing message if geolocation is unsupported, permission denied, or geocoding fails
   */
  async loadFromBrowser(options?: { timeout?: number }): Promise<string> {
    const { timeout = 10000 } = options ?? {}
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      throw new Error('Geolocation is not supported by your browser.')
    }
    const position = await this.getPosition(timeout)
    return this.reverseGeocode(position.coords.latitude, position.coords.longitude)
  }

  private getPosition(timeout: number): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, () => {
        reject(new Error('Could not get your location. Check permissions or try entering it manually.'))
      }, { timeout })
    })
  }

  private async reverseGeocode(lat: number, lon: number): Promise<string> {
    const params = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lon),
      localityLanguage: 'en',
    })
    const res = await fetch(`${REVERSE_GEOCODE_URL}?${params}`)
    if (!res.ok) throw new Error('Could not resolve location name.')
    const data = (await res.json()) as {
      city?: string
      locality?: string
      principalSubdivision?: string
      countryName?: string
    }
    const parts = [data.city ?? data.locality, data.principalSubdivision, data.countryName].filter(Boolean)
    return parts.length > 0 ? parts.join(', ') : `${lat.toFixed(2)}, ${lon.toFixed(2)}`
  }
}
