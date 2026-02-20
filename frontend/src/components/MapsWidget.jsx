/**
 * Maps widget for Gemini Maps grounding.
 * - iframe src: https://www.google.com/maps/embed?widget_token=TOKEN
 *   (Gemini/Vertex returns googleMapsWidgetContextToken; embed accepts widget_token query param.)
 * - When widgetToken is null or invalid, show placeholder (fork + map icon).
 * - Iframe is keyed by token so stale/invalid tokens get replaced on new response; we avoid
 *   rendering obviously bad tokens so the iframe doesn't show a broken experience.
 */

const EMBED_BASE = 'https://www.google.com/maps/embed'

function isValidWidgetToken(token) {
  if (token == null || typeof token !== 'string') return false
  const t = token.trim()
  // Token is typically long and often starts with "widgetcontent/"
  return t.length >= 20 && !/^\s*$/.test(t)
}

function Placeholder() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-[#9ca3af]">
      <p className="text-4xl mb-2" aria-hidden>🍴 🗺️</p>
      <p>Ask me what you're craving</p>
    </div>
  )
}

export default function MapsWidget({ widgetToken }) {
  const showIframe = isValidWidgetToken(widgetToken)
  const src = showIframe
    ? `${EMBED_BASE}?widget_token=${encodeURIComponent(widgetToken.trim())}`
    : null

  if (!showIframe) {
    return <Placeholder />
  }

  return (
    <iframe
      key={widgetToken}
      className="w-full h-full border-0 min-h-0"
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      src={src}
      title="Dishcovery map"
    />
  )
}
