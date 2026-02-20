/**
 * Toggle voice on/off; when active shows pulsing orange circle.
 * Receives useVoice controls from App so messages/widgetToken can be updated there.
 */
export default function MicButton({ isActive, onStart, onStop }) {
  const handleClick = () => {
    if (isActive) onStop()
    else onStart()
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
        isActive
          ? 'bg-[#f97316] animate-pulse shadow-lg shadow-[#f97316]/50'
          : 'bg-[#1c1c1c] hover:bg-[#f97316]/20'
      }`}
      aria-label={isActive ? 'Stop voice' : 'Start voice'}
    >
      🎙️
    </button>
  )
}
