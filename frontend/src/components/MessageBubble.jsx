/**
 * TODO:
 * - User bubble: orange filled, right-aligned
 * - Assistant bubble: dark card with left orange border, left-aligned
 * - Support markdown rendering in assistant messages (optional)
 */
export default function MessageBubble({ role, content }) {
  const isUser = role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-xl px-4 py-2 ${
          isUser
            ? 'bg-[#f97316] text-white'
            : 'bg-[#1c1c1c] border-l-4 border-[#f97316]'
        }`}
      >
        {content}
      </div>
    </div>
  )
}
