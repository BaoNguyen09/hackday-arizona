/**
 * Floating mic volume indicator. Shown only when voice is active.
 * Lets the user see that they're being heard (bar fills with input level).
 */
export default function VolumeIndicator({ isActive, volume }) {
  if (!isActive) return null

  // RMS is typically 0–~0.3 for speech; scale for visibility and cap at 1
  const normalized = Math.min(1, volume * 4)

  return (
    <div
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-1"
      aria-live="polite"
      aria-label={`Mic level ${Math.round(normalized * 100)}%`}
    >
      <div className="flex items-end gap-0.5 h-8 px-3 py-2 rounded-full bg-[#1c1c1c]/95 border border-[#333] shadow-lg">
        {[0.2, 0.4, 0.6, 0.8, 1].map((threshold) => (
          <div
            key={threshold}
            className="w-1.5 rounded-sm bg-[#333] transition-all duration-75 min-h-[4px]"
            style={{
              height: `${Math.max(4, 20 * threshold)}px`,
              backgroundColor: normalized >= threshold ? '#f97316' : '#333',
            }}
          />
        ))}
      </div>
      <span className="text-[10px] text-[#9ca3af]">Mic level</span>
    </div>
  )
}
