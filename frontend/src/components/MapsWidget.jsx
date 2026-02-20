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
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(MAPS_API_KEY)}&v=alpha&libraries=places&callback=${cb}`
    script.async = true
    script.onerror = () => {
      delete window[cb]
      reject(new Error('Maps script failed to load'))
    }
    document.head.appendChild(script)
  })
  return mapsLoadPromise
}

/**
 * When widgetToken is set, renders the official Google Maps Contextual View
 * (Maps JavaScript API + places library). Requires VITE_GOOGLE_MAPS_API_KEY.
 * When widgetToken is null, shows placeholder.
 */
export default function MapsWidget({ widgetToken }) {
  const containerRef = useRef(null)
  const cvRef = useRef(null)
  const [apiReady, setApiReady] = useState(false)
  const [loadError, setLoadError] = useState(null)

  useEffect(() => {
    if (!widgetToken || !MAPS_API_KEY) return
    loadMapsForWidget()
      .then(() => {
        setLoadError(null)
        setApiReady(true)
      })
      .catch((e) => setLoadError(e?.message || 'Maps failed to load'))
  }, [widgetToken])

  useEffect(() => {
    if (!apiReady || !widgetToken || !cvRef.current) return
    try {
      cvRef.current.contextToken = widgetToken
    } catch (e) {
      const msg = e?.message || 'Failed to set map context'
      queueMicrotask(() => setLoadError(msg))
    }
  }, [apiReady, widgetToken])

  if (!widgetToken) {
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

  return (
    <div ref={containerRef} className="w-full h-full min-h-0">
      <gmp-place-contextual ref={cvRef} className="block w-full h-full" />
    </div>
  )
}
