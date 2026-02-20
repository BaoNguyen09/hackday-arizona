/**
 * TODO:
 * - When widgetToken is non-null, render Google Maps widget iframe
 * - iframe src format: check Gemini Maps grounding docs for widget URL
 * - When widgetToken is null, show placeholder with fork+map icon
 */
export default function MapsWidget({ widgetToken }) {
  if (!widgetToken) {
    return (
      <div className="text-center text-[#9ca3af]">
        <p className="text-4xl mb-2">🍴🗺️</p>
        <p>Ask me what you're craving</p>
      </div>
    )
  }

  return (
    <iframe
      className="w-full h-full border-0"
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      src={`https://www.google.com/maps/embed?widget_token=${widgetToken}`}
      title="Dishcovery map"
    />
  )
}
