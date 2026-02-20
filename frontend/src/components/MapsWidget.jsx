import { useEffect, useRef, useState } from 'react'

const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

// Load Maps JS API (alpha) + places — required for Contextual View.
let mapsLoadPromise = null
function loadMapsForWidget() {
  if (mapsLoadPromise) return mapsLoadPromise
  if (!MAPS_API_KEY) return Promise.reject(new Error('No Maps API key'))
  mapsLoadPromise = new Promise((resolve, reject) => {
    const cb = '___mapsWidgetCallback'
    window[cb] = () => {
      delete window[cb]
      if (typeof window.google === 'undefined' || !window.google.maps) {
        reject(new Error('Maps API failed to load'))
        return
      }
      resolve()
    }
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(MAPS_API_KEY)}&libraries=places&callback=${cb}`
    script.async = true
    script.onerror = () => {
      delete window[cb]
      reject(new Error('Maps script failed to load'))
    }
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

  // Default map (no token): create map and keep center in sync with lat/lng
  useEffect(() => {
    if (!apiReady || widgetToken || !defaultMapRef.current || lat == null || lng == null) return
    const center = { lat: Number(lat), lng: Number(lng) }
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new window.google.maps.Map(defaultMapRef.current, {
        center,
        zoom: 14,
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: true,
      })
    } else {
      mapInstanceRef.current.setCenter(center)
    }
  }, [apiReady, widgetToken, lat, lng])

  // Clear default map when switching to contextual view
  useEffect(() => {
    if (widgetToken) mapInstanceRef.current = null
  }, [widgetToken])

  // No token and no API key / no coords → placeholder
  if (!widgetToken && (!MAPS_API_KEY || lat == null || lng == null)) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-[#9ca3af]">
        <p className="text-4xl mb-2">🍴🗺️</p>
        <p>Ask me what you're craving</p>
      </div>
    )
  }

  if (!MAPS_API_KEY) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-[#9ca3af] p-4">
        <p className="text-4xl mb-2">🗺️</p>
        <p className="text-sm">Set <code className="bg-[#1c1c1c] px-1 rounded">VITE_GOOGLE_MAPS_API_KEY</code> in <code className="bg-[#1c1c1c] px-1 rounded">.env</code> to show the map.</p>
        <p className="text-xs mt-2">Enable Maps JavaScript API and Places API for the key.</p>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-[#9ca3af] p-4">
        <p className="text-4xl mb-2">⚠️</p>
        <p className="text-sm">{loadError}</p>
      </div>
    )
  }

  if (!apiReady) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-[#9ca3af]">
        <p>Loading map…</p>
      </div>
    )
  }

  // Default map when no widget token yet
  if (!widgetToken) {
    return (
      <div ref={containerRef} className="w-full h-full min-h-0">
        <div ref={defaultMapRef} className="w-full h-full" />
      </div>
    )
  }

  return (
    <div ref={containerRef} className="w-full h-full min-h-0">
      <gmp-place-contextual ref={cvRef} className="block w-full h-full" />
    </div>
  )
}
