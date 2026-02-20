/**
 * TODO:
 * - Toggle voice mode on/off
 * - When active: pulsing orange circle, connect useVoice hook
 * - When idle: solid orange circle
 * - Stop on tap or silence
 */
export default function MicButton({ lat, lng }) {
  const active = false // TODO: wire to useVoice hook

  return (
    <button
      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
        active
          ? 'bg-[#f97316] animate-pulse shadow-lg shadow-[#f97316]/50'
          : 'bg-[#1c1c1c] hover:bg-[#f97316]/20'
      }`}
    >
      🎙️
    </button>
  )
}
