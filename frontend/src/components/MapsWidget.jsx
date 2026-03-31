import { useEffect, useRef, useState } from 'react'

const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

const MAP_LOAD_TIMEOUT_MS = 12000

// Load Maps JS API (alpha) + places — required for Contextual View.
let mapsLoadPromise = null
function loadMapsForWidget() {
  if (mapsLoadPromise) return mapsLoadPromise
  if (!MAPS_API_KEY || !String(MAPS_API_KEY).trim()) return Promise.reject(new Error('No Maps API key'))
  mapsLoadPromise = new Promise((resolve, reject) => {
    const cb = '___mapsWidgetCallback'
    let settled = false
    const finish = (err) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      delete window[cb]
      if (err) reject(err)
      else resolve()
    }
    const timer = setTimeout(() => {
      finish(new Error('Map load timeout. Check VITE_GOOGLE_MAPS_API_KEY: enable Maps JavaScript API and Places API, and ensure billing is enabled on the project.'))
    }, MAP_LOAD_TIMEOUT_MS)
    window[cb] = () => {
      if (typeof window.google === 'undefined' || !window.google.maps) {
        finish(new Error('Maps API failed to load. Check your API key and that Maps JavaScript API and Places API are enabled.'))
        return
      }
      finish()
    }
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(MAPS_API_KEY)}&libraries=places&v=alpha&callback=${cb}`
    script.async = true
    script.onerror = () => finish(new Error('Maps script failed to load. Check your API key and network.'))
    document.head.appendChild(script)
  })
  return mapsLoadPromise
}

const DEFAULT_LAT = 32.2319
const DEFAULT_LNG = -110.9501

/**
 * When widgetToken is set, renders the official Google Maps Contextual View
 * (Maps JavaScript API + places library). When widgetToken is null, shows a
 * default map centered on lat/lng (or U of A). Requires VITE_GOOGLE_MAPS_API_KEY.
 */

function Placeholder() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-[#9ca3af]">
      <p className="text-4xl mb-2" aria-hidden>🍴 🗺️</p>
      <p>Ask me what you're craving</p>
    </div>
  )
}

export default function MapsWidget({ widgetToken, lat = DEFAULT_LAT, lng = DEFAULT_LNG }) {
  const containerRef = useRef(null)
  const cvRef = useRef(null)
  const defaultMapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const [apiReady, setApiReady] = useState(false)
  const [loadError, setLoadError] = useState(null)
  const [nearbyPlaces, setNearbyPlaces] = useState([])

  const needMap = widgetToken || (lat != null && lng != null)

  useEffect(() => {
    if (!needMap || !MAPS_API_KEY) return
    loadMapsForWidget()
      .then(() => {
        setLoadError(null)
        setApiReady(true)
      })
      .catch((e) => setLoadError(e?.message || 'Maps failed to load'))
  }, [needMap])

  useEffect(() => {
    if (!apiReady || !widgetToken || !cvRef.current) return
    try {
      cvRef.current.contextToken = widgetToken
    } catch (e) {
      const msg = e?.message || 'Failed to set map context'
      queueMicrotask(() => setLoadError(msg))
    }
  }, [apiReady, widgetToken])

  // Default map (no token): create map, keep center in sync, and fetch nearby restaurants
  useEffect(() => {
    if (!apiReady || widgetToken || !defaultMapRef.current || lat == null || lng == null) return
    const center = { lat: Number(lat), lng: Number(lng) }
    if (!mapInstanceRef.current) {
      const map = new window.google.maps.Map(defaultMapRef.current, {
        center,
        zoom: 14,
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: true,
      })
      mapInstanceRef.current = map
      const service = new window.google.maps.places.PlacesService(map)
      service.nearbySearch(
        { location: center, radius: 1500, type: 'restaurant' },
        (results, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && results?.length) {
            setNearbyPlaces(results)
          }
        }
      )
    } else {
      mapInstanceRef.current.setCenter(center)
    }
  }, [apiReady, widgetToken, lat, lng])

  // Clear default map and list when switching to contextual view
  useEffect(() => {
    if (widgetToken) {
      mapInstanceRef.current = null
      setNearbyPlaces([])
    }
  }, [widgetToken])

  // No token and no API key / no coords → placeholder
  if (!widgetToken && (!MAPS_API_KEY || lat == null || lng == null)) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center text-[#9ca3af]">
        <p className="text-4xl mb-2">🍴🗺️</p>
        <p>Ask me what you're craving</p>
      </div>
    )
  }

  if (!MAPS_API_KEY) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center text-[#9ca3af] p-4">
        <p className="text-4xl mb-2">🗺️</p>
        <p className="text-sm">Set <code className="bg-[#1c1c1c] px-1 rounded">VITE_GOOGLE_MAPS_API_KEY</code> in <code className="bg-[#1c1c1c] px-1 rounded">.env</code> to show the map.</p>
        <p className="text-xs mt-2">Enable Maps JavaScript API and Places API for the key. Restart the dev server after changing .env.</p>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center text-[#9ca3af] p-4">
        <p className="text-4xl mb-2">⚠️</p>
        <p className="text-sm">{loadError}</p>
        <p className="text-xs mt-2">In Google Cloud Console: enable Maps JavaScript API and Places API, and turn on billing for the project.</p>
      </div>
    )
  }

  if (!apiReady) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center text-[#9ca3af] p-4">
        <p>Loading map…</p>
        <p className="text-xs mt-2">If this sticks, check the browser console for API errors.</p>
      </div>
    )
  }

  // Default map + restaurant list when no widget token yet
  if (!widgetToken) {
    return (
      <div ref={containerRef} className="w-full h-full min-h-0 flex flex-col">
        <div ref={defaultMapRef} className="flex-1 min-h-0 w-full" />
        <div className="border-t border-[#1c1c1c] bg-[#0d0d0d] flex flex-col max-h-[220px] min-h-0">
          <p className="text-xs font-medium text-[#9ca3af] px-3 py-2 border-b border-[#1c1c1c]">
            Restaurants nearby
          </p>
          <ul className="overflow-auto flex-1 py-1 text-sm">
            {nearbyPlaces.length === 0 && (
              <li className="px-3 py-2 text-[#6b7280]">Loading…</li>
            )}
            {nearbyPlaces.map((place) => (
              <li key={place.place_id} className="px-3 py-1.5 text-[#e5e7eb] hover:bg-[#1c1c1c]">
                <span className="font-medium">{place.name}</span>
                {place.vicinity && (
                  <span className="block text-xs text-[#9ca3af] truncate">{place.vicinity}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="w-full h-full min-h-0">
      <gmp-place-contextual ref={cvRef} className="block w-full h-full" />
    </div>
  )
}
