import { useState, useEffect, useCallback } from 'react'

const DEFAULT_LAT = 32.2319
const DEFAULT_LNG = -110.9501
const OPTIONS = { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }

/**
 * Requests browser geolocation on mount. On denial/error, falls back to U of A
 * and sets error. Returns requestLocation() so the UI can offer "Use my location"
 * to retry after the user allows in browser settings.
 */
export function useLocation() {
  const [state, setState] = useState({
    lat: DEFAULT_LAT,
    lng: DEFAULT_LNG,
    error: null,
  })

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState((s) => ({ ...s, error: 'Geolocation not supported' }))
      return
    }
    setState((s) => ({ ...s, error: null }))
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          error: null,
        })
      },
      () => {
        setState((s) => ({ ...s, error: 'Location denied or unavailable' }))
      },
      OPTIONS
    )
  }, [])

  useEffect(() => {
    if (!navigator.geolocation) {
      queueMicrotask(() =>
        setState((s) => ({ ...s, error: 'Geolocation not supported' }))
      )
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          error: null,
        })
      },
      () => {
        setState((s) => ({ ...s, error: 'Location denied or unavailable' }))
      },
      OPTIONS
    )
  }, [])

  return { ...state, requestLocation }
}
