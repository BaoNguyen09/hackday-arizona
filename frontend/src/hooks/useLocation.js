import { useState, useEffect } from 'react'

const DEFAULT_LAT = 32.2319
const DEFAULT_LNG = -110.9501

/**
 * TODO:
 * - Request browser geolocation on mount
 * - Fall back to U of A coords on denial/error
 * - Return { lat, lng, error }
 */
export function useLocation() {
  const [coords, setCoords] = useState({ lat: DEFAULT_LAT, lng: DEFAULT_LNG })

  useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {} // silently fall back to defaults
    )
  }, [])

  return coords
}
