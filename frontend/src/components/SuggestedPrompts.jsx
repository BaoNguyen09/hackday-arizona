const PROMPTS = [
  '🌮 Something cheap nearby',
  '☕ Quiet cafe to study',
  '🔥 Best spicy food under $15',
]

/**
 * TODO:
 * - Render as clickable pills below chat
 * - Hide after first user message (optional)
 */
export default function SuggestedPrompts({ onSelect }) {
  return (
    <div className="flex gap-2 px-4 pb-2">
      {PROMPTS.map((prompt) => (
        <button
          key={prompt}
          onClick={() => onSelect(prompt)}
          className="text-sm bg-[#EFD2C7] text-[#461C0C] px-3 py-1.5 rounded-full hover:bg-[#f97316]/20 hover:text-[#f97316] transition-colors"
        >
          {prompt}
        </button>
      ))}
    </div>
  )
}
